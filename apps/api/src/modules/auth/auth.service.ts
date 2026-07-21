import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { RoleName } from '@prisma/client';
import { DOMAIN_RESTRICTION_MESSAGE } from '@knowledgehub/types';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private readonly bootstrapAdminEmails = new Set(['eram.fatima@tothenew.com']);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId'),
    );
  }

  private get allowedDomain(): string {
    return (
      this.configService.get<string>('app.allowedEmailDomain') ?? 'tothenew.com'
    );
  }

  private parseDurationToMs(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private async verifyGoogleIdToken(idToken: string) {
    const clientId = this.configService.get<string>('google.clientId');

    if (!clientId) {
      throw new UnauthorizedException('Google OAuth is not configured');
    }

    let ticket;
    try {
      ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const email = payload.email.toLowerCase();
    const domain = email.split('@')[1];

    if (domain !== this.allowedDomain) {
      throw new ForbiddenException(DOMAIN_RESTRICTION_MESSAGE);
    }

    return {
      email,
      googleId: payload.sub,
      name: payload.name ?? email.split('@')[0],
      avatarUrl: payload.picture,
    };
  }

  private buildAccessToken(user: AuthenticatedUser): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles,
      },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: (this.configService.get<string>('jwt.accessExpiresIn') ?? '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );
  }

  private async issueTokens(userRecord: NonNullable<
    Awaited<ReturnType<UsersRepository['findById']>>
  >) {
    const user = this.usersService.toAuthUser(userRecord);
    const accessToken = this.buildAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    });

    const refreshToken = this.refreshTokenRepository.generateToken();
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const expiresAt = new Date(
      Date.now() + this.parseDurationToMs(refreshExpiresIn),
    );

    await this.refreshTokenRepository.create(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async loginWithGoogle(idToken: string) {
    const profile = await this.verifyGoogleIdToken(idToken);

    let user =
      (await this.usersRepository.findByGoogleId(profile.googleId)) ??
      (await this.usersRepository.findByEmail(profile.email));

    if (!user) {
      user = await this.usersRepository.createFromGoogle(profile);
    } else {
      user = await this.usersRepository.updateLogin(user.id);
    }

    if (this.bootstrapAdminEmails.has(profile.email)) {
      await this.usersRepository.assignRole(user.id, RoleName.ADMIN);
      user = (await this.usersRepository.findById(user.id)) ?? user;
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const stored = await this.refreshTokenRepository.findValid(refreshToken);

    if (!stored) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.refreshTokenRepository.revoke(refreshToken);

    const user = await this.usersRepository.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.issueTokens(user);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.refreshTokenRepository.revoke(refreshToken);
    }
    return { success: true };
  }
}

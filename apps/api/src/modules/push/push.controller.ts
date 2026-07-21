import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribePushDto } from './dto/subscribe-push.dto';

@ApiTags('Push')
@ApiBearerAuth()
@Controller('push')
export class PushController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'Get VAPID public key for browser push subscription' })
  vapidPublicKey() {
    return {
      data: {
        publicKey:
          this.configService.get<string>('push.vapidPublicKey') ?? null,
      },
    };
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Register browser push subscription' })
  async subscribe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubscribePushDto,
  ) {
    const subscription = await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: {
        userId: user.id,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
      create: {
        userId: user.id,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
    });

    return { data: { id: subscription.id } };
  }

  @Delete('subscribe')
  @ApiOperation({ summary: 'Remove browser push subscription' })
  async unsubscribe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubscribePushDto,
  ) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId: user.id, endpoint: dto.endpoint },
    });
    return { data: { success: true } };
  }
}

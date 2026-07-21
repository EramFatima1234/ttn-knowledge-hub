import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DEMO_OPEN_ADMIN_ACCESS } from '../../config/demo-access';
import { PERMISSIONS_KEY } from '../decorators/auth.decorators';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { UsersRepository } from '../../modules/users/users.repository';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;

    // TODO(demo): Remove when DEMO_OPEN_ADMIN_ACCESS is false (production RBAC).
    if (DEMO_OPEN_ADMIN_ACCESS && user?.id) {
      return true;
    }

    const permissions = await this.usersRepository.getUserPermissionSlugs(
      user.id,
    );

    const hasPermission = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

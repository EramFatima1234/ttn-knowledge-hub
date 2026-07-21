import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { DEMO_OPEN_ADMIN_ACCESS } from '../../config/demo-access';
import { ROLES_KEY } from '../decorators/auth.decorators';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;

    // TODO(demo): Remove block when DEMO_OPEN_ADMIN_ACCESS is false (production RBAC).
    if (DEMO_OPEN_ADMIN_ACCESS && user?.id) {
      if (requiredRoles.includes(RoleName.ADMIN)) {
        return true;
      }
    }

    if (!user?.roles?.length) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const hasRole = requiredRoles.some((role) =>
      user.roles.includes(role as unknown as string),
    );

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

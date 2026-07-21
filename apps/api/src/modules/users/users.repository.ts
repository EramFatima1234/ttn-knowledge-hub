import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  findByGoogleId(googleId: string) {
    return this.prisma.user.findFirst({
      where: { googleId, deletedAt: null },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  async createFromGoogle(data: {
    email: string;
    name: string;
    avatarUrl?: string;
    googleId: string;
  }) {
    const userRole = await this.prisma.role.findUnique({
      where: { name: RoleName.USER },
    });

    if (!userRole) {
      throw new ServiceUnavailableException(
        'Default USER role not found. Run: pnpm db:seed',
      );
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
        googleId: data.googleId,
        lastLoginAt: new Date(),
        roles: {
          create: [{ roleId: userRole.id }],
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  updateLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: { include: { role: true } },
        },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return { items, total, page, limit };
  }

  async assignRole(userId: string, roleName: RoleName) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new ServiceUnavailableException(
        `Role ${roleName} not found. Run: pnpm db:seed`,
      );
    }

    return this.prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
      update: {},
      create: { userId, roleId: role.id },
    });
  }

  async removeRole(userId: string, roleName: RoleName) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) return null;

    return this.prisma.userRole.deleteMany({
      where: { userId, roleId: role.id },
    });
  }

  async getUserPermissionSlugs(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const slugs = new Set<string>();
    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        slugs.add(rolePermission.permission.slug);
      }
    }

    return Array.from(slugs);
  }
}

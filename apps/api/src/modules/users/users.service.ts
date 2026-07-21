import { Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { UsersRepository } from './users.repository';

type UserWithRoles = NonNullable<Awaited<ReturnType<UsersRepository['findById']>>>;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  toAuthUser(user: UserWithRoles) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roles: user.roles.map((ur) => ur.role.name),
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  getMe(userId: string) {
    return this.usersRepository.findById(userId);
  }

  listUsers(page?: number, limit?: number) {
    return this.usersRepository.listUsers(page, limit);
  }

  assignRole(userId: string, roleName: RoleName) {
    return this.usersRepository.assignRole(userId, roleName);
  }

  removeRole(userId: string, roleName: RoleName) {
    return this.usersRepository.removeRole(userId, roleName);
  }
}

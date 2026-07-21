import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { Permissions } from '../../common/decorators/auth.decorators';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@CurrentUser() user: AuthenticatedUser) {
    const record = await this.usersService.getMe(user.id);
    return { data: this.usersService.toAuthUser(record!) };
  }

  @Get()
  @Permissions('users:manage')
  @ApiOperation({ summary: 'List users (Admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const result = await this.usersService.listUsers(
      parseInt(page, 10),
      parseInt(limit, 10),
    );

    return {
      data: result.items.map((user) => this.usersService.toAuthUser(user)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.page * result.limit < result.total,
      },
    };
  }

  @Post(':id/roles')
  @Permissions('users:manage')
  @ApiOperation({ summary: 'Assign role to user (Admin)' })
  async assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    await this.usersService.assignRole(id, dto.role);
    const user = await this.usersService.getMe(id);
    return { data: this.usersService.toAuthUser(user!) };
  }

  @Delete(':id/roles/:role')
  @Permissions('users:manage')
  @ApiOperation({ summary: 'Remove role from user (Admin)' })
  async removeRole(@Param('id') id: string, @Param('role') role: RoleName) {
    await this.usersService.removeRole(id, role);
    const user = await this.usersService.getMe(id);
    return { data: this.usersService.toAuthUser(user!) };
  }
}

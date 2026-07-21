import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

export class AssignRoleDto {
  @ApiProperty({ enum: RoleName, example: RoleName.TEAM })
  @IsEnum(RoleName)
  role!: RoleName;
}

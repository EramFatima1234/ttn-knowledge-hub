import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourceKind, RoleName } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ResourcesService } from './resources.service';

class UpsertResourceDto {
  @ApiProperty({ enum: ResourceKind })
  @IsEnum(ResourceKind)
  resourceKind!: ResourceKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileName?: string;
}

@ApiTags('Resources')
@ApiBearerAuth()
@Controller()
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('videos/:videoId/resources')
  @ApiOperation({ summary: 'List session resources' })
  list(@Param('videoId') videoId: string) {
    return this.resourcesService.listForVideo(videoId);
  }

  @Post('videos/:videoId/resources')
  @Roles(RoleName.ADMIN, RoleName.TEAM)
  @ApiOperation({ summary: 'Add resource to video' })
  create(
    @Param('videoId') videoId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertResourceDto,
  ) {
    const isAdmin = user.roles.includes(RoleName.ADMIN);
    return this.resourcesService.upsertForVideo(videoId, user.id, isAdmin, dto);
  }
}

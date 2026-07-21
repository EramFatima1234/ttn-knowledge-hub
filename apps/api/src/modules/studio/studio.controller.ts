import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentType, RoleName } from '@prisma/client';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { StudioService, StudioStep } from './studio.service';

class SaveDraftDto {
  @ApiProperty()
  @IsString()
  step!: StudioStep;

  @ApiProperty()
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentId?: string;
}

@ApiTags('Studio')
@ApiBearerAuth()
@Roles(RoleName.ADMIN, RoleName.TEAM)
@Controller('studio')
export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  @Get('drafts/:contentType')
  @ApiOperation({ summary: 'Get upload studio draft (autosave)' })
  getDraft(
    @Param('contentType') contentType: ContentType,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.studioService.getDraft(user.id, contentType);
  }

  @Put('drafts/:contentType')
  @ApiOperation({ summary: 'Save upload studio draft' })
  saveDraft(
    @Param('contentType') contentType: ContentType,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SaveDraftDto,
  ) {
    return this.studioService.saveDraft(
      user.id,
      contentType,
      dto.contentId ?? '',
      dto.step,
      dto.payload,
    );
  }

  @Post('videos/:id/publish')
  @ApiOperation({ summary: 'Publish video from studio draft' })
  publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.studioService.publishFromDraft(user.id, id);
  }
}

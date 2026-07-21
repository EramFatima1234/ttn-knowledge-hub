import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EngagementRepository } from './engagement.repository';

class CreateCommentDto {
  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType!: ContentType;

  @ApiProperty()
  @IsUUID()
  contentId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

class BookmarkDto {
  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType!: ContentType;

  @ApiProperty()
  @IsUUID()
  contentId!: string;
}

class UpsertHistoryDto {
  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType!: ContentType;

  @ApiProperty()
  @IsUUID()
  contentId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  progressSeconds!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

@ApiTags('Engagement')
@ApiBearerAuth()
@Controller()
export class EngagementController {
  constructor(private readonly engagementRepository: EngagementRepository) {}

  @Get('comments')
  @ApiOperation({ summary: 'List comments for content' })
  @ApiQuery({ name: 'contentType', enum: ContentType })
  @ApiQuery({ name: 'contentId' })
  listComments(
    @Query() pagination: PaginationDto,
    @Query('contentType') contentType: ContentType,
    @Query('contentId') contentId: string,
  ) {
    return this.engagementRepository.listComments(
      contentType,
      contentId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
    );
  }

  @Post('comments')
  @ApiOperation({ summary: 'Create comment or reply' })
  createComment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.engagementRepository.createComment({
      userId: user.id,
      ...dto,
    });
  }

  @Get('bookmarks')
  @ApiOperation({ summary: 'List user bookmarks' })
  @ApiQuery({ name: 'contentType', required: false, enum: ContentType })
  listBookmarks(
    @CurrentUser() user: AuthenticatedUser,
    @Query('contentType') contentType?: ContentType,
  ) {
    return this.engagementRepository.listBookmarks(user.id, contentType);
  }

  @Post('bookmarks')
  @ApiOperation({ summary: 'Toggle bookmark' })
  toggleBookmark(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BookmarkDto,
  ) {
    return this.engagementRepository.toggleBookmark(
      user.id,
      dto.contentType,
      dto.contentId,
    );
  }

  @Get('history/continue-watching')
  @ApiOperation({ summary: 'Continue watching list' })
  continueWatching(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit = '10',
  ) {
    return this.engagementRepository.getContinueWatching(
      user.id,
      parseInt(limit, 10),
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Watch history' })
  listHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit = '50',
  ) {
    return this.engagementRepository.listHistory(
      user.id,
      parseInt(limit, 10),
    );
  }

  @Put('history')
  @ApiOperation({ summary: 'Update watch progress' })
  upsertHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertHistoryDto,
  ) {
    return this.engagementRepository.upsertHistory({
      userId: user.id,
      ...dto,
    });
  }
}

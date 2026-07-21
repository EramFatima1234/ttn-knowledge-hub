import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import {
  Permissions,
  Roles,
} from '../../common/decorators/auth.decorators';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';
import { VideosService } from './videos.service';

@ApiTags('Videos')
@ApiBearerAuth()
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({ summary: 'List published videos' })
  @ApiQuery({ name: 'competencyId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest', 'popular'] })
  list(
    @Query() pagination: PaginationDto,
    @Query('competencyId') competencyId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('sort') sort?: string,
  ) {
    return this.videosService.list({
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 20,
      competencyId,
      categoryId,
      sort: sort ?? 'newest',
    });
  }

  @Get('mine')
  @Roles(RoleName.ADMIN, RoleName.TEAM)
  @ApiOperation({ summary: 'List my uploads (Team)' })
  listMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() pagination: PaginationDto,
  ) {
    return this.videosService.listMine(
      user.id,
      pagination.page ?? 1,
      pagination.limit ?? 20,
    );
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.TEAM)
  @Permissions('content:create')
  @ApiOperation({ summary: 'Create video draft' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVideoDto) {
    return this.videosService.create(user.id, dto);
  }

  @Get(':id/playback')
  @ApiOperation({ summary: 'Playback manifest with resume and next episode' })
  playback(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.videosService.getPlayback(id, user.id);
  }

  @Get(':id/stream')
  @ApiOperation({ summary: 'Stream video with HTTP range support' })
  stream(
    @Param('id') id: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.videosService.streamVideo(id, req, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video detail' })
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.videosService.getById(id, user.id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.TEAM)
  @ApiOperation({ summary: 'Update video draft' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateVideoDto,
  ) {
    const isAdmin = user.roles.includes(RoleName.ADMIN);
    return this.videosService.update(id, user.id, dto, isAdmin);
  }

  @Post(':id/submit')
  @Roles(RoleName.ADMIN, RoleName.TEAM)
  @ApiOperation({ summary: 'Submit video for approval' })
  submit(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const isAdmin = user.roles.includes(RoleName.ADMIN);
    return this.videosService.submit(id, user.id, isAdmin);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment video view count' })
  recordView(@Param('id') id: string) {
    return this.videosService.recordView(id);
  }
}

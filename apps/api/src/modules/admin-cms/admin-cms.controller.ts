import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AdminCmsService } from './admin-cms.service';
import { CreateCompetencyDto, UpdateCompetencyDto } from './dto/competency.dto';
import { CreateMeetDto, UpdateMeetDto } from './dto/meet.dto';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';
import {
  CreateEpisodeDto,
  CreateSeriesDto,
  ReorderEpisodesDto,
  UpdateEpisodeDto,
  UpdateSeriesDto,
} from './dto/series.dto';
import { CreateSpeakerDto, UpdateSpeakerDto } from './dto/speaker.dto';
import { UpdateHomepageLayoutDto } from './dto/homepage.dto';
import { UpdatePlatformSettingsDto } from './dto/platform-settings.dto';
import { UploadMeetRecordingDto } from './dto/team-meet.dto';

@ApiTags('Admin CMS')
@ApiBearerAuth()
@Roles(RoleName.ADMIN)
@Controller('admin/cms')
export class AdminCmsController {
  constructor(private readonly adminCmsService: AdminCmsService) {}

  // Meets
  @Get('meets')
  @ApiOperation({ summary: 'List all knowledge meets (admin)' })
  listMeets() {
    return this.adminCmsService.listMeets();
  }

  @Get('meets/:id')
  getMeet(@Param('id') id: string) {
    return this.adminCmsService.getMeet(id);
  }

  @Post('meets')
  createMeet(@Body() dto: CreateMeetDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminCmsService.createMeet(dto, user.id);
  }

  @Patch('meets/:id')
  updateMeet(@Param('id') id: string, @Body() dto: UpdateMeetDto) {
    return this.adminCmsService.updateMeet(id, dto);
  }

  @Put('meets/:id/recording')
  @ApiOperation({ summary: 'Upload or replace knowledge meet session recording' })
  uploadMeetRecording(
    @Param('id') id: string,
    @Body() dto: UploadMeetRecordingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminCmsService.upsertMeetRecording(
      id,
      { ...dto, cmsStatus: dto.cmsStatus ?? 'PUBLISHED' },
      user.id,
    );
  }

  @Delete('meets/:id')
  deleteMeet(@Param('id') id: string) {
    return this.adminCmsService.deleteMeet(id);
  }

  @Post('meets/:id/duplicate')
  duplicateMeet(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminCmsService.duplicateMeet(id, user.id);
  }

  // Series
  @Get('series')
  listSeries() {
    return this.adminCmsService.listSeries();
  }

  @Get('series/:id')
  getSeries(@Param('id') id: string) {
    return this.adminCmsService.getSeries(id);
  }

  @Post('series')
  createSeries(@Body() dto: CreateSeriesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminCmsService.createSeries(dto, user.id);
  }

  @Patch('series/:id')
  updateSeries(@Param('id') id: string, @Body() dto: UpdateSeriesDto) {
    return this.adminCmsService.updateSeries(id, dto);
  }

  @Delete('series/:id')
  deleteSeries(@Param('id') id: string) {
    return this.adminCmsService.deleteSeries(id);
  }

  // Episodes
  @Get('series/:seriesId/episodes')
  listEpisodes(@Param('seriesId') seriesId: string) {
    return this.adminCmsService.listEpisodes(seriesId);
  }

  @Post('series/:seriesId/episodes')
  createEpisode(
    @Param('seriesId') seriesId: string,
    @Body() dto: CreateEpisodeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminCmsService.createEpisode(seriesId, dto, user.id);
  }

  @Patch('series/:seriesId/episodes/:episodeId')
  updateEpisode(
    @Param('seriesId') seriesId: string,
    @Param('episodeId') episodeId: string,
    @Body() dto: UpdateEpisodeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminCmsService.updateEpisode(seriesId, episodeId, dto, user.id);
  }

  @Delete('series/:seriesId/episodes/:episodeId')
  deleteEpisode(
    @Param('seriesId') seriesId: string,
    @Param('episodeId') episodeId: string,
  ) {
    return this.adminCmsService.deleteEpisode(seriesId, episodeId);
  }

  @Put('series/:seriesId/episodes/reorder')
  reorderEpisodes(
    @Param('seriesId') seriesId: string,
    @Body() dto: ReorderEpisodesDto,
  ) {
    return this.adminCmsService.reorderEpisodes(seriesId, dto.orderedIds);
  }

  // Resources
  @Get('resources')
  listResources() {
    return this.adminCmsService.listResources();
  }

  @Post('resources')
  createResource(@Body() dto: CreateResourceDto) {
    return this.adminCmsService.createResource(dto);
  }

  @Patch('resources/:id')
  updateResource(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return this.adminCmsService.updateResource(id, dto);
  }

  @Delete('resources/:id')
  deleteResource(@Param('id') id: string) {
    return this.adminCmsService.deleteResource(id);
  }

  // Speakers
  @Get('speakers')
  listSpeakers() {
    return this.adminCmsService.listSpeakers();
  }

  @Get('speakers/:id')
  getSpeaker(@Param('id') id: string) {
    return this.adminCmsService.getSpeaker(id);
  }

  @Post('speakers')
  createSpeaker(@Body() dto: CreateSpeakerDto) {
    return this.adminCmsService.createSpeaker(dto);
  }

  @Patch('speakers/:id')
  updateSpeaker(@Param('id') id: string, @Body() dto: UpdateSpeakerDto) {
    return this.adminCmsService.updateSpeaker(id, dto);
  }

  @Delete('speakers/:id')
  deleteSpeaker(@Param('id') id: string) {
    return this.adminCmsService.deleteSpeaker(id);
  }

  // Competencies
  @Get('competencies')
  listCompetencies() {
    return this.adminCmsService.listCompetencies();
  }

  @Post('competencies')
  createCompetency(@Body() dto: CreateCompetencyDto) {
    return this.adminCmsService.createCompetency(dto);
  }

  @Patch('competencies/:id')
  updateCompetency(@Param('id') id: string, @Body() dto: UpdateCompetencyDto) {
    return this.adminCmsService.updateCompetency(id, dto);
  }

  @Delete('competencies/:id')
  deleteCompetency(@Param('id') id: string) {
    return this.adminCmsService.deleteCompetency(id);
  }

  // Homepage layout
  @Get('homepage')
  @ApiOperation({ summary: 'Get homepage section layout' })
  getHomepageLayout() {
    return this.adminCmsService.getHomepageLayout();
  }

  @Put('homepage')
  @ApiOperation({ summary: 'Update homepage section layout' })
  updateHomepageLayout(@Body() dto: UpdateHomepageLayoutDto) {
    return this.adminCmsService.updateHomepageLayout(dto);
  }

  // Platform settings
  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings' })
  getPlatformSettings() {
    return this.adminCmsService.getPlatformSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update platform settings' })
  updatePlatformSettings(@Body() dto: UpdatePlatformSettingsDto) {
    return this.adminCmsService.updatePlatformSettings(dto);
  }
}

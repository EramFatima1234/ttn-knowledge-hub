import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { Permissions, Roles } from '../../common/decorators/auth.decorators';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { VideosService } from '../videos/videos.service';
import { SearchService } from '../search/search.service';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';
import { SearchIndexService } from '../search/search-index.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(RoleName.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly analyticsService: AnalyticsService,
    private readonly videosService: VideosService,
    private readonly searchIndexService: SearchIndexService,
    private readonly searchService: SearchService,
  ) {}

  @Get('overview')
  @Permissions('analytics:view')
  @ApiOperation({ summary: 'Admin analytics overview' })
  overview() {
    return this.adminService.overview();
  }

  @Get('analytics')
  @Permissions('analytics:view')
  @ApiOperation({ summary: 'Detailed admin analytics dashboard' })
  analytics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getAnalytics(query.days ?? 30);
  }

  @Get('reports')
  @Permissions('analytics:view')
  @ApiOperation({ summary: 'Platform reports summary' })
  reports() {
    return this.analyticsService.getReports();
  }

  @Get('search/analytics')
  @Permissions('analytics:view')
  @ApiOperation({ summary: 'Search analytics dashboard data' })
  searchAnalytics() {
    return this.searchService.searchAnalyticsDashboard();
  }

  @Get('feedback/recent')
  @Permissions('analytics:view')
  @ApiOperation({ summary: 'Recent session feedback' })
  recentFeedback() {
    return this.adminService.recentFeedback();
  }

  @Post('search/reindex')
  @Permissions('analytics:view')
  @ApiOperation({ summary: 'Reindex searchable content into Elasticsearch' })
  reindexSearch() {
    return this.searchIndexService.reindexAll().then((result) => ({ data: result }));
  }

  @Get('approvals/pending')
  @Permissions('content:approve')
  @ApiOperation({ summary: 'Pending content approvals (videos, meet recordings, series episodes)' })
  pendingApprovals(@Query() pagination: PaginationDto) {
    return this.videosService.listPending(
      pagination.page ?? 1,
      pagination.limit ?? 20,
    );
  }

  @Post('approvals/:id/approve')
  @Permissions('content:approve')
  @ApiOperation({ summary: 'Approve video' })
  approve(@Param('id') id: string) {
    return this.videosService.approve(id);
  }

  @Post('approvals/:id/reject')
  @Permissions('content:approve')
  @ApiOperation({ summary: 'Reject video back to draft' })
  reject(@Param('id') id: string) {
    return this.videosService.reject(id);
  }

  @Get('announcements')
  @Permissions('announcements:manage')
  @ApiOperation({ summary: 'List all announcements' })
  listAnnouncements() {
    return this.adminService.listAnnouncements();
  }

  @Post('announcements')
  @Permissions('announcements:manage')
  @ApiOperation({ summary: 'Create announcement' })
  createAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.adminService.createAnnouncement(dto);
  }

  @Patch('announcements/:id')
  @Permissions('announcements:manage')
  @ApiOperation({ summary: 'Update announcement' })
  updateAnnouncement(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.adminService.updateAnnouncement(id, dto);
  }

  @Delete('announcements/:id')
  @Permissions('announcements:manage')
  @ApiOperation({ summary: 'Delete announcement' })
  deleteAnnouncement(@Param('id') id: string) {
    return this.adminService.deleteAnnouncement(id);
  }
}

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Active announcements for home' })
  listActive() {
    return this.adminService.listActiveAnnouncements();
  }
}

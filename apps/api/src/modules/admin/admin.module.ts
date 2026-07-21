import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { SearchModule } from '../search/search.module';
import { VideosModule } from '../videos/videos.module';
import { AdminController, AnnouncementsController } from './admin.controller';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [VideosModule, NotificationsModule, SearchModule],
  controllers: [AdminController, AnnouncementsController],
  providers: [AdminService, AnalyticsService],
  exports: [AdminService],
})
export class AdminModule {}

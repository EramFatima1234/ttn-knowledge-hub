import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SearchModule } from '../search/search.module';
import { AdminCmsController } from './admin-cms.controller';
import { AdminCmsService } from './admin-cms.service';
import { PlatformController } from './platform.controller';
import { TeamSeriesController } from './team-series.controller';
import { TeamMeetsController } from './team-meets.controller';

@Module({
  imports: [StorageModule, NotificationsModule, SearchModule],
  controllers: [AdminCmsController, TeamSeriesController, TeamMeetsController, PlatformController],
  providers: [AdminCmsService],
  exports: [AdminCmsService],
})
export class AdminCmsModule {}

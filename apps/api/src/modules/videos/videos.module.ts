import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProgressModule } from '../progress/progress.module';
import { SearchModule } from '../search/search.module';
import { StorageModule } from '../storage/storage.module';
import { VideosController } from './videos.controller';
import { VideosRepository } from './videos.repository';
import { VideosService } from './videos.service';
import { StreamingService } from './streaming.service';

@Module({
  imports: [NotificationsModule, SearchModule, ProgressModule, StorageModule],
  controllers: [VideosController],
  providers: [VideosService, VideosRepository, StreamingService],
  exports: [VideosRepository, VideosService, StreamingService],
})
export class VideosModule {}

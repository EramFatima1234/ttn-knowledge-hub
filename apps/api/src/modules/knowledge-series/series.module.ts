import { Module } from '@nestjs/common';
import { VideosModule } from '../videos/videos.module';
import { SeriesController } from './series.controller';
import { SeriesRepository } from './series.repository';
import { SeriesService } from './series.service';

@Module({
  imports: [VideosModule],
  controllers: [SeriesController],
  providers: [SeriesService, SeriesRepository],
  exports: [SeriesRepository, SeriesService],
})
export class KnowledgeSeriesModule {}

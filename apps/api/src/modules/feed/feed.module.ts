import { Module } from '@nestjs/common';
import { EngagementModule } from '../engagement/engagement.module';
import { KnowledgeMeetsModule } from '../knowledge-meets/meets.module';
import { KnowledgeSeriesModule } from '../knowledge-series/series.module';
import { ProgressModule } from '../progress/progress.module';
import { VideosModule } from '../videos/videos.module';
import { FeedController } from './feed.controller';
import { HomepageFeedService } from './homepage-feed.service';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [
    VideosModule,
    KnowledgeMeetsModule,
    KnowledgeSeriesModule,
    EngagementModule,
    ProgressModule,
  ],
  controllers: [FeedController],
  providers: [RecommendationsService, HomepageFeedService],
})
export class FeedModule {}

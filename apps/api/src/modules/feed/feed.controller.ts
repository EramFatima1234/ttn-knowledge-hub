import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { EngagementRepository } from '../engagement/engagement.repository';
import { MeetsRepository } from '../knowledge-meets/meets.repository';
import { SeriesRepository } from '../knowledge-series/series.repository';
import { VideosRepository } from '../videos/videos.repository';
import { ProgressService } from '../progress/progress.service';
import { RecommendationsService } from './recommendations.service';
import { HomepageFeedService } from './homepage-feed.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Feed')
@ApiBearerAuth()
@Controller()
export class FeedController {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly meetsRepository: MeetsRepository,
    private readonly seriesRepository: SeriesRepository,
    private readonly engagementRepository: EngagementRepository,
    private readonly recommendationsService: RecommendationsService,
    private readonly progressService: ProgressService,
    private readonly homepageFeedService: HomepageFeedService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('feed/home')
  @ApiOperation({ summary: 'Aggregated home feed' })
  async home(@CurrentUser() user: AuthenticatedUser) {
    const [continueWatching, latest, trending, curated] = await Promise.all([
      this.engagementRepository.getContinueWatching(user.id, 8),
      this.videosRepository.findMany({
        page: 1,
        limit: 8,
        sort: 'newest',
      }),
      this.videosRepository.findMany({
        page: 1,
        limit: 8,
        sort: 'popular',
      }),
      this.homepageFeedService.getCuratedHomeSections(user.id),
    ]);

    const latestMeets =
      curated.latestMeets.length > 0
        ? curated.latestMeets
        : (
            await this.meetsRepository.findMany({
              page: 1,
              limit: 6,
              sort: 'newest',
            })
          ).items.map((m) => this.meetsRepository.toSummary(m));

    const featuredSeries =
      curated.featuredSeries.length > 0
        ? curated.featuredSeries
        : await (async () => {
            const seriesList = await this.seriesRepository.findMany({
              page: 1,
              limit: 6,
            });
            return Promise.all(
              seriesList.items.map(async (item) => {
                const progressPercent =
                  await this.seriesRepository.calcSeriesProgress(
                    item.id,
                    user.id,
                  );
                return this.seriesRepository.toSummary(item, progressPercent);
              }),
            );
          })();

    const trendingMeets =
      curated.trendingMeets.length > 0
        ? curated.trendingMeets
        : latestMeets;

    const featuredMeets =
      curated.featuredMeets.length > 0
        ? curated.featuredMeets
        : latestMeets.slice(0, 6);

    return {
      data: {
        continueWatching: continueWatching.data,
        latestVideos: latest.items.map((v) =>
          this.videosRepository.toSummary(v),
        ),
        trendingVideos: trending.items.map((v) =>
          this.videosRepository.toSummary(v),
        ),
        heroMeets: curated.heroMeets,
        featuredMeets,
        trendingMeets,
        latestMeets,
        recommendedSeries: curated.recommendedSeries,
        trendingSeries: curated.trendingSeries,
        /** @deprecated Use latestMeets */
        upcomingMeets: latestMeets,
        knowledgeSeries: featuredSeries,
      },
    };
  }

  @Get('feed/dashboard')
  @ApiOperation({ summary: 'Redesigned dashboard feed' })
  async dashboard(@CurrentUser() user: AuthenticatedUser) {
    const [
      home,
      recommendations,
      progress,
      weeklyActivity,
      bookmarks,
      history,
      announcements,
    ] = await Promise.all([
      this.home(user),
      this.recommendationsService.getRecommendations(user.id),
      this.progressService.getSummary(user.id),
      this.progressService.getWeeklyActivity(user.id),
      this.engagementRepository.listBookmarks(user.id),
      this.engagementRepository.listHistory(user.id, 12),
      this.prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      }),
    ]);

    return {
      data: {
        continueWatching: home.data.continueWatching,
        recommended: recommendations.data.forYou,
        latestMeets: home.data.latestMeets,
        /** @deprecated Use latestMeets */
        upcomingSessions: home.data.latestMeets,
        learningProgress: progress,
        bookmarks: bookmarks.data,
        history: history.data,
        weeklyActivity,
        announcements,
        popularThisWeek: home.data.trendingVideos,
        latestVideos: home.data.latestVideos,
        knowledgeSeries: home.data.knowledgeSeries,
      },
    };
  }

  @Get('feed/recommendations')
  @ApiOperation({ summary: 'Personalized recommendations' })
  recommendations(@CurrentUser() user: AuthenticatedUser) {
    return this.recommendationsService.getRecommendations(user.id);
  }

  @Get('explore')
  @ApiOperation({ summary: 'Explore hub with competencies and featured content' })
  explore(@CurrentUser() user: AuthenticatedUser) {
    return this.recommendationsService.getExploreHub(user.id);
  }

  @Get('feed/related/:contentType/:id')
  @ApiOperation({ summary: 'Related content for a video, meet, or series' })
  related(
    @CurrentUser() user: AuthenticatedUser,
    @Param('contentType') contentType: ContentType,
    @Param('id') id: string,
  ) {
    return this.recommendationsService.getRelatedContent(contentType, id, user.id);
  }
}

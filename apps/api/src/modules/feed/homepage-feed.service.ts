import { Injectable } from '@nestjs/common';
import { ContentStatus, Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MeetsRepository } from '../knowledge-meets/meets.repository';
import { SeriesRepository } from '../knowledge-series/series.repository';
import { HOMEPAGE_SECTION_TAGS } from './homepage-tags.constant';

@Injectable()
export class HomepageFeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meetsRepository: MeetsRepository,
    private readonly seriesRepository: SeriesRepository,
  ) {}

  private publishedMeetWhere(
    homepageTag?: string,
  ): Prisma.KnowledgeMeetWhereInput {
    return {
      deletedAt: null,
      visibility: Visibility.INTERNAL,
      ...(homepageTag
        ? { homepageTags: { has: homepageTag } }
        : {}),
      recording: {
        is: {
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
        },
      },
    };
  }

  async listMeetsBySection(
    homepageTag: string,
    limit: number,
    userId: string,
  ) {
    const items = await this.prisma.knowledgeMeet.findMany({
      where: this.publishedMeetWhere(homepageTag),
      orderBy: [{ displayPriority: 'asc' }, { scheduledAt: 'desc' }],
      take: limit,
      include: { speaker: true, competency: true, recording: true },
    });
    return items.map((m) => this.meetsRepository.toSummary(m));
  }

  async listLatestMeets(limit: number) {
    const result = await this.meetsRepository.findMany({
      page: 1,
      limit,
      sort: 'newest',
    });
    return result.items.map((m) => this.meetsRepository.toSummary(m));
  }

  async listSeriesBySection(homepageTag: string, limit: number, userId: string) {
    const items = await this.prisma.knowledgeSeries.findMany({
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        homepageTags: { has: homepageTag },
      },
      orderBy: [{ displayPriority: 'asc' }, { publishedAt: 'desc' }],
      take: limit,
      include: {
        competency: true,
        sessions: { include: { video: true }, orderBy: { orderIndex: 'asc' } },
      },
    });

    return Promise.all(
      items.map(async (item) => {
        const progressPercent = await this.seriesRepository.calcSeriesProgress(
          item.id,
          userId,
        );
        return this.seriesRepository.toSummary(item, progressPercent);
      }),
    );
  }

  async getCuratedHomeSections(userId: string) {
    const [
      heroMeets,
      featuredMeets,
      trendingMeets,
      latestMeets,
      featuredSeries,
      trendingSeries,
      recommendedSeries,
    ] = await Promise.all([
      this.listMeetsBySection(HOMEPAGE_SECTION_TAGS.HERO, 3, userId),
      this.listMeetsBySection(HOMEPAGE_SECTION_TAGS.FEATURED, 8, userId),
      this.listMeetsBySection(HOMEPAGE_SECTION_TAGS.TRENDING, 8, userId),
      this.listLatestMeets(8),
      this.listSeriesBySection(HOMEPAGE_SECTION_TAGS.FEATURED, 6, userId),
      this.listSeriesBySection(HOMEPAGE_SECTION_TAGS.TRENDING, 6, userId),
      this.listSeriesBySection(HOMEPAGE_SECTION_TAGS.RECOMMENDED, 6, userId),
    ]);

    return {
      heroMeets,
      featuredMeets,
      trendingMeets,
      latestMeets,
      featuredSeries,
      trendingSeries,
      recommendedSeries,
    };
  }
}

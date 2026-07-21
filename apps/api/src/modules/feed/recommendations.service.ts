import { Injectable } from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MeetsRepository } from '../knowledge-meets/meets.repository';
import { SeriesRepository } from '../knowledge-series/series.repository';
import { VideosRepository } from '../videos/videos.repository';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly videosRepository: VideosRepository,
    private readonly meetsRepository: MeetsRepository,
    private readonly seriesRepository: SeriesRepository,
  ) {}

  async getExploreHub(userId: string) {
    const competencies = await this.prisma.competency.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            videos: { where: { status: 'PUBLISHED', deletedAt: null } },
            knowledgeMeets: { where: { deletedAt: null } },
            knowledgeSeries: { where: { status: 'PUBLISHED', deletedAt: null } },
          },
        },
      },
    });

    const [featuredVideos, featuredSeries, latestMeets] = await Promise.all([
      this.videosRepository.findMany({ page: 1, limit: 6, sort: 'popular' }),
      this.seriesRepository.findMany({ page: 1, limit: 4 }),
      this.meetsRepository.findMany({
        page: 1,
        limit: 4,
        sort: 'newest',
      }),
    ]);

    const series = await Promise.all(
      featuredSeries.items.map(async (item) => {
        const progressPercent = await this.seriesRepository.calcSeriesProgress(
          item.id,
          userId,
        );
        return this.seriesRepository.toSummary(item, progressPercent);
      }),
    );

    return {
      data: {
        competencies: competencies.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          videoCount: c._count.videos,
          meetCount: c._count.knowledgeMeets,
          seriesCount: c._count.knowledgeSeries,
        })),
        featuredVideos: featuredVideos.items.map((v) =>
          this.videosRepository.toSummary(v),
        ),
        featuredSeries: series,
        latestMeets: latestMeets.items.map((m) =>
          this.meetsRepository.toSummary(m),
        ),
        /** @deprecated Use latestMeets */
        upcomingMeets: latestMeets.items.map((m) =>
          this.meetsRepository.toSummary(m),
        ),
      },
    };
  }

  async getRecommendations(userId: string) {
    const [history, bookmarks, trending] = await Promise.all([
      this.prisma.history.findMany({
        where: { userId, contentType: ContentType.VIDEO },
        orderBy: { lastWatchedAt: 'desc' },
        take: 5,
      }),
      this.prisma.bookmark.findMany({
        where: { userId, contentType: ContentType.VIDEO },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.videosRepository.findMany({ page: 1, limit: 8, sort: 'popular' }),
    ]);

    const competencyIds = new Set<string>();
    const watchedIds = new Set(history.map((h) => h.contentId));

    for (const item of history) {
      const video = await this.prisma.video.findUnique({
        where: { id: item.contentId },
        select: { competencyId: true },
      });
      if (video?.competencyId) competencyIds.add(video.competencyId);
    }

    for (const bookmark of bookmarks) {
      const video = await this.prisma.video.findUnique({
        where: { id: bookmark.contentId },
        select: { competencyId: true },
      });
      if (video?.competencyId) competencyIds.add(video.competencyId);
    }

    let forYou = trending.items;
    if (competencyIds.size > 0) {
      const personalized = await this.prisma.video.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
          competencyId: { in: [...competencyIds] },
          id: { notIn: [...watchedIds] },
        },
        include: { speaker: true, competency: true, category: true },
        orderBy: { viewCount: 'desc' },
        take: 8,
      });
      if (personalized.length) forYou = personalized;
    }

    const bookmarkVideoIds = bookmarks
      .filter((b) => b.contentType === ContentType.VIDEO)
      .map((b) => b.contentId);

    const bookmarkVideos = bookmarkVideoIds.length
      ? await this.prisma.video.findMany({
          where: {
            status: 'PUBLISHED',
            deletedAt: null,
            id: { in: bookmarkVideoIds },
          },
          include: { speaker: true, competency: true, category: true },
          orderBy: { viewCount: 'desc' },
          take: 6,
        })
      : [];

    return {
      data: {
        forYou: forYou.map((v) => this.videosRepository.toSummary(v)),
        trending: trending.items.map((v) => this.videosRepository.toSummary(v)),
        basedOnBookmarks: bookmarkVideos.map((v) =>
          this.videosRepository.toSummary(v),
        ),
      },
    };
  }

  async getRelatedContent(
    contentType: ContentType,
    contentId: string,
    userId: string,
  ) {
    let competencyId: string | null = null;

    if (contentType === ContentType.VIDEO) {
      const video = await this.prisma.video.findUnique({
        where: { id: contentId },
        select: { competencyId: true },
      });
      competencyId = video?.competencyId ?? null;
    } else if (contentType === ContentType.KNOWLEDGE_MEET) {
      const meet = await this.prisma.knowledgeMeet.findUnique({
        where: { id: contentId },
        select: { competencyId: true },
      });
      competencyId = meet?.competencyId ?? null;
    } else {
      const series = await this.prisma.knowledgeSeries.findUnique({
        where: { id: contentId },
        select: { competencyId: true },
      });
      competencyId = series?.competencyId ?? null;
    }

    const videoWhere = {
      status: 'PUBLISHED' as const,
      deletedAt: null,
      ...(contentType === ContentType.VIDEO ? { id: { not: contentId } } : {}),
      ...(competencyId ? { competencyId } : {}),
    };

    const [videos, seriesList, meets] = await Promise.all([
      this.prisma.video.findMany({
        where: videoWhere,
        include: { speaker: true, competency: true, category: true },
        orderBy: { viewCount: 'desc' },
        take: 6,
      }),
      this.prisma.knowledgeSeries.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
          ...(contentType === ContentType.KNOWLEDGE_SERIES
            ? { id: { not: contentId } }
            : {}),
          ...(competencyId ? { competencyId } : {}),
        },
        include: {
          competency: true,
          sessions: { include: { video: true }, orderBy: { orderIndex: 'asc' } },
        },
        take: 4,
      }),
      this.prisma.knowledgeMeet.findMany({
        where: {
          deletedAt: null,
          ...(contentType === ContentType.KNOWLEDGE_MEET
            ? { id: { not: contentId } }
            : {}),
          ...(competencyId ? { competencyId } : {}),
        },
        include: { speaker: true, competency: true, recording: true },
        orderBy: { scheduledAt: 'asc' },
        take: 4,
      }),
    ]);

    const series = await Promise.all(
      seriesList.map(async (item) => {
        const progressPercent = await this.seriesRepository.calcSeriesProgress(
          item.id,
          userId,
        );
        return this.seriesRepository.toSummary(item, progressPercent);
      }),
    );

    return {
      data: {
        videos: videos.map((v) => this.videosRepository.toSummary(v)),
        series,
        meets: meets.map((m) => this.meetsRepository.toSummary(m)),
      },
    };
  }
}

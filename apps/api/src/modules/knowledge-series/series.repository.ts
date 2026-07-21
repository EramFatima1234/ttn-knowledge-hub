import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../common/dto/pagination.dto';
import { calcProgressPercent, publishedFilter } from '../content/content.utils';
import { VideosRepository } from '../videos/videos.repository';

@Injectable()
export class SeriesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly videosRepository: VideosRepository,
  ) {}

  async findMany(params: { page: number; limit: number }) {
    const where = { ...publishedFilter };
    const skip = (params.page - 1) * params.limit;

    const [items, total] = await Promise.all([
      this.prisma.knowledgeSeries.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          competency: true,
          sessions: { include: { video: true }, orderBy: { orderIndex: 'asc' } },
        },
      }),
      this.prisma.knowledgeSeries.count({ where }),
    ]);

    return { items, total, page: params.page, limit: params.limit };
  }

  async calcSeriesProgress(seriesId: string, userId: string) {
    const sessions = await this.prisma.seriesSession.findMany({
      where: { seriesId, videoId: { not: null } },
      include: { video: true },
    });

    if (!sessions.length) return 0;

    const histories = await this.prisma.history.findMany({
      where: {
        userId,
        contentType: 'VIDEO',
        contentId: { in: sessions.map((s) => s.videoId!).filter(Boolean) },
      },
    });

    const historyMap = new Map(histories.map((h) => [h.contentId, h]));
    let totalPercent = 0;
    let counted = 0;

    for (const session of sessions) {
      if (!session.video) continue;
      counted++;
      const history = historyMap.get(session.video.id);
      totalPercent += history
        ? calcProgressPercent(history.progressSeconds, session.video.durationSeconds)
        : 0;
    }

    return counted ? Math.round(totalPercent / counted) : 0;
  }

  toSummary(
    series: Prisma.KnowledgeSeriesGetPayload<{
      include: {
        competency: true;
        sessions: { include: { video: true } };
      };
    }>,
    progressPercent: number,
  ) {
    return {
      id: series.id,
      title: series.title,
      description: series.description,
      thumbnailUrl: series.thumbnailUrl,
      sessionCount: series.sessions.length,
      progressPercent,
      competency: series.competency
        ? {
            id: series.competency.id,
            name: series.competency.name,
            slug: series.competency.slug,
          }
        : null,
    };
  }

  async getDetailForUser(id: string, userId: string) {
    const series = await this.prisma.knowledgeSeries.findFirst({
      where: { id, deletedAt: null, status: ContentStatus.PUBLISHED },
      include: {
        competency: true,
        sessions: {
          include: {
            video: { include: { speaker: true, competency: true, category: true } },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!series) throw new NotFoundException('Knowledge series not found');

    const videoIds = series.sessions
      .map((s) => s.videoId)
      .filter((v): v is string => Boolean(v));

    const [histories, bookmark] = await Promise.all([
      this.prisma.history.findMany({
        where: { userId, contentType: 'VIDEO', contentId: { in: videoIds } },
      }),
      this.prisma.bookmark.findUnique({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType: 'KNOWLEDGE_SERIES',
            contentId: id,
          },
        },
      }),
    ]);

    const historyMap = new Map(histories.map((h) => [h.contentId, h]));
    const progressPercent = await this.calcSeriesProgress(id, userId);

    const sessions = series.sessions.map((session) => {
      const history = session.video
        ? historyMap.get(session.video.id)
        : undefined;
      const progress = session.video && history
        ? calcProgressPercent(history.progressSeconds, session.video.durationSeconds)
        : 0;

      return {
        id: session.id,
        title: session.title,
        orderIndex: session.orderIndex,
        video: session.video
          ? this.videosRepository.toSummary(session.video, progress)
          : null,
        progressPercent: progress,
        completed: history?.completed ?? false,
      };
    });

    return {
      ...this.toSummary(series, progressPercent),
      sessions,
      isBookmarked: Boolean(bookmark),
    };
  }
}

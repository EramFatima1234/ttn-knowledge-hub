import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [
      totalPublished,
      viewAggregate,
      totalComments,
      totalBookmarks,
      watchSessions,
      totalUsers,
      activeUsers,
      usersByRole,
      topVideos,
      uploadsByDay,
      viewsByDay,
      commentsByDay,
      signupsByDay,
    ] = await Promise.all([
      this.prisma.video.count({
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
      }),
      this.prisma.video.aggregate({
        where: { deletedAt: null },
        _sum: { viewCount: true },
      }),
      this.prisma.comment.count({ where: { deletedAt: null } }),
      this.prisma.bookmark.count(),
      this.prisma.history.count(),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: { deletedAt: null, lastLoginAt: { gte: since } },
      }),
      this.prisma.role.findMany({
        include: { _count: { select: { users: true } } },
      }),
      this.prisma.video.findMany({
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: { id: true, title: true, viewCount: true, thumbnailUrl: true },
      }),
      this.groupByDay('videos', 'created_at', since, {
        status: ContentStatus.PUBLISHED,
        deleted_at: null,
      }),
      this.viewsByDay(since),
      this.groupByDay('comments', 'created_at', since, { deleted_at: null }),
      this.groupByDay('users', 'created_at', since, { deleted_at: null }),
    ]);

    return {
      data: {
        content: {
          totalPublished,
          totalViews: viewAggregate._sum.viewCount ?? 0,
          uploadsByDay,
          viewsByDay,
          topVideos: topVideos.map((v) => ({
            id: v.id,
            title: v.title,
            type: 'VIDEO',
            viewCount: v.viewCount,
            thumbnailUrl: v.thumbnailUrl,
          })),
        },
        engagement: {
          totalComments,
          totalBookmarks,
          watchSessions,
          commentsByDay,
        },
        users: {
          totalUsers,
          activeUsers,
          usersByRole: usersByRole.map((r) => ({
            role: r.name,
            count: r._count.users,
          })),
          signupsByDay,
        },
      },
    };
  }

  private async groupByDay(
    table: string,
    column: string,
    since: Date,
    extraWhere: Record<string, unknown> = {},
  ) {
    const conditions = [`${column} >= $1`];
    const values: unknown[] = [since];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(extraWhere)) {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    const rows = await this.prisma.$queryRawUnsafe<
      { day: Date; count: bigint }[]
    >(
      `SELECT date_trunc('day', ${column})::date AS day, COUNT(*)::bigint AS count
       FROM ${table}
       WHERE ${conditions.join(' AND ')}
       GROUP BY day
       ORDER BY day ASC`,
      ...values,
    );

    return rows.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      count: Number(row.count),
    }));
  }

  private async viewsByDay(since: Date) {
    const rows = await this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', last_watched_at)::date AS day, COUNT(*)::bigint AS count
      FROM histories
      WHERE last_watched_at >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `;

    return rows.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      count: Number(row.count),
    }));
  }

  async getReports() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [
      topVideo,
      topSeries,
      topCompetency,
      topSpeaker,
      activeUsers,
      monthlyUploads,
      watchHoursAgg,
      attachmentCount,
    ] = await Promise.all([
      this.prisma.video.findFirst({
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
        orderBy: { viewCount: 'desc' },
        select: { title: true, viewCount: true },
      }),
      this.prisma.knowledgeSeries.findFirst({
        where: { deletedAt: null, status: ContentStatus.PUBLISHED },
        orderBy: { updatedAt: 'desc' },
        include: { sessions: { include: { video: true } } },
      }),
      this.prisma.competency.findFirst({
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { videos: true, knowledgeMeets: true, knowledgeSeries: true } },
        },
      }),
      this.prisma.speaker.findFirst({
        include: { _count: { select: { videos: true, knowledgeMeets: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({
        where: { deletedAt: null, lastLoginAt: { gte: since } },
      }),
      this.prisma.video.count({
        where: { createdAt: { gte: since }, deletedAt: null },
      }),
      this.prisma.history.aggregate({ _sum: { progressSeconds: true } }),
      this.prisma.attachment.count(),
    ]);

    const seriesViews =
      topSeries?.sessions.reduce((sum, s) => sum + (s.video?.viewCount ?? 0), 0) ?? 0;

    return {
      data: {
        mostViewedSession: {
          title: topVideo?.title ?? '—',
          viewCount: topVideo?.viewCount ?? 0,
        },
        mostPopularSeries: {
          title: topSeries?.title ?? '—',
          viewCount: seriesViews,
        },
        topCompetency: {
          name: topCompetency?.name ?? '—',
          sessionCount:
            (topCompetency?._count.videos ?? 0)
            + (topCompetency?._count.knowledgeMeets ?? 0)
            + (topCompetency?._count.knowledgeSeries ?? 0),
        },
        topSpeaker: {
          name: topSpeaker?.name ?? '—',
          sessionCount:
            (topSpeaker?._count.videos ?? 0) + (topSpeaker?._count.knowledgeMeets ?? 0),
        },
        activeUsers,
        monthlyUploads,
        downloads: attachmentCount,
        watchHours: Math.round((watchHoursAgg._sum.progressSeconds ?? 0) / 3600),
      },
    };
  }
}

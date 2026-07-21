import { Injectable } from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const histories = await this.prisma.history.findMany({
      where: { userId, contentType: ContentType.VIDEO },
    });

    const completed = histories.filter((h) => h.completed).length;
    const inProgress = histories.filter((h) => !h.completed && h.progressSeconds > 0).length;
    const totalWatchedSeconds = histories.reduce((sum, h) => sum + h.progressSeconds, 0);

    const seriesList = await this.prisma.knowledgeSeries.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      include: { sessions: { include: { video: true } } },
    });

    const seriesProgress = await Promise.all(
      seriesList.map(async (series) => {
        const videoIds = series.sessions
          .map((s) => s.videoId)
          .filter((id): id is string => Boolean(id));
        if (!videoIds.length) return { seriesId: series.id, title: series.title, percent: 0 };

        const sessionHistories = await this.prisma.history.findMany({
          where: {
            userId,
            contentType: ContentType.VIDEO,
            contentId: { in: videoIds },
          },
        });

        const percents = videoIds.map((videoId) => {
          const history = sessionHistories.find((h) => h.contentId === videoId);
          const video = series.sessions.find((s) => s.videoId === videoId)?.video;
          if (!video?.durationSeconds) return history?.completed ? 100 : 0;
          if (history?.completed) return 100;
          return Math.min(
            100,
            Math.round((history?.progressSeconds ?? 0) / video.durationSeconds * 100),
          );
        });

        const percent =
          percents.length > 0
            ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
            : 0;

        return { seriesId: series.id, title: series.title, percent };
      }),
    );

    const streak = await this.calcStreak(userId);

    return {
      completedVideos: completed,
      inProgressVideos: inProgress,
      remainingVideos: Math.max(0, inProgress),
      hoursWatched: Math.round((totalWatchedSeconds / 3600) * 10) / 10,
      currentStreakDays: streak,
      seriesProgress,
    };
  }

  async getWeeklyActivity(userId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const byDay = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay.set(d.toISOString().slice(0, 10), 0);
    }

    const rows = await this.prisma.watchActivity.findMany({
      where: { userId, watchedAt: { gte: since } },
      select: { watchedAt: true, watchedSeconds: true },
    });

    for (const row of rows) {
      const key = row.watchedAt.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + row.watchedSeconds);
    }

    return Array.from(byDay.entries()).map(([date, seconds]) => ({
      date,
      minutes: Math.round(seconds / 60),
    }));
  }

  async recordActivity(
    userId: string,
    contentType: ContentType,
    contentId: string,
    watchedSeconds: number,
  ) {
    return this.prisma.watchActivity.create({
      data: { userId, contentType, contentId, watchedSeconds },
    });
  }

  async getPlaybackPreferences(userId: string) {
    return this.prisma.userPlaybackPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async updatePlaybackPreferences(
    userId: string,
    data: { playbackSpeed?: number; autoPlayNext?: boolean },
  ) {
    return this.prisma.userPlaybackPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  private async calcStreak(userId: string): Promise<number> {
    const activities = await this.prisma.watchActivity.findMany({
      where: { userId },
      select: { watchedAt: true },
      orderBy: { watchedAt: 'desc' },
      take: 60,
    });

    if (!activities.length) return 0;

    const days = new Set(
      activities.map((a) => a.watchedAt.toISOString().slice(0, 10)),
    );

    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const key = cursor.toISOString().slice(0, 10);
      if (days.has(key)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (i === 0) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    return streak;
  }
}

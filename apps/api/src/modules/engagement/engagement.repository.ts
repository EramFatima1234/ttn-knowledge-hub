import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../common/dto/pagination.dto';
import { calcProgressPercent } from '../content/content.utils';

@Injectable()
export class EngagementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listComments(
    contentType: ContentType,
    contentId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      contentType,
      contentId,
      parentId: null,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: true,
          replies: {
            where: { deletedAt: null },
            include: { user: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      data: items.map((comment) => this.mapComment(comment)),
      meta: buildMeta(page, limit, total),
    };
  }

  private mapComment(
    comment: Prisma.CommentGetPayload<{
      include: { user: true; replies: { include: { user: true } } };
    }>,
  ) {
    return {
      id: comment.id,
      body: comment.body,
      isPinned: comment.isPinned,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.user.id,
        name: comment.user.name,
        avatarUrl: comment.user.avatarUrl,
      },
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        body: reply.body,
        isPinned: reply.isPinned,
        createdAt: reply.createdAt.toISOString(),
        user: {
          id: reply.user.id,
          name: reply.user.name,
          avatarUrl: reply.user.avatarUrl,
        },
        replies: [],
      })),
    };
  }

  async createComment(params: {
    userId: string;
    contentType: ContentType;
    contentId: string;
    body: string;
    parentId?: string;
  }) {
    if (params.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: params.parentId, deletedAt: null },
      });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        userId: params.userId,
        contentType: params.contentType,
        contentId: params.contentId,
        body: params.body,
        parentId: params.parentId,
      },
      include: { user: true },
    });

    return {
      data: {
        id: comment.id,
        body: comment.body,
        isPinned: comment.isPinned,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name,
          avatarUrl: comment.user.avatarUrl,
        },
        replies: [],
      },
    };
  }

  async listBookmarks(userId: string, contentType?: ContentType) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId,
        ...(contentType ? { contentType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const meta = await this.resolveContentMeta(
          bookmark.contentType,
          bookmark.contentId,
        );
        return {
          id: bookmark.id,
          contentType: bookmark.contentType,
          contentId: bookmark.contentId,
          createdAt: bookmark.createdAt.toISOString(),
          ...meta,
        };
      }),
    );

    return { data };
  }

  async toggleBookmark(
    userId: string,
    contentType: ContentType,
    contentId: string,
  ) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_contentType_contentId: { userId, contentType, contentId },
      },
    });

    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { data: { bookmarked: false } };
    }

    await this.prisma.bookmark.create({
      data: { userId, contentType, contentId },
    });
    return { data: { bookmarked: true } };
  }

  async upsertHistory(params: {
    userId: string;
    contentType: ContentType;
    contentId: string;
    progressSeconds: number;
    completed?: boolean;
  }) {
    const existing = await this.prisma.history.findUnique({
      where: {
        userId_contentType_contentId: {
          userId: params.userId,
          contentType: params.contentType,
          contentId: params.contentId,
        },
      },
    });
    const previousProgress = existing?.progressSeconds ?? 0;

    const history = await this.prisma.history.upsert({
      where: {
        userId_contentType_contentId: {
          userId: params.userId,
          contentType: params.contentType,
          contentId: params.contentId,
        },
      },
      update: {
        progressSeconds: params.progressSeconds,
        completed: params.completed ?? false,
        lastWatchedAt: new Date(),
      },
      create: {
        userId: params.userId,
        contentType: params.contentType,
        contentId: params.contentId,
        progressSeconds: params.progressSeconds,
        completed: params.completed ?? false,
      },
    });

    const delta = Math.max(0, params.progressSeconds - previousProgress);
    if (delta > 0) {
      await this.prisma.watchActivity.create({
        data: {
          userId: params.userId,
          contentType: params.contentType,
          contentId: params.contentId,
          watchedSeconds: Math.min(delta, 30),
        },
      });
    }

    return { data: history };
  }

  async getContinueWatching(userId: string, limit: number) {
    const histories = await this.prisma.history.findMany({
      where: { userId, completed: false, contentType: 'VIDEO' },
      orderBy: { lastWatchedAt: 'desc' },
      take: limit,
    });

    const data = (
      await Promise.all(histories.map((h) => this.mapHistoryItem(h)))
    ).filter(Boolean);

    return { data };
  }

  async listHistory(userId: string, limit: number) {
    const histories = await this.prisma.history.findMany({
      where: { userId },
      orderBy: { lastWatchedAt: 'desc' },
      take: limit,
    });

    const data = (
      await Promise.all(histories.map((h) => this.mapHistoryItem(h)))
    ).filter(Boolean);

    return { data };
  }

  private async mapHistoryItem(history: {
    id: string;
    contentType: ContentType;
    contentId: string;
    progressSeconds: number;
    completed: boolean;
    lastWatchedAt: Date;
  }) {
    if (history.contentType !== 'VIDEO') return null;

    const video = await this.prisma.video.findFirst({
      where: { id: history.contentId, deletedAt: null },
    });
    if (!video) return null;

    return {
      id: history.id,
      contentType: history.contentType,
      contentId: history.contentId,
      progressSeconds: history.progressSeconds,
      completed: history.completed,
      lastWatchedAt: history.lastWatchedAt.toISOString(),
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      durationSeconds: video.durationSeconds,
      progressPercent: calcProgressPercent(
        history.progressSeconds,
        video.durationSeconds,
      ),
    };
  }

  private async resolveContentMeta(
    contentType: ContentType,
    contentId: string,
  ) {
    if (contentType === 'VIDEO') {
      const video = await this.prisma.video.findFirst({
        where: { id: contentId, deletedAt: null },
      });
      return {
        title: video?.title ?? 'Video',
        thumbnailUrl: video?.thumbnailUrl ?? null,
        subtitle: video?.description?.slice(0, 80) ?? null,
      };
    }

    if (contentType === 'KNOWLEDGE_MEET') {
      const meet = await this.prisma.knowledgeMeet.findFirst({
        where: { id: contentId, deletedAt: null },
      });
      return {
        title: meet?.title ?? 'Knowledge Meet',
        thumbnailUrl: meet?.thumbnailUrl ?? null,
        subtitle: meet?.subtitle ?? null,
      };
    }

    const series = await this.prisma.knowledgeSeries.findFirst({
      where: { id: contentId, deletedAt: null },
    });
    return {
      title: series?.title ?? 'Knowledge Series',
      thumbnailUrl: series?.thumbnailUrl ?? null,
      subtitle: series?.description?.slice(0, 80) ?? null,
    };
  }
}

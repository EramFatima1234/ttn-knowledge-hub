import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, MeetStatus, Prisma, SessionDifficulty, Visibility } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../common/dto/pagination.dto';

export type MeetLibrarySort = 'newest' | 'oldest' | 'popular';

@Injectable()
export class MeetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Published recorded sessions visible in the learning library. */
  private publishedLibraryWhere(
    filters: {
      competencyId?: string;
      speakerId?: string;
      year?: number;
      search?: string;
      difficulty?: SessionDifficulty;
      tag?: string;
    } = {},
  ): Prisma.KnowledgeMeetWhereInput {
    const where: Prisma.KnowledgeMeetWhereInput = {
      deletedAt: null,
      visibility: Visibility.INTERNAL,
      status: { not: MeetStatus.CANCELLED },
      recording: {
        is: {
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
        },
      },
    };

    if (filters.competencyId) where.competencyId = filters.competencyId;
    if (filters.speakerId) where.speakerId = filters.speakerId;
    if (filters.year) {
      where.scheduledAt = {
        gte: new Date(`${filters.year}-01-01T00:00:00.000Z`),
        lt: new Date(`${filters.year + 1}-01-01T00:00:00.000Z`),
      };
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { subtitle: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    if (filters.tag?.trim()) {
      where.tags = { has: filters.tag.trim().toLowerCase() };
    }

    return where;
  }

  async findMany(params: {
    page: number;
    limit: number;
    competencyId?: string;
    speakerId?: string;
    year?: number;
    search?: string;
    sort?: MeetLibrarySort;
    difficulty?: string;
    tag?: string;
    /** @deprecated Use library filters instead. Kept for backward-compatible API calls. */
    status?: MeetStatus;
  }) {
    const where = this.publishedLibraryWhere({
      competencyId: params.competencyId,
      speakerId: params.speakerId,
      year: params.year,
      search: params.search,
      difficulty: params.difficulty as SessionDifficulty | undefined,
      tag: params.tag,
    });

    const orderBy: Prisma.KnowledgeMeetOrderByWithRelationInput =
      params.sort === 'oldest'
        ? { scheduledAt: 'asc' }
        : params.sort === 'popular'
          ? { recording: { viewCount: 'desc' } }
          : { scheduledAt: 'desc' };

    const skip = (params.page - 1) * params.limit;
    const [items, total] = await Promise.all([
      this.prisma.knowledgeMeet.findMany({
        where,
        skip,
        take: params.limit,
        orderBy,
        include: { speaker: true, competency: true, recording: true },
      }),
      this.prisma.knowledgeMeet.count({ where }),
    ]);

    return { items, total, page: params.page, limit: params.limit };
  }

  toSummary(
    meet: Prisma.KnowledgeMeetGetPayload<{
      include: { speaker: true; competency: true; recording: true };
    }>,
  ) {
    const recordingUrl =
      meet.recording?.videoUrl ?? meet.recordingUrl ?? null;

    return {
      id: meet.id,
      title: meet.title,
      subtitle: meet.subtitle,
      description: meet.description,
      thumbnailUrl: meet.thumbnailUrl ?? meet.recording?.thumbnailUrl ?? null,
      scheduledAt: meet.scheduledAt.toISOString(),
      durationMinutes: meet.durationMinutes,
      status: meet.status,
      attendanceType: meet.attendanceType,
      recordingUrl,
      videoId: meet.videoId,
      hasRecording: meet.recording?.status === ContentStatus.PUBLISHED,
      recordingStatus: meet.recording?.status ?? null,
      difficulty: meet.difficulty,
      tags: meet.tags ?? [],
      viewCount: meet.recording?.viewCount ?? 0,
      speaker: meet.speaker
        ? {
            id: meet.speaker.id,
            name: meet.speaker.name,
            designation: meet.speaker.designation,
            avatarUrl: meet.speaker.avatarUrl,
          }
        : null,
      competency: meet.competency
        ? {
            id: meet.competency.id,
            name: meet.competency.name,
            slug: meet.competency.slug,
          }
        : null,
    };
  }

  async getDetailForUser(id: string, userId: string) {
    const meet = await this.prisma.knowledgeMeet.findFirst({
      where: {
        id,
        ...this.publishedLibraryWhere(),
      },
      include: { speaker: true, competency: true, recording: true },
    });
    if (!meet) throw new NotFoundException('Knowledge meet not found');

    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: 'KNOWLEDGE_MEET',
          contentId: id,
        },
      },
    });

    return {
      ...this.toSummary(meet),
      bannerUrl: meet.bannerUrl,
      repositoryUrl: meet.repositoryUrl,
      presentationUrl: meet.presentationUrl,
      commentsEnabled: meet.commentsEnabled,
      feedbackEnabled: meet.feedbackEnabled,
      visibility: meet.visibility,
      isBookmarked: Boolean(bookmark),
    };
  }
}

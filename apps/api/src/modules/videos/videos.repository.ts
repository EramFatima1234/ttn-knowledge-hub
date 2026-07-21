import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { buildMeta } from '../../common/dto/pagination.dto';
import {
  calcProgressPercent,
  publishedFilter,
  videoInclude,
} from '../content/content.utils';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';

@Injectable()
export class VideosRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findMany(params: {
    page: number;
    limit: number;
    competencyId?: string;
    categoryId?: string;
    sort?: string;
  }) {
    const where: Prisma.VideoWhereInput = { ...publishedFilter };
    if (params.competencyId) where.competencyId = params.competencyId;
    if (params.categoryId) where.categoryId = params.categoryId;

    const orderBy: Prisma.VideoOrderByWithRelationInput =
      params.sort === 'popular'
        ? { viewCount: 'desc' }
        : params.sort === 'oldest'
          ? { publishedAt: 'asc' }
          : { publishedAt: 'desc' };

    const skip = (params.page - 1) * params.limit;
    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: params.limit,
        orderBy,
        include: {
          speaker: true,
          competency: true,
          category: true,
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    return { items, total, page: params.page, limit: params.limit };
  }

  async findById(id: string, includeUnpublished = false) {
    return this.prisma.video.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(includeUnpublished ? {} : { status: ContentStatus.PUBLISHED }),
      },
      include: videoInclude,
    });
  }

  async findPendingApprovals(page: number, limit: number) {
    const where = { status: ContentStatus.PENDING_APPROVAL, deletedAt: null };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          speaker: true,
          competency: true,
          uploadedBy: true,
          knowledgeMeet: {
            select: { id: true, title: true, scheduledAt: true },
          },
          seriesSessions: {
            take: 1,
            include: {
              series: { select: { id: true, title: true } },
            },
          },
        },
      }),
      this.prisma.video.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findByUploader(userId: string, page: number, limit: number) {
    const where = { uploadedById: userId, deletedAt: null };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: { competency: true, category: true },
      }),
      this.prisma.video.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async create(userId: string, dto: CreateVideoDto) {
    return this.prisma.video.create({
      data: {
        title: dto.title,
        description: dto.description,
        competencyId: dto.competencyId,
        categoryId: dto.categoryId,
        videoUrl: dto.videoUrl,
        thumbnailUrl: dto.thumbnailUrl,
        durationSeconds: dto.durationSeconds ?? 0,
        uploadedById: userId,
        status: ContentStatus.DRAFT,
      },
      include: { competency: true, category: true },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateVideoDto,
    isAdmin: boolean,
  ) {
    const video = await this.prisma.video.findFirst({
      where: { id, deletedAt: null },
    });
    if (!video) throw new NotFoundException('Video not found');
    if (!isAdmin && video.uploadedById !== userId) {
      throw new ForbiddenException('You can only edit your own content');
    }
    if (
      !isAdmin &&
      video.status !== ContentStatus.DRAFT &&
      video.status !== ContentStatus.PENDING_APPROVAL
    ) {
      throw new ForbiddenException('Published content cannot be edited');
    }

    return this.prisma.video.update({
      where: { id },
      data: dto,
      include: { competency: true, category: true },
    });
  }

  async submitForApproval(id: string, userId: string, isAdmin: boolean) {
    const video = await this.prisma.video.findFirst({
      where: { id, deletedAt: null },
    });
    if (!video) throw new NotFoundException('Video not found');
    if (!isAdmin && video.uploadedById !== userId) {
      throw new ForbiddenException('Not your content');
    }
    if (
      video.status !== ContentStatus.DRAFT &&
      video.status !== ContentStatus.PENDING_APPROVAL
    ) {
      throw new ForbiddenException('Video cannot be submitted');
    }

    return this.prisma.video.update({
      where: { id },
      data: { status: ContentStatus.PENDING_APPROVAL },
    });
  }

  async approve(id: string) {
    const video = await this.prisma.video.findFirst({
      where: { id, deletedAt: null },
    });
    if (!video) throw new NotFoundException('Video not found');

    return this.prisma.video.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async reject(id: string) {
    const video = await this.prisma.video.findFirst({
      where: { id, deletedAt: null },
    });
    if (!video) throw new NotFoundException('Video not found');

    return this.prisma.video.update({
      where: { id },
      data: { status: ContentStatus.DRAFT },
    });
  }

  async incrementViewCount(id: string) {
    return this.prisma.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  toSummary(
    video: {
      id: string;
      title: string;
      description: string | null;
      thumbnailUrl: string | null;
      videoUrl: string | null;
      durationSeconds: number;
      viewCount: number;
      isPinned: boolean;
      publishedAt: Date | null;
      status?: ContentStatus;
      speaker?: {
        id: string;
        name: string;
        designation: string | null;
        avatarUrl: string | null;
      } | null;
      competency?: {
        id: string;
        name: string;
        slug: string;
      } | null;
      category?: {
        id: string;
        name: string;
        slug: string;
      } | null;
    },
    progressPercent?: number,
  ) {
    return {
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      durationSeconds: video.durationSeconds,
      viewCount: video.viewCount,
      isPinned: video.isPinned,
      publishedAt: video.publishedAt?.toISOString() ?? null,
      ...(video.status ? { status: video.status } : {}),
      speaker: video.speaker
        ? {
            id: video.speaker.id,
            name: video.speaker.name,
            designation: video.speaker.designation,
            avatarUrl: video.speaker.avatarUrl,
          }
        : null,
      competency: video.competency
        ? {
            id: video.competency.id,
            name: video.competency.name,
            slug: video.competency.slug,
          }
        : null,
      category: video.category
        ? {
            id: video.category.id,
            name: video.category.name,
            slug: video.category.slug,
          }
        : null,
      ...(progressPercent !== undefined ? { progressPercent } : {}),
    };
  }

  async getDetailForUser(id: string, userId: string) {
    const video = await this.findById(id);
    if (!video) throw new NotFoundException('Video not found');

    const [history, bookmark] = await Promise.all([
      this.prisma.history.findUnique({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType: 'VIDEO',
            contentId: id,
          },
        },
      }),
      this.prisma.bookmark.findUnique({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType: 'VIDEO',
            contentId: id,
          },
        },
      }),
    ]);

    const seriesSession = video.seriesSessions[0];

    return {
      ...this.toSummary(
        video,
        history
          ? calcProgressPercent(history.progressSeconds, video.durationSeconds)
          : undefined,
      ),
      tags: video.tags.map((vt) => ({
        id: vt.tag.id,
        name: vt.tag.name,
        slug: vt.tag.slug,
      })),
      repository: video.repository
        ? { url: video.repository.url, provider: video.repository.provider }
        : null,
      attachments: video.attachments.map((a) => ({
        id: a.id,
        fileName: a.fileName,
        mimeType: a.mimeType,
        fileKey: a.fileKey,
        resourceKind: a.resourceKind,
        label: a.label,
        externalUrl: a.externalUrl,
        downloadUrl: a.externalUrl ?? this.storageService.getUrl(a.fileKey),
      })),
      series: seriesSession
        ? {
            id: seriesSession.series.id,
            title: seriesSession.series.title,
            sessionTitle: seriesSession.title,
          }
        : null,
      userHistory: history
        ? {
            progressSeconds: history.progressSeconds,
            completed: history.completed,
          }
        : null,
      isBookmarked: Boolean(bookmark),
    };
  }

  listResponse(result: Awaited<ReturnType<VideosRepository['findMany']>>) {
    return {
      data: result.items.map((v) => this.toSummary(v)),
      meta: buildMeta(result.page, result.limit, result.total),
    };
  }
}

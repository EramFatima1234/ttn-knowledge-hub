import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, MeetStatus, Visibility } from '@prisma/client';
import { buildMeta } from '../../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationDeliveryService } from '../notifications/notification-delivery.service';
import { ProgressService } from '../progress/progress.service';
import { SearchIndexService } from '../search/search-index.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';
import { VideosRepository } from './videos.repository';
import { StreamingService } from './streaming.service';
import type { Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VideosService {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly notificationsService: NotificationsService,
    private readonly notificationDelivery: NotificationDeliveryService,
    private readonly searchIndexService: SearchIndexService,
    private readonly streamingService: StreamingService,
    private readonly progressService: ProgressService,
    private readonly prisma: PrismaService,
  ) {}

  list(params: {
    page: number;
    limit: number;
    competencyId?: string;
    categoryId?: string;
    sort?: string;
  }) {
    return this.videosRepository.findMany(params).then((result) =>
      this.videosRepository.listResponse(result),
    );
  }

  async getById(id: string, userId: string) {
    const data = await this.videosRepository.getDetailForUser(id, userId);
    return { data };
  }

  async getPlayback(id: string, userId: string) {
    const video = await this.videosRepository.findById(id);
    if (!video) throw new NotFoundException('Video not found');

    const [history, preferences] = await Promise.all([
      this.prisma.history.findUnique({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType: 'VIDEO',
            contentId: id,
          },
        },
      }),
      this.progressService.getPlaybackPreferences(userId),
    ]);

    const storageKey = this.streamingService.resolveStorageKey(video);
    const isExternal = this.streamingService.isExternalUrl(video.videoUrl);
    const streamUrl =
      storageKey && !isExternal
        ? `/api/videos/${id}/stream`
        : video.videoUrl ?? '';

    const currentSession = await this.prisma.seriesSession.findFirst({
      where: { videoId: id },
      include: { series: { include: { sessions: { orderBy: { orderIndex: 'asc' } } } } },
    });

    let nextEpisode: { id: string; title: string; videoId: string | null } | null = null;
    if (currentSession && preferences.autoPlayNext) {
      const sessions = currentSession.series.sessions;
      const idx = sessions.findIndex((s) => s.videoId === id);
      const next = idx >= 0 ? sessions[idx + 1] : undefined;
      if (next?.videoId) {
        nextEpisode = {
          id: next.id,
          title: next.title,
          videoId: next.videoId,
        };
      }
    }

    return {
      data: {
        videoId: id,
        streamUrl,
        supportsRange: Boolean(storageKey && !isExternal),
        posterUrl: video.thumbnailUrl,
        durationSeconds: video.durationSeconds,
        progressSeconds: history?.progressSeconds ?? 0,
        completed: history?.completed ?? false,
        playbackSpeed: preferences.playbackSpeed,
        autoPlayNext: preferences.autoPlayNext,
        nextEpisode,
      },
    };
  }

  streamVideo(id: string, req: Request, res: Response) {
    return this.videosRepository.findById(id).then((video) => {
      if (!video) throw new NotFoundException('Video not found');
      const storageKey = this.streamingService.resolveStorageKey(video);
      if (!storageKey) throw new NotFoundException('Stream not available');
      return this.streamingService.streamLocalFile(storageKey, req, res);
    });
  }

  async recordView(id: string) {
    await this.videosRepository.incrementViewCount(id);
    return { data: { success: true } };
  }

  async create(userId: string, dto: CreateVideoDto) {
    const video = await this.videosRepository.create(userId, dto);
    return { data: this.videosRepository.toSummary(video) };
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateVideoDto,
    isAdmin: boolean,
  ) {
    const video = await this.videosRepository.update(id, userId, dto, isAdmin);
    return { data: this.videosRepository.toSummary(video) };
  }

  async submit(id: string, userId: string, isAdmin: boolean) {
    const video = await this.videosRepository.submitForApproval(
      id,
      userId,
      isAdmin,
    );
    return { data: { id: video.id, status: video.status } };
  }

  async listMine(userId: string, page: number, limit: number) {
    const result = await this.videosRepository.findByUploader(
      userId,
      page,
      limit,
    );
    return {
      data: result.items.map((v) => ({
        ...this.videosRepository.toSummary(v),
        status: v.status,
        updatedAt: v.updatedAt.toISOString(),
      })),
      meta: buildMeta(result.page, result.limit, result.total),
    };
  }

  async listPending(page: number, limit: number) {
    const result = await this.videosRepository.findPendingApprovals(page, limit);
    return {
      data: result.items.map((v) => {
        const meet = v.knowledgeMeet;
        const session = v.seriesSessions[0];

        let contentType: 'MEET_RECORDING' | 'SERIES_EPISODE' | 'STANDALONE_VIDEO' =
          'STANDALONE_VIDEO';
        let contextTitle: string | undefined;
        let contextId: string | undefined;

        if (meet) {
          contentType = 'MEET_RECORDING';
          contextTitle = meet.title;
          contextId = meet.id;
        } else if (session) {
          contentType = 'SERIES_EPISODE';
          contextTitle = `${session.series.title} · Episode ${session.orderIndex}`;
          contextId = session.series.id;
        }

        return {
          id: v.id,
          title: v.title,
          thumbnailUrl: v.thumbnailUrl,
          status: v.status,
          updatedAt: v.updatedAt.toISOString(),
          contentType,
          contextTitle,
          contextId,
          episodeNumber: session?.orderIndex,
          uploadedBy: {
            id: v.uploadedBy.id,
            name: v.uploadedBy.name,
            email: v.uploadedBy.email,
          },
          competency: v.competency?.name,
          speaker: v.speaker?.name,
        };
      }),
      meta: buildMeta(result.page, result.limit, result.total),
    };
  }

  private async syncMeetAfterRecordingApproval(videoId: string, videoUrl: string | null) {
    const meet = await this.prisma.knowledgeMeet.findFirst({
      where: { videoId, deletedAt: null },
    });
    if (!meet) return;

    const wasPublished = meet.status === MeetStatus.COMPLETED;

    await this.prisma.knowledgeMeet.update({
      where: { id: meet.id },
      data: {
        status: MeetStatus.COMPLETED,
        recordingUrl: videoUrl ?? meet.recordingUrl,
        visibility: Visibility.INTERNAL,
      },
    });

    if (!wasPublished) {
      const users = await this.prisma.user.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        select: { id: true },
      });
      const title = `New Knowledge Meet Available: ${meet.title}`;
      const body =
        'A new Knowledge Meet has been published. Watch the recording now on KnowledgeHub.';
      await Promise.all(
        users.map((user) =>
          this.notificationDelivery.deliver({
            userId: user.id,
            type: 'MEET_PUBLISHED',
            title,
            body,
            payload: { meetId: meet.id, videoId },
            actionUrl: `/watch/${videoId}`,
          }),
        ),
      );
    }

    await this.searchIndexService.syncMeet(meet.id);
  }

  async approve(id: string) {
    const existing = await this.videosRepository.findById(id, true);
    const video = await this.videosRepository.approve(id);
    await this.syncMeetAfterRecordingApproval(id, video.videoUrl);
    if (existing) {
      await this.notificationsService.notifyApprovalApproved(
        existing.uploadedById,
        id,
        existing.title,
      );
    }
    await this.searchIndexService.syncVideo(id);
    return { data: { id: video.id, status: video.status } };
  }

  async reject(id: string) {
    const existing = await this.videosRepository.findById(id, true);
    const video = await this.videosRepository.reject(id);
    if (existing) {
      await this.notificationsService.notifyApprovalRejected(
        existing.uploadedById,
        id,
        existing.title,
      );
    }
    await this.searchIndexService.syncVideo(id);
    return { data: { id: video.id, status: video.status } };
  }
}

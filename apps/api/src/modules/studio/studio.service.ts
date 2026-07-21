import { Inject, Injectable } from '@nestjs/common';
import { ContentStatus, ContentType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MEDIA_PROCESSING_PORT,
  type MediaProcessingPort,
} from '../../common/ports/media-processing.port';

export type StudioStep =
  | 'details'
  | 'media'
  | 'resources'
  | 'visibility'
  | 'review'
  | 'publish';

@Injectable()
export class StudioService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MEDIA_PROCESSING_PORT)
    private readonly mediaProcessing: MediaProcessingPort,
  ) {}

  async getDraft(userId: string, contentType: ContentType, contentId = '') {
    const draft = await this.prisma.draft.findUnique({
      where: {
        userId_contentType_contentId: { userId, contentType, contentId },
      },
    });
    return { data: draft };
  }

  async saveDraft(
    userId: string,
    contentType: ContentType,
    contentId: string,
    step: StudioStep,
    payload: Record<string, unknown>,
  ) {
    const draft = await this.prisma.draft.upsert({
      where: {
        userId_contentType_contentId: { userId, contentType, contentId },
      },
      create: { userId, contentType, contentId, step, payload: payload as Prisma.InputJsonValue },
      update: { step, payload: payload as Prisma.InputJsonValue },
    });
    return { data: draft };
  }

  async publishFromDraft(userId: string, contentId: string) {
    const draft = await this.prisma.draft.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: ContentType.VIDEO,
          contentId,
        },
      },
    });

    const payload = (draft?.payload ?? {}) as Record<string, string | undefined>;
    const video = await this.prisma.video.update({
      where: { id: contentId },
      data: {
        title: payload.title,
        description: payload.description,
        videoUrl: payload.videoUrl,
        storageKey: payload.storageKey,
        thumbnailUrl: payload.thumbnailUrl,
        competencyId: payload.competencyId,
        categoryId: payload.categoryId,
        status: ContentStatus.PENDING_APPROVAL,
      },
    });

    if (video.storageKey) {
      await this.mediaProcessing.enqueue({
        videoId: video.id,
        storageKey: video.storageKey,
        operations: ['duration', 'thumbnail'],
      });
    }

    return { data: { id: video.id, status: video.status } };
  }
}

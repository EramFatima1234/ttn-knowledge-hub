import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourceKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async listForVideo(videoId: string) {
    const resources = await this.prisma.attachment.findMany({
      where: { videoId },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      data: resources.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        fileKey: r.fileKey,
        mimeType: r.mimeType,
        sizeBytes: r.sizeBytes,
        resourceKind: r.resourceKind,
        label: r.label,
        externalUrl: r.externalUrl,
        downloadUrl: r.externalUrl ?? this.storageService.getUrl(r.fileKey),
      })),
    };
  }

  async upsertForVideo(
    videoId: string,
    userId: string,
    isAdmin: boolean,
    data: {
      resourceKind: ResourceKind;
      label?: string;
      externalUrl?: string;
      fileKey?: string;
      fileName?: string;
      mimeType?: string;
      sizeBytes?: number;
    },
  ) {
    const video = await this.prisma.video.findFirst({
      where: { id: videoId, deletedAt: null },
    });
    if (!video) throw new NotFoundException('Video not found');
    if (!isAdmin && video.uploadedById !== userId) {
      throw new NotFoundException('Video not found');
    }

    const count = await this.prisma.attachment.count({ where: { videoId } });
    const resource = await this.prisma.attachment.create({
      data: {
        videoId,
        resourceKind: data.resourceKind,
        label: data.label ?? data.resourceKind,
        externalUrl: data.externalUrl,
        fileKey: data.fileKey ?? data.externalUrl ?? '',
        fileName: data.fileName ?? data.label ?? 'resource',
        mimeType: data.mimeType ?? 'application/octet-stream',
        sizeBytes: data.sizeBytes ?? 0,
        sortOrder: count,
        storageProvider: this.storageService.getProviderName(),
      },
    });

    return {
      data: {
        ...resource,
        downloadUrl:
          resource.externalUrl ?? this.storageService.getUrl(resource.fileKey),
      },
    };
  }
}

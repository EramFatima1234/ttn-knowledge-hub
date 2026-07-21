import {
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, existsSync, statSync } from 'fs';
import type { Request, Response } from 'express';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class StreamingService {
  constructor(private readonly storageService: StorageService) {}

  resolveStorageKey(video: {
    storageKey?: string | null;
    videoUrl?: string | null;
  }): string | null {
    if (video.storageKey) return video.storageKey;
    if (!video.videoUrl) return null;

    const url = video.videoUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const storageMatch = url.match(/\/storage\/(.+)$/);
      if (storageMatch) return storageMatch[1];
      const uploadsMatch = url.match(/\/uploads\/(.+)$/);
      if (uploadsMatch) return uploadsMatch[1];
      return null;
    }

    if (url.startsWith('/storage/')) {
      return url.replace(/^\/storage\//, '');
    }
    if (url.startsWith('/uploads/')) {
      return url.replace(/^\/uploads\//, '');
    }
    return null;
  }

  isExternalUrl(videoUrl?: string | null): boolean {
    if (!videoUrl) return false;
    return videoUrl.startsWith('http://') || videoUrl.startsWith('https://');
  }

  streamLocalFile(key: string, req: Request, res: Response): StreamableFile {
    const filePath = this.storageService.resolveAbsolutePath(key);
    if (!filePath || !existsSync(filePath)) {
      throw new NotFoundException('Video file not found');
    }

    const stat = statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });

      const stream = createReadStream(filePath, { start, end });
      return new StreamableFile(stream);
    }

    res.set({
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    });

    return new StreamableFile(createReadStream(filePath));
  }
}

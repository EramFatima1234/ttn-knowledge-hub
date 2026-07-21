import { Injectable, Logger } from '@nestjs/common';
import {
  MediaProcessingPort,
  MediaProcessingJob,
  MediaProcessingResult,
} from '../../../common/ports/media-processing.port';

@Injectable()
export class NoOpMediaProcessingAdapter implements MediaProcessingPort {
  private readonly logger = new Logger(NoOpMediaProcessingAdapter.name);

  async enqueue(job: MediaProcessingJob): Promise<MediaProcessingResult> {
    this.logger.debug(`Media processing queued (noop): ${job.videoId}`);
    return { videoId: job.videoId, status: 'queued' };
  }

  async getStatus(videoId: string): Promise<MediaProcessingResult | null> {
    return { videoId, status: 'queued' };
  }
}

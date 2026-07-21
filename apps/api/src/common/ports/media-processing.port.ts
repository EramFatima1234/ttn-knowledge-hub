/**
 * Extension point for FFmpeg / media transcoding pipelines.
 * Implement when adding HLS/DASH packaging or thumbnail generation.
 */
export interface MediaProcessingJob {
  videoId: string;
  storageKey: string;
  operations: Array<'transcode' | 'thumbnail' | 'duration' | 'waveform'>;
}

export interface MediaProcessingResult {
  videoId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  outputs?: Record<string, string>;
  error?: string;
}

export interface MediaProcessingPort {
  enqueue(job: MediaProcessingJob): Promise<MediaProcessingResult>;
  getStatus(videoId: string): Promise<MediaProcessingResult | null>;
}

export const MEDIA_PROCESSING_PORT = Symbol('MEDIA_PROCESSING_PORT');

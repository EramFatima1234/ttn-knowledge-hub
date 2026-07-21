import { Module } from '@nestjs/common';
import { MEDIA_PROCESSING_PORT } from '../../common/ports/media-processing.port';
import { QUEUE_PORT } from '../../common/ports/queue.port';
import { CACHE_PORT } from '../../common/ports/cache.port';
import { NoOpMediaProcessingAdapter } from './adapters/noop-media-processing.adapter';
import { InMemoryQueueAdapter } from './adapters/in-memory-queue.adapter';
import { InMemoryCacheAdapter } from './adapters/in-memory-cache.adapter';

@Module({
  providers: [
    { provide: MEDIA_PROCESSING_PORT, useClass: NoOpMediaProcessingAdapter },
    { provide: QUEUE_PORT, useClass: InMemoryQueueAdapter },
    { provide: CACHE_PORT, useClass: InMemoryCacheAdapter },
  ],
  exports: [MEDIA_PROCESSING_PORT, QUEUE_PORT, CACHE_PORT],
})
export class MediaModule {}

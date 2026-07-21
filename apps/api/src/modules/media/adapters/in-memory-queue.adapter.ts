import { Injectable, Logger } from '@nestjs/common';
import { QueueJob, QueuePort } from '../../../common/ports/queue.port';

@Injectable()
export class InMemoryQueueAdapter implements QueuePort {
  private readonly logger = new Logger(InMemoryQueueAdapter.name);

  async enqueue<T>(job: QueueJob<T>): Promise<string> {
    this.logger.debug(`Queue job (in-memory): ${job.name}`);
    return `job-${Date.now()}`;
  }
}

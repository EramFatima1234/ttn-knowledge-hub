/**
 * Extension point for BullMQ / background job queues.
 */
export interface QueueJob<T = unknown> {
  name: string;
  payload: T;
  delayMs?: number;
}

export interface QueuePort {
  enqueue<T>(job: QueueJob<T>): Promise<string>;
}

export const QUEUE_PORT = Symbol('QUEUE_PORT');

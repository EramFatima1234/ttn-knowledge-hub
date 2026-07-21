import { Injectable, Logger } from '@nestjs/common';
import { PushPayload, PushPort } from '../push.port';

@Injectable()
export class ConsolePushAdapter implements PushPort {
  private readonly logger = new Logger(ConsolePushAdapter.name);

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    this.logger.log(
      `[PUSH] user=${userId} | ${payload.title}: ${payload.body}`,
    );
  }
}

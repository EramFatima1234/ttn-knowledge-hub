import { Inject, Injectable } from '@nestjs/common';
import { PushPayload, PushPort, PUSH_PORT } from './push.port';

@Injectable()
export class PushService {
  constructor(@Inject(PUSH_PORT) private readonly pushPort: PushPort) {}

  sendToUser(userId: string, payload: PushPayload): Promise<void> {
    return this.pushPort.sendToUser(userId, payload);
  }
}

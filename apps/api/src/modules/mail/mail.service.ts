import { Inject, Injectable } from '@nestjs/common';
import { MailMessage, MailPort, MAIL_PORT } from './mail.port';

@Injectable()
export class MailService {
  constructor(@Inject(MAIL_PORT) private readonly mailPort: MailPort) {}

  send(message: MailMessage): Promise<void> {
    return this.mailPort.send(message);
  }
}

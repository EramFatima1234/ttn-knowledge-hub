import { Injectable, Logger } from '@nestjs/common';
import { MailMessage, MailPort } from '../mail.port';

@Injectable()
export class ConsoleMailAdapter implements MailPort {
  private readonly logger = new Logger(ConsoleMailAdapter.name);

  async send(message: MailMessage): Promise<void> {
    this.logger.log(
      `[MAIL] To: ${message.to} | Subject: ${message.subject}\n${message.text}`,
    );
  }
}

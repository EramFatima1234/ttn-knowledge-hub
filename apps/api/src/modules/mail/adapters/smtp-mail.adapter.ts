import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailMessage, MailPort } from '../mail.port';

@Injectable()
export class SmtpMailAdapter implements MailPort {
  private readonly logger = new Logger(SmtpMailAdapter.name);
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from =
      this.configService.get<string>('mail.from') ??
      'KnowledgeHub <noreply@tothenew.com>';
  }

  async send(message: MailMessage): Promise<void> {
    const host = this.configService.get<string>('mail.smtp.host');
    if (!host) {
      throw new Error('SMTP host is not configured');
    }

    const transporter = nodemailer.createTransport({
      host,
      port: this.configService.get<number>('mail.smtp.port') ?? 587,
      secure: this.configService.get<boolean>('mail.smtp.secure') ?? false,
      auth: {
        user: this.configService.get<string>('mail.smtp.user'),
        pass: this.configService.get<string>('mail.smtp.pass'),
      },
    });

    await transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html ?? message.text.replace(/\n/g, '<br/>'),
    });

    this.logger.log(`Sent email to ${message.to}: ${message.subject}`);
  }
}

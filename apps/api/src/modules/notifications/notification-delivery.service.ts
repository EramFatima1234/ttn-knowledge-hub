import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PushService } from '../push/push.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsRepository } from './notifications.repository';

export interface DeliverNotificationInput {
  userId: string;
  type: string;
  title: string;
  body?: string;
  payload?: Prisma.InputJsonValue;
  email?: boolean;
  push?: boolean;
  actionUrl?: string;
}

@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly pushService: PushService,
  ) {}

  async deliver(input: DeliverNotificationInput) {
    const notification = await this.notificationsRepository.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      payload: input.payload,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true },
    });

    if (user?.email && input.email !== false) {
      try {
        await this.mailService.send({
          to: user.email,
          subject: `[KnowledgeHub] ${input.title}`,
          text: `${input.body ?? input.title}\n\nOpen KnowledgeHub: ${input.actionUrl ?? 'http://localhost:3000'}`,
        });
      } catch {
        this.logger.warn(`Failed to send email to ${user.email}`);
      }
    }

    if (input.push !== false) {
      try {
        await this.pushService.sendToUser(input.userId, {
          title: input.title,
          body: input.body ?? input.title,
          url: input.actionUrl,
        });
      } catch {
        this.logger.warn(`Failed to send push to user ${input.userId}`);
      }
    }

    return notification;
  }
}

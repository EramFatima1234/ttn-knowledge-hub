import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildMeta } from '../../common/dto/pagination.dto';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationDelivery: NotificationDeliveryService,
  ) {}

  async notify(data: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    payload?: Prisma.InputJsonValue;
    email?: boolean;
    push?: boolean;
    actionUrl?: string;
  }) {
    return this.notificationDelivery.deliver(data);
  }

  async list(userId: string, page: number, limit: number, unreadOnly = false) {
    const result = await this.notificationsRepository.findForUser(
      userId,
      page,
      limit,
      unreadOnly,
    );
    return {
      data: {
        items: result.items.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          body: item.body,
          payload: item.payload as Record<string, unknown> | null,
          readAt: item.readAt?.toISOString() ?? null,
          createdAt: item.createdAt.toISOString(),
        })),
        meta: buildMeta(result.page, result.limit, result.total),
      },
    };
  }

  async unreadCount(userId: string) {
    const count = await this.notificationsRepository.unreadCount(userId);
    return { data: { count } };
  }

  async markRead(id: string, userId: string) {
    await this.notificationsRepository.markRead(id, userId);
    return { data: { success: true } };
  }

  async markAllRead(userId: string) {
    await this.notificationsRepository.markAllRead(userId);
    return { data: { success: true } };
  }

  async notifyApprovalApproved(userId: string, videoId: string, title: string) {
    return this.notify({
      userId,
      type: 'APPROVAL_APPROVED',
      title: 'Video approved',
      body: `"${title}" has been published.`,
      payload: { videoId },
      actionUrl: `http://localhost:3000/watch/${videoId}`,
    });
  }

  async notifyApprovalRejected(userId: string, videoId: string, title: string) {
    return this.notify({
      userId,
      type: 'APPROVAL_REJECTED',
      title: 'Video needs changes',
      body: `"${title}" was sent back to draft.`,
      payload: { videoId },
      actionUrl: `http://localhost:3000/team/upload`,
    });
  }
}

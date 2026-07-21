import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../../../prisma/prisma.service';
import { PushPayload, PushPort } from '../push.port';

@Injectable()
export class WebPushAdapter implements PushPort {
  private readonly logger = new Logger(WebPushAdapter.name);
  private configured = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const publicKey = this.configService.get<string>('push.vapidPublicKey');
    const privateKey = this.configService.get<string>('push.vapidPrivateKey');
    const subject = this.configService.get<string>('push.vapidSubject');

    if (publicKey && privateKey && subject) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.configured = true;
    }
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.configured) {
      throw new Error('Web push is not configured');
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify({
              title: payload.title,
              body: payload.body,
              url: payload.url,
              data: payload.data,
            }),
          );
        } catch (error) {
          this.logger.warn(
            `Removing invalid push subscription for user ${userId}`,
          );
          await this.prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
        }
      }),
    );
  }
}

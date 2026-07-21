import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PushModule } from '../push/push.module';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [MailModule, PushModule],
  controllers: [],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationDeliveryService,
  ],
  exports: [NotificationsService, NotificationDeliveryService],
})
export class NotificationsModule {}

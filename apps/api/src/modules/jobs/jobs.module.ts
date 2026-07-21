import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { MeetReminderCron } from './meet-reminder.cron';
import { MeetReminderService } from './meet-reminder.service';

@Module({
  imports: [NotificationsModule],
  providers: [MeetReminderService, MeetReminderCron],
  exports: [MeetReminderService],
})
export class JobsModule {}

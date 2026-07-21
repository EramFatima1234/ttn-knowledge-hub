import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MeetReminderService } from './meet-reminder.service';

@Injectable()
export class MeetReminderCron {
  private readonly logger = new Logger(MeetReminderCron.name);

  constructor(private readonly meetReminderService: MeetReminderService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleMeetReminders() {
    try {
      await this.meetReminderService.processReminders();
    } catch (error) {
      this.logger.error('Meet reminder cron failed', error as Error);
    }
  }
}

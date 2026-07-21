import { Injectable, Logger } from '@nestjs/common';

/**
 * Meet reminder cron is disabled. Knowledge Meets are recorded sessions published
 * to the library — not live events. Use publish notifications instead.
 */
@Injectable()
export class MeetReminderService {
  private readonly logger = new Logger(MeetReminderService.name);

  async processReminders() {
    this.logger.debug(
      'Meet reminder cron skipped (recorded-session model; no upcoming live events).',
    );
    return { dayReminders: 0, hourReminders: 0 };
  }
}

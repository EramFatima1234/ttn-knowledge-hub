import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsoleMailAdapter } from './adapters/console-mail.adapter';
import { SmtpMailAdapter } from './adapters/smtp-mail.adapter';
import { MAIL_PORT } from './mail.port';
import { MailService } from './mail.service';

@Module({
  providers: [
    MailService,
    ConsoleMailAdapter,
    SmtpMailAdapter,
    {
      provide: MAIL_PORT,
      inject: [ConfigService, ConsoleMailAdapter, SmtpMailAdapter],
      useFactory: (
        configService: ConfigService,
        consoleAdapter: ConsoleMailAdapter,
        smtpAdapter: SmtpMailAdapter,
      ) => {
        const provider = configService.get<string>('mail.provider') ?? 'console';
        return provider === 'smtp' ? smtpAdapter : consoleAdapter;
      },
    },
  ],
  exports: [MailService, MAIL_PORT],
})
export class MailModule {}

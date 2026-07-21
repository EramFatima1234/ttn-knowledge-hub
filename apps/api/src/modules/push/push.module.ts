import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsolePushAdapter } from './adapters/console-push.adapter';
import { WebPushAdapter } from './adapters/web-push.adapter';
import { PushController } from './push.controller';
import { PUSH_PORT } from './push.port';
import { PushService } from './push.service';

@Module({
  controllers: [PushController],
  providers: [
    PushService,
    ConsolePushAdapter,
    WebPushAdapter,
    {
      provide: PUSH_PORT,
      inject: [ConfigService, ConsolePushAdapter, WebPushAdapter],
      useFactory: (
        configService: ConfigService,
        consoleAdapter: ConsolePushAdapter,
        webPushAdapter: WebPushAdapter,
      ) => {
        const provider = configService.get<string>('push.provider') ?? 'console';
        return provider === 'webpush' ? webPushAdapter : consoleAdapter;
      },
    },
  ],
  exports: [PushService, PUSH_PORT],
})
export class PushModule {}

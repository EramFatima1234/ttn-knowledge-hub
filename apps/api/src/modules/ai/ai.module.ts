import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchModule } from '../search/search.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AI_PROVIDER } from './ai.port';
import { GeminiProvider } from './adapters/gemini.provider';
import { NoopAiProvider } from './adapters/noop-ai.provider';

@Module({
  imports: [SearchModule],
  controllers: [AiController],
  providers: [
    AiService,
    GeminiProvider,
    NoopAiProvider,
    {
      provide: AI_PROVIDER,
      inject: [ConfigService, GeminiProvider, NoopAiProvider],
      useFactory: (
        configService: ConfigService,
        gemini: GeminiProvider,
        noop: NoopAiProvider,
      ) => {
        const provider = (configService.get<string>('ai.provider') ?? 'gemini').toLowerCase();
        if (provider === 'gemini' && gemini.isConfigured()) {
          return gemini;
        }
        if (provider === 'openai' || provider === 'ollama') {
          return noop;
        }
        return gemini.isConfigured() ? gemini : noop;
      },
    },
  ],
  exports: [AiService],
})
export class AiModule {}

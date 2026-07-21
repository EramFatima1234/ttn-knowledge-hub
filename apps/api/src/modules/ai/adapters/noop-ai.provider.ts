import { Injectable } from '@nestjs/common';
import { AIProvider, AiGenerateOptions } from '../ai.port';

@Injectable()
export class NoopAiProvider implements AIProvider {
  readonly name = 'noop';

  isConfigured() {
    return false;
  }

  supportsStreaming() {
    return false;
  }

  async generate(_options: AiGenerateOptions): Promise<string> {
    throw new Error('AI provider is not configured. Set GEMINI_API_KEY.');
  }
}

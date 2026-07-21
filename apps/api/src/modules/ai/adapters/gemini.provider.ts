import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AiGenerateOptions } from '../ai.port';
import {
  GEMINI_KEY_SETUP_HINT,
  isValidGeminiApiKey,
} from '../gemini-key.util';

const DEFAULT_MODEL = 'gemini-2.0-flash';

@Injectable()
export class GeminiProvider implements AIProvider, OnModuleInit {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const key = this.apiKey;
    if (key && !isValidGeminiApiKey(key)) {
      this.logger.warn(GEMINI_KEY_SETUP_HINT);
    }
  }

  private get apiKey(): string {
    return this.configService.get<string>('ai.geminiApiKey') ?? '';
  }

  private get model(): string {
    return this.configService.get<string>('ai.geminiModel') ?? DEFAULT_MODEL;
  }

  isConfigured(): boolean {
    return isValidGeminiApiKey(this.apiKey);
  }

  private assertReady(): void {
    const key = this.apiKey;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    if (!isValidGeminiApiKey(key)) {
      throw new Error(GEMINI_KEY_SETUP_HINT);
    }
  }

  supportsStreaming(): boolean {
    return this.isConfigured();
  }

  async generate(options: AiGenerateOptions): Promise<string> {
    const chunks: string[] = [];
    for await (const part of this.generateStream(options)) {
      chunks.push(part);
    }
    return chunks.join('');
  }

  async *generateStream(
    options: AiGenerateOptions,
  ): AsyncGenerator<string, void, unknown> {
    if (!this.isConfigured()) {
      this.assertReady();
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(this.apiKey)}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: options.prompt }],
        },
      ],
      ...(options.system
        ? {
            systemInstruction: {
              parts: [{ text: options.system }],
            },
          }
        : {}),
      generationConfig: {
        temperature: options.temperature ?? 0.4,
        ...(options.json ? { responseMimeType: 'application/json' } : {}),
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Gemini API error ${response.status}: ${errText.slice(0, 500)}`);
      if (response.status === 401 || response.status === 403) {
        throw new Error(GEMINI_KEY_SETUP_HINT);
      }
      throw new Error(`Gemini request failed (${response.status})`);
    }

    if (!response.body) {
      throw new Error('Gemini returned empty body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let payload = trimmed;
        if (trimmed.startsWith('data:')) {
          payload = trimmed.slice(5).trim();
        }
        if (!payload || payload === '[DONE]') continue;

        try {
          const parsed = JSON.parse(payload) as
            | {
                candidates?: { content?: { parts?: { text?: string }[] } }[];
              }
            | Array<{
                candidates?: { content?: { parts?: { text?: string }[] } }[];
              }>;

          const chunks = Array.isArray(parsed) ? parsed : [parsed];
          for (const chunk of chunks) {
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          }
        } catch {
          // skip malformed SSE chunk
        }
      }
    }
  }
}

/** Future: OpenAIProvider implements AIProvider */
/** Future: OllamaProvider implements AIProvider */

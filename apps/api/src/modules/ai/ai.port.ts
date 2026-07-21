/**
 * Extension point for LLM providers (Gemini, OpenAI, Ollama, …).
 */
export interface AiGenerateOptions {
  system?: string;
  prompt: string;
  temperature?: number;
  json?: boolean;
}

export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  supportsStreaming(): boolean;
  generate(options: AiGenerateOptions): Promise<string>;
  generateStream?(options: AiGenerateOptions): AsyncGenerator<string, void, unknown>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');

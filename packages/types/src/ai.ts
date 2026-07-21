import { ContentType } from './auth';

export interface AiContentRef {
  id: string;
  type: ContentType | 'SPEAKER' | 'COMPETENCY';
  title: string;
  href: string;
  subtitle?: string | null;
}

export interface AiDiscoverResponse {
  answer: string;
  sessions: AiContentRef[];
  series: AiContentRef[];
  speakers: AiContentRef[];
  competencies: AiContentRef[];
  suggestedPrompts: string[];
}

export interface AiVideoSummaryResponse {
  summary: string;
  keyTakeaways: string[];
}

export interface AiQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AiQuizResponse {
  questions: AiQuizQuestion[];
}

export interface AiStatusResponse {
  enabled: boolean;
  provider: string;
  streaming: boolean;
}

export const AI_SUGGESTED_PROMPTS = [
  'Show React sessions',
  'Find Docker learning path',
  'Who teaches Next.js?',
  'Show AI videos',
  'Explain TypeScript roadmap',
] as const;

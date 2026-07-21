import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { AI_SUGGESTED_PROMPTS } from '@knowledgehub/types';
import type {
  AiDiscoverResponse,
  AiQuizResponse,
  AiVideoSummaryResponse,
  AiContentRef,
} from '@knowledgehub/types';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { SearchSort } from '../search/dto/search-query.dto';
import { AI_PROVIDER, AIProvider } from './ai.port';
import { GEMINI_KEY_SETUP_HINT } from './gemini-key.util';
import { contentHref, parseModelJson } from './ai.utils';

interface CatalogContext {
  searchItems: AiContentRef[];
  speakers: AiContentRef[];
  competencies: AiContentRef[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_PROVIDER) private readonly ai: AIProvider,
    private readonly searchService: SearchService,
    private readonly prisma: PrismaService,
  ) {}

  status() {
    return {
      enabled: this.ai.isConfigured(),
      provider: this.ai.name,
      streaming: this.ai.supportsStreaming(),
    };
  }

  async discover(prompt: string, userId?: string): Promise<AiDiscoverResponse> {
    let catalog: CatalogContext;
    try {
      catalog = await this.buildCatalogContext(prompt);
    } catch (error) {
      this.logger.warn(`Catalog context failed: ${(error as Error).message}`);
      catalog = { searchItems: [], speakers: [], competencies: [] };
    }
    const fallback = this.fallbackDiscover(prompt, catalog);

    if (!this.ai.isConfigured()) {
      return fallback;
    }

    try {
      const system = `You are KnowledgeHub AI, a learning discovery assistant for an internal engineering academy.
You help users find videos, knowledge meets (recorded sessions), series, speakers, and competencies.
Never pretend to be a generic chatbot. Ground answers in the catalog context provided.
Respond with JSON only matching this schema:
{
  "answer": "markdown string, concise, helpful",
  "sessionIds": ["uuid from catalog videos/meets"],
  "seriesIds": ["uuid"],
  "speakerIds": ["uuid"],
  "competencyIds": ["uuid"],
  "suggestedPrompts": ["up to 3 short follow-up prompts"]
}`;

      const catalogJson = JSON.stringify({
        videosAndMeets: catalog.searchItems.filter(
          (i) => i.type === ContentType.VIDEO || i.type === ContentType.KNOWLEDGE_MEET,
        ),
        series: catalog.searchItems.filter((i) => i.type === ContentType.KNOWLEDGE_SERIES),
        speakers: catalog.speakers,
        competencies: catalog.competencies,
      });

      const raw = await this.ai.generate({
        system,
        prompt: `User question: ${prompt}\n\nCatalog:\n${catalogJson}`,
        json: true,
        temperature: 0.35,
      });

      const parsed = parseModelJson<{
        answer?: string;
        sessionIds?: string[];
        seriesIds?: string[];
        speakerIds?: string[];
        competencyIds?: string[];
        suggestedPrompts?: string[];
      }>(raw);

      const sessions = this.pickRefs(
        catalog.searchItems.filter(
          (i) => i.type === ContentType.VIDEO || i.type === ContentType.KNOWLEDGE_MEET,
        ),
        parsed.sessionIds,
      );
      const series = this.pickRefs(
        catalog.searchItems.filter((i) => i.type === ContentType.KNOWLEDGE_SERIES),
        parsed.seriesIds,
      );
      const speakers = this.pickRefs(catalog.speakers, parsed.speakerIds);
      const competencies = this.pickRefs(catalog.competencies, parsed.competencyIds);

      return {
        answer: parsed.answer?.trim() || fallback.answer,
        sessions: sessions.length ? sessions : fallback.sessions,
        series: series.length ? series : fallback.series,
        speakers: speakers.length ? speakers : fallback.speakers,
        competencies: competencies.length ? competencies : fallback.competencies,
        suggestedPrompts:
          parsed.suggestedPrompts?.slice(0, 3) ?? [...AI_SUGGESTED_PROMPTS].slice(0, 3),
      };
    } catch (error) {
      this.logger.warn(`Discover AI failed: ${(error as Error).message}`);
      return fallback;
    }
  }

  async *discoverStream(
    prompt: string,
    userId?: string,
  ): AsyncGenerator<{ type: 'delta'; text: string } | { type: 'done'; result: AiDiscoverResponse }> {
    let catalog: CatalogContext;
    try {
      catalog = await this.buildCatalogContext(prompt);
    } catch (error) {
      this.logger.warn(`Catalog context failed: ${(error as Error).message}`);
      catalog = { searchItems: [], speakers: [], competencies: [] };
    }

    const fallback = this.fallbackDiscover(prompt, catalog);

    if (!this.ai.isConfigured() || !this.ai.generateStream) {
      yield { type: 'delta', text: fallback.answer };
      yield { type: 'done', result: fallback };
      return;
    }

    const system = `You are KnowledgeHub AI for learning discovery. Write a helpful markdown answer (2-4 short paragraphs max) based on the catalog. Do not output JSON.`;
    const catalogJson = JSON.stringify(catalog);

    let full = '';
    try {
      for await (const chunk of this.ai.generateStream({
        system,
        prompt: `User: ${prompt}\nCatalog:\n${catalogJson}`,
        temperature: 0.35,
      })) {
        full += chunk;
        yield { type: 'delta', text: chunk };
      }
    } catch (error) {
      const message = (error as Error).message;
      this.logger.warn(`Discover stream failed: ${message}`);
      const hint = message.includes('AI Studio') || message.includes('AIza')
        ? message
        : `${fallback.answer}\n\n*(AI generation unavailable — showing catalog matches. ${GEMINI_KEY_SETUP_HINT})*`;
      yield { type: 'delta', text: hint };
      yield { type: 'done', result: { ...fallback, answer: hint } };
      return;
    }

    yield {
      type: 'done',
      result: {
        ...fallback,
        answer: full.trim() || fallback.answer,
      },
    };
  }

  async summarizeVideo(videoId: string, userId: string): Promise<AiVideoSummaryResponse> {
    const video = await this.getVideoContext(videoId, userId);
    this.assertAiConfigured();

    const raw = await this.ai.generate({
      system: 'You summarize internal learning videos for engineers. Output JSON only.',
      prompt: `Create a concise learning summary for this video.
Title: ${video.title}
Description: ${video.description ?? 'N/A'}
Competency: ${video.competency?.name ?? 'N/A'}
Speaker: ${video.speaker?.name ?? 'N/A'}
Duration seconds: ${video.durationSeconds ?? 'unknown'}

JSON schema:
{"summary":"2-3 paragraphs markdown","keyTakeaways":["bullet","..."]}`,
      json: true,
      temperature: 0.3,
    });

    return parseModelJson<AiVideoSummaryResponse>(raw);
  }

  async quizForVideo(videoId: string, userId: string): Promise<AiQuizResponse> {
    const video = await this.getVideoContext(videoId, userId);
    this.assertAiConfigured();

    const raw = await this.ai.generate({
      system: 'You create multiple-choice quizzes for learning videos. Output JSON only.',
      prompt: `Generate exactly 5 multiple-choice questions from this video metadata.
Title: ${video.title}
Description: ${video.description ?? 'N/A'}
Competency: ${video.competency?.name ?? 'N/A'}

JSON schema:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}`,
      json: true,
      temperature: 0.45,
    });

    const parsed = parseModelJson<AiQuizResponse>(raw);
    return {
      questions: (parsed.questions ?? []).slice(0, 5),
    };
  }

  private assertAiConfigured() {
    if (!this.ai.isConfigured()) {
      throw new ServiceUnavailableException(GEMINI_KEY_SETUP_HINT);
    }
  }

  private async getVideoContext(videoId: string, userId: string) {
    const video = await this.prisma.video.findFirst({
      where: { id: videoId, deletedAt: null, status: 'PUBLISHED' },
      include: { competency: true, speaker: true, category: true },
    });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  private async buildCatalogContext(prompt: string): Promise<CatalogContext> {
    const q = prompt.trim().slice(0, 200);
    const [searchResult, speakers, competencies] = await Promise.all([
      this.searchService.search(
        { q, page: 1, limit: 12, sort: SearchSort.RELEVANCE },
        undefined,
      ),
      this.prisma.speaker.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { designation: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        select: { id: true, name: true, slug: true, designation: true },
      }),
      this.prisma.competency.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        select: { id: true, name: true, slug: true, description: true },
      }),
    ]);

    const searchItems: AiContentRef[] = searchResult.data.items.map((item) => ({
      id: item.id,
      type: item.type as AiContentRef['type'],
      title: item.title,
      subtitle: item.competency?.name ?? item.subtitle ?? null,
      href: contentHref(item.type, item.id),
    }));

    return {
      searchItems,
      speakers: speakers.map((s) => ({
        id: s.id,
        type: 'SPEAKER' as const,
        title: s.name,
        subtitle: s.designation,
        href: contentHref('SPEAKER', s.id, s.slug),
      })),
      competencies: competencies.map((c) => ({
        id: c.id,
        type: 'COMPETENCY' as const,
        title: c.name,
        subtitle: c.description,
        href: contentHref('COMPETENCY', c.id, c.slug),
      })),
    };
  }

  private fallbackDiscover(prompt: string, catalog: CatalogContext): AiDiscoverResponse {
    const sessions = catalog.searchItems.filter(
      (i) => i.type === ContentType.VIDEO || i.type === ContentType.KNOWLEDGE_MEET,
    );
    const series = catalog.searchItems.filter((i) => i.type === ContentType.KNOWLEDGE_SERIES);

    return {
      answer: `Here are learning resources related to **${prompt}** from the KnowledgeHub catalog.`,
      sessions,
      series,
      speakers: catalog.speakers,
      competencies: catalog.competencies,
      suggestedPrompts: [...AI_SUGGESTED_PROMPTS].slice(0, 5),
    };
  }

  private pickRefs(pool: AiContentRef[], ids?: string[]): AiContentRef[] {
    if (!ids?.length) return [];
    const set = new Set(ids);
    return pool.filter((item) => set.has(item.id));
  }
}

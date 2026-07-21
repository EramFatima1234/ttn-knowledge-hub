import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, estypes } from '@elastic/elasticsearch';
import { ContentType } from '@prisma/client';
import { SearchPort, SearchQueryResult, SearchSuggestionRow } from '../search.port';
import { SearchQueryDto, SearchSort } from '../dto/search-query.dto';

@Injectable()
export class ElasticsearchSearchAdapter implements SearchPort, OnModuleInit {
  private readonly logger = new Logger(ElasticsearchSearchAdapter.name);
  private client: Client | null = null;
  private readonly indexName: string;
  private available = false;

  constructor(private readonly configService: ConfigService) {
    this.indexName =
      this.configService.get<string>('search.indexName') ?? 'knowledgehub_content';
  }

  async onModuleInit() {
    const url =
      this.configService.get<string>('search.elasticsearchUrl') ??
      'http://localhost:9200';
    this.client = new Client({ node: url });
    try {
      await this.client.ping();
      this.available = true;
      this.logger.log(`Connected to Elasticsearch at ${url}`);
    } catch (error) {
      this.available = false;
      this.logger.warn(`Elasticsearch unavailable at ${url}`);
    }
  }

  isAvailable() {
    return this.available && this.client !== null;
  }

  getClient() {
    return this.client;
  }

  getIndexName() {
    return this.indexName;
  }

  async search(dto: SearchQueryDto): Promise<SearchQueryResult> {
    if (!this.client || !this.available) {
      throw new Error('Elasticsearch unavailable');
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const types = dto.types?.length
      ? dto.types
      : [
          ContentType.VIDEO,
          ContentType.KNOWLEDGE_MEET,
          ContentType.KNOWLEDGE_SERIES,
        ];

    const must: Record<string, unknown>[] = [
      {
        multi_match: {
          query: dto.q,
          fields: ['title^3', 'subtitle^2', 'description'],
          fuzziness: 'AUTO',
        },
      },
      { terms: { type: types } },
    ];

    if (dto.competencyId) {
      must.push({ term: { competencyId: dto.competencyId } });
    }
    if (dto.categoryId) {
      must.push({ term: { categoryId: dto.categoryId } });
    }

    const sort = this.buildSort(dto.sort ?? SearchSort.RELEVANCE);

    const response = await this.client.search({
      index: this.indexName,
      from: (page - 1) * limit,
      size: limit,
      query: { bool: { must } },
      sort,
    });

    const hits = response.hits.hits;
    const total =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : (response.hits.total?.value ?? 0);

    return {
      items: hits.map((hit) => {
        const source = hit._source as Record<string, unknown>;
        return {
          id: String(source.id),
          type: String(source.type),
          title: String(source.title),
          description: (source.description as string | null) ?? null,
          thumbnailUrl: (source.thumbnailUrl as string | null) ?? null,
          subtitle: (source.subtitle as string | null) ?? null,
          publishedAt: (source.publishedAt as string | null) ?? null,
          scheduledAt: (source.scheduledAt as string | null) ?? null,
          viewCount: source.viewCount as number | undefined,
          rank: typeof hit._score === 'number' ? hit._score : undefined,
          competency: source.competencyId
            ? {
                id: String(source.competencyId),
                name: String(source.competencyName ?? ''),
                slug: String(source.competencySlug ?? ''),
              }
            : null,
          category: source.categoryId
            ? {
                id: String(source.categoryId),
                name: String(source.categoryName ?? ''),
                slug: String(source.categorySlug ?? ''),
              }
            : null,
        };
      }),
      total,
      page,
      limit,
    };
  }

  async suggestions(q: string, limit: number): Promise<SearchSuggestionRow[]> {
    if (!this.client || !this.available) {
      throw new Error('Elasticsearch unavailable');
    }

    const response = await this.client.search({
      index: this.indexName,
      size: limit,
      query: {
        multi_match: {
          query: q,
          fields: ['title^2', 'subtitle'],
          fuzziness: 'AUTO',
        },
      },
      _source: ['id', 'type', 'title'],
    });

    return response.hits.hits.map((hit) => {
      const source = hit._source as Record<string, unknown>;
      return {
        id: String(source.id),
        type: String(source.type),
        title: String(source.title),
      };
    });
  }

  private buildSort(sort: SearchSort): estypes.Sort {
    switch (sort) {
      case SearchSort.NEWEST:
        return [
          { publishedAt: { order: 'desc', missing: '_last' } },
          { scheduledAt: { order: 'desc', missing: '_last' } },
        ];
      case SearchSort.POPULAR:
        return [{ viewCount: { order: 'desc' } }, '_score'];
      default:
        return ['_score'];
    }
  }
}

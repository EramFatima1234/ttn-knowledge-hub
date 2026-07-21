import { Injectable, Inject, Logger } from '@nestjs/common';
import { buildMeta } from '../../common/dto/pagination.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { SEARCH_PORT, SearchPort } from './search.port';
import { PostgresSearchAdapter } from './adapters/postgres-search.adapter';
import { SearchAnalyticsRepository } from './search-analytics.repository';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(SEARCH_PORT) private readonly searchPort: SearchPort,
    private readonly postgresSearchAdapter: PostgresSearchAdapter,
    private readonly searchAnalytics: SearchAnalyticsRepository,
  ) {}

  async search(dto: SearchQueryDto, userId?: string) {
    let resultCount = 0;

    try {
      const result = await this.searchPort.search(dto);
      resultCount = result.total;

      if (dto.q?.trim()) {
        void this.searchAnalytics.logQuery(userId, dto.q, resultCount);
      }

      return {
        data: {
          items: result.items,
          meta: buildMeta(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      this.logger.warn('Primary search provider failed, falling back to Postgres FTS');
      const result = await this.postgresSearchAdapter.search(dto);
      resultCount = result.total;

      if (dto.q?.trim()) {
        void this.searchAnalytics.logQuery(userId, dto.q, resultCount);
      }

      return {
        data: {
          items: result.items,
          meta: buildMeta(result.page, result.limit, result.total),
        },
      };
    }
  }

  async suggestions(q: string, limit: number) {
    try {
      const rows = await this.searchPort.suggestions(q, limit);
      return {
        data: rows.map((row) => ({
          id: row.id,
          type: row.type,
          text: row.title,
        })),
      };
    } catch {
      const rows = await this.postgresSearchAdapter.suggestions(q, limit);
      return {
        data: rows.map((row) => ({
          id: row.id,
          type: row.type,
          text: row.title,
        })),
      };
    }
  }

  recent(userId: string) {
    return this.searchAnalytics.recentForUser(userId).then((data) => ({ data }));
  }

  popular() {
    return this.searchAnalytics.popular().then((data) => ({ data }));
  }

  trending() {
    return this.searchAnalytics.trending().then((data) => ({ data }));
  }
}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchSearchAdapter } from './adapters/elasticsearch-search.adapter';
import { PostgresSearchAdapter } from './adapters/postgres-search.adapter';
import { SearchController } from './search.controller';
import { SearchIndexService } from './search-index.service';
import { SearchRepository } from './search.repository';
import { SEARCH_PORT } from './search.port';
import { SearchAnalyticsRepository } from './search-analytics.repository';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchRepository,
    SearchAnalyticsRepository,
    SearchIndexService,
    PostgresSearchAdapter,
    ElasticsearchSearchAdapter,
    {
      provide: SEARCH_PORT,
      inject: [ConfigService, PostgresSearchAdapter, ElasticsearchSearchAdapter],
      useFactory: (
        configService: ConfigService,
        postgresAdapter: PostgresSearchAdapter,
        elasticsearchAdapter: ElasticsearchSearchAdapter,
      ) => {
        const provider = configService.get<string>('search.provider') ?? 'postgres';
        return provider === 'elasticsearch' ? elasticsearchAdapter : postgresAdapter;
      },
    },
  ],
  exports: [SearchService, SearchIndexService],
})
export class SearchModule {}

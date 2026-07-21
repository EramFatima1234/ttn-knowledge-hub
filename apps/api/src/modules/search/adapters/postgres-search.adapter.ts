import { Injectable } from '@nestjs/common';
import { SearchPort, SearchQueryResult, SearchSuggestionRow } from '../search.port';
import { SearchRepository } from '../search.repository';
import { SearchQueryDto } from '../dto/search-query.dto';

@Injectable()
export class PostgresSearchAdapter implements SearchPort {
  constructor(private readonly searchRepository: SearchRepository) {}

  async search(dto: SearchQueryDto): Promise<SearchQueryResult> {
    return this.searchRepository.search(dto);
  }

  async suggestions(q: string, limit: number): Promise<SearchSuggestionRow[]> {
    return this.searchRepository.suggestions(q, limit);
  }
}

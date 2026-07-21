import { SearchQueryDto } from './dto/search-query.dto';

export interface SearchResultItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  subtitle: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  viewCount?: number;
  rank?: number;
  competency: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
}

export interface SearchQueryResult {
  items: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchSuggestionRow {
  id: string;
  type: string;
  title: string;
}

export interface SearchIndexDocument {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  subtitle?: string | null;
  competencyId?: string | null;
  categoryId?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  viewCount?: number;
  competencyName?: string | null;
  competencySlug?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
}

export interface SearchPort {
  search(dto: SearchQueryDto): Promise<SearchQueryResult>;
  suggestions(q: string, limit: number): Promise<SearchSuggestionRow[]>;
}

export const SEARCH_PORT = Symbol('SEARCH_PORT');

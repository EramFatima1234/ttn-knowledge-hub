import { ContentType } from './auth';
import { PaginationMeta } from './content';

export type SearchSort = 'relevance' | 'newest' | 'popular';

export interface SearchFilters {
  q: string;
  types?: ContentType[];
  competencyId?: string;
  categoryId?: string;
  speakerId?: string;
  seriesId?: string;
  minDuration?: number;
  maxDuration?: number;
  sort?: SearchSort;
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  type: ContentType;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  subtitle?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  viewCount?: number;
  competency: { id: string; name: string; slug: string } | null;
  category?: { id: string; name: string; slug: string } | null;
  rank?: number;
}

export interface SearchResponse {
  items: SearchResultItem[];
  meta: PaginationMeta;
}

export interface SearchSuggestion {
  text: string;
  type: ContentType;
  id: string;
}

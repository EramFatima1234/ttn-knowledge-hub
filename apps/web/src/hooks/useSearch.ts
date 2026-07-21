import { useQuery } from "@tanstack/react-query";
import {
  SearchResponse,
  SearchSuggestion,
  SearchSort,
  ContentType,
} from "@knowledgehub/types";
import { fetchApiJson } from "@/lib/api";

export function useSearch(params: {
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
}) {
  const search = new URLSearchParams();
  search.set("q", params.q);
  if (params.types?.length) {
    params.types.forEach((type) => search.append("types", type));
  }
  if (params.competencyId) search.set("competencyId", params.competencyId);
  if (params.categoryId) search.set("categoryId", params.categoryId);
  if (params.speakerId) search.set("speakerId", params.speakerId);
  if (params.seriesId) search.set("seriesId", params.seriesId);
  if (params.minDuration != null) search.set("minDuration", String(params.minDuration));
  if (params.maxDuration != null) search.set("maxDuration", String(params.maxDuration));
  if (params.sort) search.set("sort", params.sort);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));

  return useQuery({
    queryKey: ["search", params],
    queryFn: () =>
      fetchApiJson<SearchResponse>(`search?${search.toString()}`),
    enabled: Boolean(params.q?.trim()),
  });
}

export function useSearchSuggestions(q: string) {
  return useQuery({
    queryKey: ["search", "suggestions", q],
    queryFn: () =>
      fetchApiJson<SearchSuggestion[]>(
        `search/suggestions?q=${encodeURIComponent(q)}`,
      ),
    enabled: q.trim().length >= 2,
  });
}

export function useRecentSearches() {
  return useQuery({
    queryKey: ["search", "recent"],
    queryFn: () => fetchApiJson<string[]>("search/recent"),
  });
}

export function usePopularSearches() {
  return useQuery({
    queryKey: ["search", "popular"],
    queryFn: () => fetchApiJson<Array<{ query: string; count: number }>>("search/popular"),
  });
}

export function useTrendingSearches() {
  return useQuery({
    queryKey: ["search", "trending"],
    queryFn: () => fetchApiJson<Array<{ query: string; count: number }>>("search/trending"),
  });
}

import { useQuery } from "@tanstack/react-query";
import {
  AdminAnalytics,
  ExploreHub,
  RecommendationsFeed,
  RelatedContent,
  ContentType,
} from "@knowledgehub/types";
import { fetchApiJson } from "@/lib/api";

export function useExploreHub() {
  return useQuery({
    queryKey: ["explore"],
    queryFn: () => fetchApiJson<ExploreHub>("explore"),
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["feed", "recommendations"],
    queryFn: () => fetchApiJson<RecommendationsFeed>("feed/recommendations"),
  });
}

export function useRelatedContent(contentType: ContentType, id: string) {
  return useQuery({
    queryKey: ["feed", "related", contentType, id],
    queryFn: () =>
      fetchApiJson<RelatedContent>(`feed/related/${contentType}/${id}`),
    enabled: Boolean(id),
  });
}

export function useAdminAnalytics(days = 30) {
  return useQuery({
    queryKey: ["admin", "analytics", days],
    queryFn: () =>
      fetchApiJson<AdminAnalytics>(`admin/analytics?days=${days}`),
  });
}

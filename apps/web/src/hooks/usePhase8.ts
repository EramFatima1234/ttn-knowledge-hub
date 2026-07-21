import { useQuery } from "@tanstack/react-query";
import {
  usePopularSearches,
  useRecentSearches,
  useTrendingSearches,
} from "@/hooks/useSearch";
import { useAdminAnalytics } from "@/hooks/useRecommendations";
import { fetchApiJson } from "@/lib/api";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  type HomepageSectionConfig,
} from "@/lib/mock/phase8";

interface SearchAnalyticsItem {
  query: string;
  count: number;
  hasResults?: boolean;
  suggestion?: string;
}

interface TeamFeedbackItem {
  id: string;
  sessionTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export function useSearchAnalyticsDashboard() {
  const popular = usePopularSearches();
  const trending = useTrendingSearches();
  const recent = useRecentSearches();

  const adminAnalytics = useQuery({
    queryKey: ["admin", "search-analytics"],
    queryFn: () =>
      fetchApiJson<{
        popular: SearchAnalyticsItem[];
        trending: SearchAnalyticsItem[];
        noResults: SearchAnalyticsItem[];
      }>("admin/search/analytics"),
  });

  const topSearched = adminAnalytics.data?.popular ?? popular.data ?? [];
  const noResults = adminAnalytics.data?.noResults ?? [];
  const suggestions = noResults
    .slice(0, 5)
    .map((item) => item.suggestion ?? `Add content for "${item.query}"`);

  return {
    topSearched,
    noResults,
    popular: popular.data ?? [],
    trending: trending.data ?? [],
    recent: recent.data ?? [],
    suggestions,
    isLoading:
      popular.isLoading
      || trending.isLoading
      || recent.isLoading
      || adminAnalytics.isLoading,
    isError: popular.isError || trending.isError || adminAnalytics.isError,
  };
}

export function useReportsDashboard() {
  const analytics = useAdminAnalytics(30);
  const reports = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () =>
      fetchApiJson<{
        mostViewedSession: { title: string; viewCount: number };
        mostPopularSeries: { title: string; viewCount: number };
        topCompetency: { name: string; sessionCount: number };
        topSpeaker: { name: string; sessionCount: number };
        activeUsers: number;
        monthlyUploads: number;
        downloads: number;
        watchHours: number;
      }>("admin/reports"),
  });

  const completionRate =
    analytics.data && analytics.data.engagement.watchSessions > 0
      ? Math.min(
          100,
          Math.round(
            (analytics.data.content.totalPublished
              / Math.max(analytics.data.engagement.watchSessions, 1))
              * 100,
          ),
        )
      : 0;

  const highlights = reports.data
    ? [
        {
          id: "speaker",
          label: "Top Speaker",
          value: reports.data.topSpeaker.name,
          change: `${reports.data.topSpeaker.sessionCount} sessions`,
          trend: "up" as const,
        },
        {
          id: "session",
          label: "Most Viewed Session",
          value: reports.data.mostViewedSession.title,
          change: `${reports.data.mostViewedSession.viewCount} views`,
          trend: "up" as const,
        },
        {
          id: "competency",
          label: "Top Competency",
          value: reports.data.topCompetency.name,
          change: `${reports.data.topCompetency.sessionCount} items`,
          trend: "up" as const,
        },
        {
          id: "users",
          label: "Active Users",
          value: String(reports.data.activeUsers),
          change: "Last 30 days",
          trend: "neutral" as const,
        },
      ]
    : [];

  return {
    highlights,
    reports: reports.data,
    analytics: analytics.data,
    isLoading: analytics.isLoading || reports.isLoading,
    isError: analytics.isError || reports.isError,
    derived: {
      avgWatchMinutes: analytics.data
        ? Math.round(
            analytics.data.engagement.watchSessions
              / Math.max(analytics.data.users.activeUsers, 1),
          )
        : 0,
      completionRate,
      monthlyEngagement: analytics.data?.content.viewsByDay ?? [],
      topSeries: analytics.data?.content.topVideos.slice(0, 5) ?? [],
    },
  };
}

export function useTeamFeedback() {
  return useQuery({
    queryKey: ["admin", "feedback", "recent"],
    queryFn: () => fetchApiJson<TeamFeedbackItem[]>("admin/feedback/recent"),
  });
}

export function useHomepageLayout() {
  return useQuery({
    queryKey: ["phase8", "homepage-layout"],
    queryFn: () =>
      fetchApiJson<HomepageSectionConfig[]>("homepage/layout"),
    placeholderData: DEFAULT_HOMEPAGE_SECTIONS,
  });
}

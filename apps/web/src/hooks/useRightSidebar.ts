import { useMemo } from "react";
import { ContentType } from "@knowledgehub/types";
import { useBookmarks, useContinueWatching, useMeets } from "@/hooks/useContent";
import { useProgressSummary, useWeeklyActivity } from "@/hooks/usePhase7";
import { useExploreHub } from "@/hooks/useRecommendations";
import { useSpeakers } from "@/hooks/usePhase7Features";
import { useTrendingSearches } from "@/hooks/useSearch";
import { WEEKLY_GOAL_MINUTES } from "@/lib/mock/right-sidebar";
import type {
  RightSidebarBookmark,
  RightSidebarCompetency,
  RightSidebarProgress,
  RightSidebarTrendingTechnology,
  RightSidebarLatestMeet,
  RightSidebarSpeakerSpotlight,
} from "@/components/right-sidebar/types";

function getDateParts(iso: string): {
  dateDay: string;
  dateMonth: string;
  dateWeekday: string;
} {
  const date = new Date(iso);
  return {
    dateWeekday: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
    dateDay: new Intl.DateTimeFormat("en-IN", { day: "numeric" }).format(date),
    dateMonth: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date),
  };
}

function getDayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const key = date.toDateString();
  if (key === today.toDateString()) return "Today";
  if (key === tomorrow.toDateString()) return "Tomorrow";

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function bookmarkHref(
  contentType: ContentType,
  contentId: string,
  videoId?: string | null,
  hasRecording?: boolean,
): string {
  if (contentType === ContentType.VIDEO) return `/watch/${contentId}`;
  if (contentType === ContentType.KNOWLEDGE_MEET) {
    return videoId && hasRecording ? `/watch/${videoId}` : `/meets/${contentId}`;
  }
  return `/series/${contentId}`;
}

export function useRightSidebarProgress() {
  const { data, isLoading, isError, refetch } = useProgressSummary();
  const { data: weekly = [] } = useWeeklyActivity();
  const { data: continueWatching = [] } = useContinueWatching();

  const progress = useMemo<RightSidebarProgress | null>(() => {
    if (!data) return null;

    const weeklyMinutes = weekly.reduce((sum, day) => sum + day.minutes, 0);
    const weeklyGoalPercent = Math.min(
      100,
      Math.round((weeklyMinutes / WEEKLY_GOAL_MINUTES) * 100),
    );

    const continueItem = continueWatching[0];
    const continueHref = continueItem
      ? bookmarkHref(continueItem.contentType, continueItem.contentId)
      : "/";

    return {
      streakDays: data.currentStreakDays,
      completedSessions: data.completedVideos,
      hoursWatched: data.hoursWatched,
      weeklyGoalPercent,
      continueHref,
    };
  }, [continueWatching, data, weekly]);

  return { progress, isLoading, isError, refetch };
}

export function useRightSidebarLatestMeets() {
  const { data: meets = [], isLoading, isError, refetch } = useMeets({
    sort: "newest",
    limit: 4,
  });

  const sessions = useMemo<RightSidebarLatestMeet[]>(() => {
    return meets.slice(0, 4).map((meet) => {
      const dateParts = getDateParts(meet.scheduledAt);
      const watchHref =
        meet.videoId && meet.hasRecording
          ? `/watch/${meet.videoId}`
          : `/meets/${meet.id}`;
      return {
        id: meet.id,
        title: meet.title,
        speakerName: meet.speaker?.name ?? null,
        scheduledAt: meet.scheduledAt,
        durationMinutes: meet.durationMinutes,
        competency: meet.competency?.name ?? null,
        difficulty: meet.difficulty ?? null,
        dayLabel: getDayLabel(meet.scheduledAt),
        timeLabel: getTimeLabel(meet.scheduledAt),
        ...dateParts,
        thumbnailUrl: meet.thumbnailUrl,
        href: watchHref,
        kind: "meet",
      };
    });
  }, [meets]);

  return { sessions, isLoading, isError, refetch };
}

/** @deprecated Use useRightSidebarLatestMeets */
export const useRightSidebarUpcoming = useRightSidebarLatestMeets;

export function useRightSidebarCompetencies() {
  const { data: hub, isLoading, isError, refetch } = useExploreHub();

  const competencies = useMemo<RightSidebarCompetency[]>(() => {
    if (!hub?.competencies?.length) return [];

    return hub.competencies
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        sessionCount: item.videoCount + item.meetCount + item.seriesCount,
      }))
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 8);
  }, [hub]);

  return { competencies, isLoading, isError, refetch };
}

export function useRightSidebarBookmarks() {
  const { data: bookmarks = [], isLoading, isError, refetch } = useBookmarks();

  const items = useMemo<RightSidebarBookmark[]>(() => {
    return bookmarks.slice(0, 3).map((item) => ({
      id: item.id,
      contentType: item.contentType,
      contentId: item.contentId,
      title: item.title,
      seriesLabel: item.subtitle,
      durationLabel: item.subtitle?.match(/\d+\s*min/i)?.[0] ?? null,
      thumbnailUrl: item.thumbnailUrl,
      href: bookmarkHref(item.contentType, item.contentId),
    }));
  }, [bookmarks]);

  return { bookmarks: items, isLoading, isError, refetch };
}

export function useRightSidebarTrending() {
  const { data: trending = [], isLoading, isError, refetch } = useTrendingSearches();
  const { data: hub } = useExploreHub();

  const technologies = useMemo<RightSidebarTrendingTechnology[]>(() => {
    const trendForIndex = (index: number): RightSidebarTrendingTechnology["trend"] => {
      if (index === 0) return "hot";
      if (index < 3) return "up";
      return "stable";
    };
    const emojiForTrend = (trend: RightSidebarTrendingTechnology["trend"]) => {
      if (trend === "hot") return "🔥";
      if (trend === "up") return "⬆";
      return "—";
    };

    if (trending.length > 0) {
      return trending.slice(0, 6).map((item, index) => {
        const trend = trendForIndex(index);
        const filterSlug = item.query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return {
          id: `trend-${index}`,
          name: item.query,
          sessionCount: item.count,
          trend,
          emoji: emojiForTrend(trend),
          filterSlug: filterSlug || `q-${index}`,
        };
      });
    }

    return (hub?.competencies ?? [])
      .sort((a, b) => (b.videoCount + b.meetCount) - (a.videoCount + a.meetCount))
      .slice(0, 6)
      .map((item, index) => {
        const trend = trendForIndex(index);
        return {
          id: item.id,
          name: item.name,
          sessionCount: item.videoCount + item.meetCount + item.seriesCount,
          trend,
          emoji: emojiForTrend(trend),
          filterSlug: item.slug,
        };
      });
  }, [hub, trending]);

  return { technologies, isLoading, isError, refetch };
}

export function useRightSidebarSpeakerSpotlight() {
  const { data: speakers = [], isLoading, isError, refetch } = useSpeakers();

  const speaker = useMemo<RightSidebarSpeakerSpotlight | null>(() => {
    if (!speakers.length) return null;

    const top = [...speakers].sort(
      (a, b) => (b.sessionCount ?? 0) - (a.sessionCount ?? 0),
    )[0];

    return {
      id: top.id,
      slug: top.slug,
      name: top.name,
      designation: top.designation ?? null,
      competency: null,
      avatarUrl: top.avatarUrl ?? null,
      avgRating: null,
      sessionCount: top.sessionCount ?? 0,
    };
  }, [speakers]);

  return { speaker, isLoading, isError, refetch };
}

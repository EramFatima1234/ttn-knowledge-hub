import type { ContentType } from "@knowledgehub/types";

export interface RightSidebarProgress {
  streakDays: number;
  completedSessions: number;
  hoursWatched: number;
  weeklyGoalPercent: number;
  continueHref: string;
}

export interface RightSidebarLatestMeet {
  id: string;
  title: string;
  speakerName: string | null;
  scheduledAt: string;
  durationMinutes: number;
  competency: string | null;
  difficulty: string | null;
  dayLabel: string;
  timeLabel: string;
  dateDay: string;
  dateMonth: string;
  dateWeekday: string;
  thumbnailUrl: string | null;
  href: string;
  kind: "meet" | "series";
}

/** @deprecated Use RightSidebarLatestMeet */
export type RightSidebarUpcomingSession = RightSidebarLatestMeet;

export interface RightSidebarTrendingTechnology {
  id: string;
  name: string;
  sessionCount: number;
  trend: "hot" | "up" | "stable";
  emoji: string;
  filterSlug: string;
}

export interface RightSidebarCompetency {
  id: string;
  name: string;
  slug: string;
  sessionCount: number;
}

export interface RightSidebarSpeakerSpotlight {
  id: string;
  slug: string;
  name: string;
  designation: string | null;
  competency: string | null;
  avgRating: number | null;
  sessionCount: number;
  avatarUrl: string | null;
}

export interface RightSidebarBookmark {
  id: string;
  contentType: ContentType;
  contentId: string;
  title: string;
  seriesLabel: string | null;
  durationLabel: string | null;
  thumbnailUrl: string | null;
  href: string;
}

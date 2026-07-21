import type { KnowledgeMeetSummary } from './content';

export type ResourceKind =
  | 'GITHUB_REPO'
  | 'SLIDES'
  | 'PDF'
  | 'DEMO'
  | 'DOCUMENTATION'
  | 'LINK'
  | 'OTHER';

export interface PlaybackManifest {
  videoId: string;
  streamUrl: string;
  supportsRange: boolean;
  posterUrl: string | null;
  durationSeconds: number;
  progressSeconds: number;
  completed: boolean;
  playbackSpeed: number;
  autoPlayNext: boolean;
  nextEpisode: {
    id: string;
    title: string;
    videoId: string | null;
  } | null;
}

export interface LearningProgressSummary {
  completedVideos: number;
  inProgressVideos: number;
  remainingVideos: number;
  hoursWatched: number;
  currentStreakDays: number;
  seriesProgress: Array<{
    seriesId: string;
    title: string;
    percent: number;
  }>;
}

export interface WeeklyActivityPoint {
  date: string;
  minutes: number;
}

export interface SpeakerProfile {
  id: string;
  name: string;
  slug: string;
  designation: string | null;
  avatarUrl: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  avgRating: number | null;
  followerCount: number;
  isFollowing: boolean;
  competencies: Array<{ id: string; name: string; slug: string }>;
  recentSessions: Array<{
    id: string;
    title: string;
    thumbnailUrl: string | null;
    durationSeconds: number;
    publishedAt: string | null;
    competency: string | null;
  }>;
  recentMeets: Array<{
    id: string;
    title: string;
    scheduledAt: string;
    status: string;
    thumbnailUrl: string | null;
    competency: string | null;
    videoId: string | null;
    hasRecording: boolean;
  }>;
  recentSeries: Array<{
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    sessionCount: number;
    competency: string | null;
  }>;
}

export interface QaAnswer {
  id: string;
  body: string;
  isAccepted: boolean;
  isPinned: boolean;
  voteScore: number;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
  userVote: number;
}

export interface QaQuestion {
  id: string;
  body: string;
  isPinned: boolean;
  voteScore: number;
  viewCount: number;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
  userVote: number;
  answers: QaAnswer[];
}

export interface VideoResource {
  id: string;
  fileName: string;
  fileKey: string;
  mimeType: string;
  sizeBytes: number;
  resourceKind: ResourceKind | null;
  label: string | null;
  externalUrl: string | null;
  downloadUrl: string;
}

export interface DashboardFeed {
  continueWatching: unknown[];
  recommended: unknown[];
  upcomingSessions: unknown[];
  latestMeets?: KnowledgeMeetSummary[];
  learningProgress: LearningProgressSummary;
  bookmarks: unknown[];
  history: unknown[];
  weeklyActivity: WeeklyActivityPoint[];
  announcements: unknown[];
  popularThisWeek: unknown[];
  latestVideos: unknown[];
  knowledgeSeries: unknown[];
}

export interface SearchTrendItem {
  query: string;
  count: number;
}

export interface StudioDraft {
  id: string;
  userId: string;
  contentType: string;
  contentId: string;
  step: string;
  payload: Record<string, unknown>;
}

import { ContentType } from './auth';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface SpeakerSummary {
  id: string;
  name: string;
  designation: string | null;
  avatarUrl: string | null;
}

export interface CompetencySummary {
  id: string;
  name: string;
  slug: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface VideoSummary {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  viewCount: number;
  isPinned: boolean;
  publishedAt: string | null;
  speaker: SpeakerSummary | null;
  competency: CompetencySummary | null;
  category: CategorySummary | null;
  progressPercent?: number;
}

export interface VideoDetail extends VideoSummary {
  tags: { id: string; name: string; slug: string }[];
  repository: { url: string; provider: string | null } | null;
  attachments: {
    id: string;
    fileName: string;
    mimeType: string;
    fileKey: string;
  }[];
  series: { id: string; title: string; sessionTitle: string } | null;
  userHistory: {
    progressSeconds: number;
    completed: boolean;
  } | null;
  isBookmarked: boolean;
}

export interface KnowledgeMeetSummary {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  attendanceType: string;
  meetingLink: string | null;
  recordingUrl: string | null;
  videoId: string | null;
  hasRecording: boolean;
  recordingStatus?: string | null;
  difficulty?: string | null;
  tags?: string[];
  speaker: SpeakerSummary | null;
  competency: CompetencySummary | null;
}

export interface KnowledgeMeetDetail extends KnowledgeMeetSummary {
  bannerUrl: string | null;
  repositoryUrl: string | null;
  presentationUrl: string | null;
  commentsEnabled: boolean;
  feedbackEnabled: boolean;
  visibility: string;
  isBookmarked: boolean;
}

export interface SeriesSessionItem {
  id: string;
  title: string;
  orderIndex: number;
  video: VideoSummary | null;
  progressPercent: number;
  completed: boolean;
}

export interface KnowledgeSeriesSummary {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  sessionCount: number;
  progressPercent: number;
  competency: CompetencySummary | null;
}

export interface KnowledgeSeriesDetail extends KnowledgeSeriesSummary {
  sessions: SeriesSessionItem[];
  isBookmarked: boolean;
}

export interface CommentItem {
  id: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  replies: CommentItem[];
}

export interface BookmarkItem {
  id: string;
  contentType: ContentType;
  contentId: string;
  createdAt: string;
  title: string;
  thumbnailUrl: string | null;
  subtitle: string | null;
}

export interface HistoryItem {
  id: string;
  contentType: ContentType;
  contentId: string;
  progressSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
  title: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  progressPercent: number;
}

export interface HomeFeed {
  continueWatching: HistoryItem[];
  latestVideos: VideoSummary[];
  latestMeets?: KnowledgeMeetSummary[];
  /** @deprecated Use latestMeets */
  upcomingMeets: KnowledgeMeetSummary[];
  knowledgeSeries: KnowledgeSeriesSummary[];
  trendingVideos: VideoSummary[];
}

export type CmsPublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "PENDING";
export type ResourceType = "PDF" | "SLIDES" | "GITHUB" | "ZIP" | "EXTERNAL" | "DOCUMENTATION";
export type SeriesLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type MeetDifficulty = SeriesLevel;
export type AttendanceMode = "ONLINE" | "OFFLINE";

export interface CmsSpeakerRef {
  id: string;
  name: string;
  designation?: string | null;
  avatarUrl?: string | null;
}

export interface CmsCompetencyRef {
  id: string;
  name: string;
  slug: string;
}

export interface AdminMeetRecord {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  speakerId?: string;
  speaker?: CmsSpeakerRef | null;
  competencyId?: string;
  competency?: CmsCompetencyRef | null;
  scheduledAt: string;
  startTime?: string;
  durationMinutes: number;
  meetingLink?: string | null;
  location?: string | null;
  attendanceType: AttendanceMode;
  bannerUrl?: string | null;
  thumbnailUrl?: string | null;
  recordingUrl?: string | null;
  videoId?: string | null;
  hasRecording?: boolean;
  hasRecordingUpload?: boolean;
  recordingStatus?: string | null;
  githubRepo?: string | null;
  slidesUrl?: string | null;
  pdfResources?: string[];
  difficulty?: MeetDifficulty;
  tags?: string[];
  homepageTags?: string[];
  displayPriority?: number;
  externalResourceUrls?: string[];
  mandatory?: boolean;
  status: CmsPublishStatus;
  source: "api" | "cms";
  updatedAt: string;
}

export interface AdminSeriesRecord {
  id: string;
  title: string;
  description?: string | null;
  competencyId?: string;
  competency?: CmsCompetencyRef | null;
  instructorId?: string;
  instructor?: CmsSpeakerRef | null;
  level: SeriesLevel;
  bannerUrl?: string | null;
  thumbnailUrl?: string | null;
  estimatedDurationMinutes?: number;
  tags?: string[];
  homepageTags?: string[];
  displayPriority?: number;
  publishedAt?: string | null;
  episodeCount: number;
  plannedEpisodeCount?: number;
  viewCount: number;
  status: CmsPublishStatus;
  source: "api" | "cms";
  updatedAt: string;
}

export interface AdminEpisodeRecord {
  id: string;
  seriesId: string;
  orderIndex: number;
  title: string;
  description?: string | null;
  durationMinutes?: number;
  videoUrl?: string | null;
  storageKey?: string | null;
  thumbnailUrl?: string | null;
  hasVideo?: boolean;
  githubRepo?: string | null;
  slidesUrl?: string | null;
  pdfUrl?: string | null;
  resources?: string[];
  status: CmsPublishStatus;
  updatedAt: string;
}

export interface AdminResourceRecord {
  id: string;
  title: string;
  description?: string | null;
  competencyId?: string;
  competency?: CmsCompetencyRef | null;
  resourceType: ResourceType;
  fileUrl?: string | null;
  externalUrl?: string | null;
  thumbnailUrl?: string | null;
  downloadCount: number;
  status: CmsPublishStatus;
  source: "api" | "cms";
  updatedAt: string;
}

export interface AdminSpeakerRecord {
  id: string;
  slug: string;
  name: string;
  designation?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  competencyId?: string | null;
  competency?: CmsCompetencyRef | null;
  sessionCount: number;
  source: "api" | "cms";
  updatedAt: string;
}

export interface AdminCompetencyRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sessionCount: number;
  seriesCount: number;
  resourceCount: number;
  source: "api" | "cms";
  updatedAt: string;
}

export interface PlatformSettings {
  homepageBannerTitle: string;
  homepageBannerSubtitle: string;
  homepageBannerImage: string;
  themeAccent: string;
  defaultCompetencyId: string;
  emailWelcomeTemplate: string;
  notifyNewSession: boolean;
  notifyApproval: boolean;
  featureQa: boolean;
  featureBookmarks: boolean;
}

export interface CmsStoreState {
  meets: AdminMeetRecord[];
  series: AdminSeriesRecord[];
  episodes: Record<string, AdminEpisodeRecord[]>;
  resources: AdminResourceRecord[];
  speakers: AdminSpeakerRecord[];
  competencies: AdminCompetencyRecord[];
  settings: PlatformSettings;
}

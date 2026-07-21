export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface TopContentItem {
  id: string;
  title: string;
  type: string;
  viewCount: number;
  thumbnailUrl: string | null;
}

export interface ContentAnalytics {
  totalPublished: number;
  totalViews: number;
  uploadsByDay: TimeSeriesPoint[];
  viewsByDay: TimeSeriesPoint[];
  topVideos: TopContentItem[];
}

export interface EngagementAnalytics {
  totalComments: number;
  totalBookmarks: number;
  watchSessions: number;
  commentsByDay: TimeSeriesPoint[];
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  usersByRole: { role: string; count: number }[];
  signupsByDay: TimeSeriesPoint[];
}

export interface AdminAnalytics {
  content: ContentAnalytics;
  engagement: EngagementAnalytics;
  users: UserAnalytics;
}

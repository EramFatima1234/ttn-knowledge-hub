export interface SearchAnalyticsItem {
  query: string;
  count: number;
  hasResults: boolean;
  suggestion?: string;
}

export interface ReportMetric {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface TeamFeedbackItem {
  id: string;
  sessionTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface HomepageSectionConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export const mockSearchNoResults: SearchAnalyticsItem[] = [
  { query: "MCP", count: 62, hasResults: false, suggestion: "Add Knowledge Meet on Model Context Protocol" },
  { query: "LangGraph", count: 41, hasResults: false, suggestion: "Upload a Gen AI session" },
  { query: "Kubernetes operators", count: 28, hasResults: false, suggestion: "Create a DevOps series" },
];

export const mockTopSearchedTechnologies: SearchAnalyticsItem[] = [
  { query: "React", count: 184, hasResults: true },
  { query: "Next.js", count: 156, hasResults: true },
  { query: "Gen AI", count: 142, hasResults: true },
  { query: "Docker", count: 98, hasResults: true },
  { query: "TypeScript", count: 87, hasResults: true },
];

export const mockAdminSearchSuggestions = [
  "Employees searched MCP 62 times with no matching sessions — consider a Knowledge Meet",
  "LangGraph searches up 34% this week — feature existing Gen AI content",
  "Docker networking is trending — pin DevOps series on homepage",
];

export const mockTeamFeedback: TeamFeedbackItem[] = [
  {
    id: "fb-1",
    sessionTitle: "Prompt Engineering Fundamentals",
    rating: 5,
    comment: "Clear examples and great pacing.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "fb-2",
    sessionTitle: "NestJS Microservices",
    rating: 4,
    comment: "Would love more deployment examples.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const mockReportHighlights: ReportMetric[] = [
  { id: "speaker", label: "Most Watched Speaker", value: "Abhinav Singh", change: "+12%", trend: "up" },
  { id: "session", label: "Highest Rated Session", value: "Prompt Engineering", change: "4.9★", trend: "up" },
  { id: "user", label: "Most Active User", value: "Priya Sharma", change: "38h watched", trend: "up" },
  { id: "competency", label: "Most Popular Competency", value: "Gen AI", change: "+24%", trend: "up" },
];

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: "welcome", title: "Welcome", visible: true, order: 0 },
  { id: "progress", title: "Learning Progress", visible: true, order: 1 },
  { id: "featured", title: "Featured Series", visible: true, order: 2 },
  { id: "continue", title: "Continue Watching", visible: true, order: 3 },
  { id: "recommended", title: "Recommended", visible: true, order: 4 },
  { id: "latest-meets", title: "Latest Knowledge Meets", visible: true, order: 5 },
  { id: "trending", title: "Trending", visible: true, order: 6 },
  { id: "series", title: "Knowledge Series", visible: true, order: 7 },
  { id: "latest", title: "Latest Uploads", visible: true, order: 8 },
];

export const HOMEPAGE_LAYOUT_STORAGE_KEY = "kh-homepage-layout-v1";

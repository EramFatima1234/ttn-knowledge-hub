import type {
  RightSidebarCompetency,
  RightSidebarSpeakerSpotlight,
  RightSidebarTrendingTechnology,
} from "@/components/right-sidebar/types";

export const WEEKLY_GOAL_MINUTES = 300;

export const mockTrendingTechnologies: RightSidebarTrendingTechnology[] = [
  {
    id: "nextjs",
    name: "Next.js",
    sessionCount: 62,
    trend: "hot",
    emoji: "🔥",
    filterSlug: "nextjs",
  },
  {
    id: "react",
    name: "React",
    sessionCount: 48,
    trend: "up",
    emoji: "⬆",
    filterSlug: "react",
  },
  {
    id: "gen-ai",
    name: "Gen AI",
    sessionCount: 37,
    trend: "up",
    emoji: "🤖",
    filterSlug: "gen-ai",
  },
  {
    id: "docker",
    name: "Docker",
    sessionCount: 25,
    trend: "up",
    emoji: "🐳",
    filterSlug: "docker",
  },
  {
    id: "aws",
    name: "AWS",
    sessionCount: 18,
    trend: "up",
    emoji: "☁",
    filterSlug: "aws",
  },
];

export const mockSpeakerSpotlight: RightSidebarSpeakerSpotlight = {
  id: "spotlight-1",
  slug: "abhinav-singh",
  name: "Abhinav Singh",
  designation: "Frontend Architect",
  competency: "JavaScript",
  avgRating: 4.9,
  sessionCount: 18,
  avatarUrl: null,
};

export const mockCompetencyFallbacks: RightSidebarCompetency[] = [
  { id: "js", name: "JavaScript", slug: "javascript", sessionCount: 42 },
  { id: "react", name: "React", slug: "react", sessionCount: 36 },
  { id: "next", name: "Next.js", slug: "nextjs", sessionCount: 29 },
  { id: "node", name: "Node.js", slug: "nodejs", sessionCount: 25 },
  { id: "java", name: "Java", slug: "java", sessionCount: 21 },
  { id: "genai", name: "Gen AI", slug: "gen-ai", sessionCount: 18 },
];

export interface ContentCardItem {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail: string;
  duration?: string;
  progress?: number;
  speaker?: string;
  competency?: string;
  badge?: string;
}

export const heroFeature = {
  title: "Generative AI Series",
  subtitle: "7 sessions · From prompts to production deployment",
  cta: "Continue Series",
  progress: 42,
  thumbnail:
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
};

export const continueWatching: ContentCardItem[] = [
  {
    id: "1",
    title: "Prompt Engineering Fundamentals",
    speaker: "Priya Sharma",
    duration: "42:18",
    progress: 68,
    competency: "Gen AI",
    thumbnail:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
  },
  {
    id: "2",
    title: "NestJS Authentication Patterns",
    speaker: "Rahul Verma",
    duration: "55:02",
    progress: 24,
    competency: "NestJS",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
  },
  {
    id: "3",
    title: "Kubernetes for Developers",
    speaker: "Anita Das",
    duration: "38:44",
    progress: 81,
    competency: "DevOps",
    thumbnail:
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&q=80",
  },
];

export const latestUploads: ContentCardItem[] = [
  {
    id: "4",
    title: "React Server Components Deep Dive",
    speaker: "Vikram Singh",
    duration: "48:10",
    competency: "React",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
  },
  {
    id: "5",
    title: "Spring Boot Microservices",
    speaker: "Neha Gupta",
    duration: "61:22",
    competency: "Java",
    thumbnail:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=80",
  },
  {
    id: "6",
    title: "Quality Engineering in CI/CD",
    speaker: "Arjun Mehta",
    duration: "35:50",
    competency: "QE",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  },
  {
    id: "7",
    title: "Cloud Cost Optimization",
    speaker: "Sneha Reddy",
    duration: "44:05",
    competency: "Cloud",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
  },
];

export const latestMeets: ContentCardItem[] = [
  {
    id: "m1",
    title: "Knowledge Meet: AI Agents in Production",
    subtitle: "Recorded · 45 min",
    speaker: "Platform Engineering",
    badge: "Intermediate",
    thumbnail:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
  },
  {
    id: "m2",
    title: "Frontend Guild: Design Systems",
    subtitle: "Recorded · 60 min",
    speaker: "Frontend Chapter",
    badge: "Beginner",
    thumbnail:
      "https://images.unsplash.com/photo-1558651716-9939386f3a8b?w=600&q=80",
  },
];

export const knowledgeSeries: ContentCardItem[] = [
  {
    id: "s1",
    title: "Generative AI Series",
    subtitle: "7 sessions · 42% complete",
    competency: "Gen AI",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  },
  {
    id: "s2",
    title: "Cloud Native Journey",
    subtitle: "5 sessions",
    competency: "Cloud",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
  },
];

export const announcements = [
  {
    id: "a1",
    title: "Q3 Learning Sprint is live",
    body: "Complete 3 competencies this quarter to earn your learning badge.",
  },
  {
    id: "a2",
    title: "New Gen AI series published",
    body: "Start with Prompt Engineering and advance to AI Agents.",
  },
];

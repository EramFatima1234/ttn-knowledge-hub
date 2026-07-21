export const HOMEPAGE_SECTION_TAGS = {
  HERO: 'homepage-hero',
  FEATURED: 'featured',
  TRENDING: 'trending',
  LATEST: 'latest',
  RECOMMENDED: 'recommended',
  POPULAR: 'popular',
  EDITORS_PICK: 'editors-pick',
  CONTINUE_LEARNING: 'continue-learning',
  AI_RECOMMENDED: 'ai-recommended',
} as const;

export type HomepageSectionTag =
  (typeof HOMEPAGE_SECTION_TAGS)[keyof typeof HOMEPAGE_SECTION_TAGS];

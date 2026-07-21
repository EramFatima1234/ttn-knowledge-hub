export interface HomepageSectionDto {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export interface PlatformSettingsDto {
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

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionDto[] = [
  { id: 'welcome', title: 'Welcome', visible: true, order: 0 },
  { id: 'progress', title: 'Learning Progress', visible: true, order: 1 },
  { id: 'featured', title: 'Featured Series', visible: true, order: 2 },
  { id: 'continue', title: 'Continue Watching', visible: true, order: 3 },
  { id: 'recommended', title: 'Recommended', visible: true, order: 4 },
  { id: 'latest-meets', title: 'Latest Knowledge Meets', visible: true, order: 5 },
  { id: 'trending', title: 'Trending', visible: true, order: 6 },
  { id: 'series', title: 'Knowledge Series', visible: true, order: 7 },
  { id: 'latest', title: 'Latest Uploads', visible: true, order: 8 },
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsDto = {
  homepageBannerTitle: 'Engineering Knowledge Hub',
  homepageBannerSubtitle: 'Learn from internal experts across competencies.',
  homepageBannerImage: '',
  themeAccent: '#DE1186',
  defaultCompetencyId: '',
  emailWelcomeTemplate: 'Welcome to KnowledgeHub, {{name}}!',
  notifyNewSession: true,
  notifyApproval: true,
  featureQa: true,
  featureBookmarks: true,
};

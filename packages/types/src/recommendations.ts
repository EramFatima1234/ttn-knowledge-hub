import {
  KnowledgeMeetSummary,
  KnowledgeSeriesSummary,
  VideoSummary,
} from './content';

export interface ExploreCompetency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  videoCount: number;
  meetCount: number;
  seriesCount: number;
}

export interface ExploreHub {
  competencies: ExploreCompetency[];
  featuredVideos: VideoSummary[];
  featuredSeries: KnowledgeSeriesSummary[];
  latestMeets?: KnowledgeMeetSummary[];
  /** @deprecated Use latestMeets */
  upcomingMeets: KnowledgeMeetSummary[];
}

export interface RecommendationsFeed {
  forYou: VideoSummary[];
  trending: VideoSummary[];
  basedOnBookmarks: VideoSummary[];
}

export interface RelatedContent {
  videos: VideoSummary[];
  series: KnowledgeSeriesSummary[];
  meets: KnowledgeMeetSummary[];
}

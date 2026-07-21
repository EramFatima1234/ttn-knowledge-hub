"use client";

import Link from "next/link";
import { Alert, Spin } from "antd";
import { SettingOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useDashboard } from "@/hooks/usePhase7";
import { useRecommendations } from "@/hooks/useRecommendations";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import FeaturedSection from "@/components/home/FeaturedSection";
import VideoGrid from "@/components/home/VideoGrid";
import ContentRow from "@/components/home/ContentRow";
import type {
  KnowledgeSeriesSummary,
  VideoSummary,
} from "@knowledgehub/types";

export default function HomeDashboard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isTeam = useAuthStore((s) => s.isTeam());
  const { data: dashboard, isLoading } = useDashboard();
  const { data: recommendations, isLoading: recommendationsLoading } = useRecommendations();

  if (isLoading || !dashboard) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  const continueWatching = dashboard.continueWatching as VideoSummary[];
  const recommended = (recommendations?.forYou?.length
    ? recommendations.forYou
    : dashboard.recommended) as VideoSummary[];
  const trending = (recommendations?.trending?.length
    ? recommendations.trending
    : dashboard.popularThisWeek) as VideoSummary[];
  const latestVideos = dashboard.latestVideos as VideoSummary[];
  const knowledgeSeries = dashboard.knowledgeSeries as KnowledgeSeriesSummary[];

  const topVideos = [...trending, ...latestVideos]
    .filter((video, index, list) => list.findIndex((item) => item.id === video.id) === index)
    .slice(0, 12);

  const featuredVideo = topVideos[0] ?? recommended[0] ?? continueWatching[0] ?? null;

  return (
    <div className="kh-home kh-youtube-home">
      {isAdmin && (
        <Alert
          type="info"
          showIcon
          icon={<SettingOutlined />}
          className="kh-home__role-banner"
          title={
            <>
              You are viewing the learning home as an admin.{" "}
              <Link href="/admin/content?tab=meets">Open Admin CMS</Link>
            </>
          }
        />
      )}

      {isTeam && !isAdmin && (
        <Alert
          type="info"
          showIcon
          icon={<UploadOutlined />}
          className="kh-home__role-banner"
          title={
            <>
              Upload and manage your content from the team studio.{" "}
              <Link href="/team/studio">Go to Studio</Link>
            </>
          }
        />
      )}

      <div className="kh-home__welcome-block">
        <h1>Welcome back, {user?.name?.split(" ")[0] || "Learner"}</h1>
        <p>Discover videos, join sessions, and keep learning.</p>
      </div>

      <HomeSearchBar />

      <FeaturedSection video={featuredVideo} />

      <VideoGrid
        title="Top videos"
        videos={topVideos}
        loading={recommendationsLoading}
        viewAllHref="/explore"
      />

      {continueWatching.length > 0 && (
        <ContentRow title="Continue watching" items={continueWatching} />
      )}

      <ContentRow
        title="Recommended for you"
        items={recommended}
        loading={recommendationsLoading}
      />

      <ContentRow title="Trending now" items={trending} loading={recommendationsLoading} />

      <ContentRow title="Latest sessions" items={latestVideos} />

      {knowledgeSeries.length > 0 && (
        <ContentRow
          title="Knowledge series"
          items={knowledgeSeries}
          showProgress
        />
      )}
    </div>
  );
}

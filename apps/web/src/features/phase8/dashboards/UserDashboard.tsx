"use client";

import Link from "next/link";
import { Col, Row, Spin } from "antd";
import { FireOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useDashboard } from "@/hooks/usePhase7";
import { useBookmarks } from "@/hooks/useContent";
import { useSpeakers } from "@/hooks/usePhase7Features";
import FeaturedSection from "@/components/home/FeaturedSection";
import ContentRow from "@/components/home/ContentRow";
import DashboardProgress from "@/components/home/DashboardProgress";
import QuickActionsGrid from "@/features/phase8/quick-actions/QuickActionsGrid";
import { userQuickActions } from "@/features/phase8/quick-actions/actions";
import {
  ActivityFeed,
  ProgressCard,
  SpeakerCard,
  StatCard,
  LatestMeetsCard,
} from "@/features/phase8/widgets";
import { useHomepageLayout } from "@/hooks/usePhase8";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/mock/phase8";
import type {
  HistoryItem,
  KnowledgeMeetSummary,
  KnowledgeSeriesSummary,
  VideoSummary,
} from "@knowledgehub/types";

function visibleSections(sections = DEFAULT_HOMEPAGE_SECTIONS) {
  return [...sections]
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order);
}

export default function UserDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: dashboard, isLoading, isError } = useDashboard();
  const { data: bookmarks = [] } = useBookmarks();
  const { data: speakers = [] } = useSpeakers();
  const { data: homepageLayout } = useHomepageLayout();
  const sections = visibleSections(homepageLayout);
  const show = (id: string) =>
    sections.some((section) => section.id === id || (id === "latest-meets" && section.id === "upcoming"));

  if (isLoading) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="kh-p8-empty">
        <p>We could not load your dashboard. Please refresh the page.</p>
      </div>
    );
  }

  const featuredSpeaker = [...speakers].sort(
    (a, b) => (b.sessionCount ?? 0) - (a.sessionCount ?? 0),
  )[0];

  const featuredVideo =
    (dashboard.popularThisWeek as VideoSummary[])?.[0]
    ?? (dashboard.recommended as VideoSummary[])?.[0]
    ?? (dashboard.continueWatching as VideoSummary[])?.[0]
    ?? null;

  const latestMeets = (
    (dashboard.latestMeets as KnowledgeMeetSummary[] | undefined)
    ?? (dashboard.upcomingSessions as KnowledgeMeetSummary[])
  ).map((m) => ({
    id: m.id,
    title: m.title,
    timeLabel: new Date(m.scheduledAt).toLocaleString(),
    durationMinutes: m.durationMinutes,
    competency: m.competency?.name ?? null,
    difficulty: m.difficulty ?? null,
    href:
      m.videoId && m.hasRecording ? `/watch/${m.videoId}` : `/meets/${m.id}`,
  }));

  const totalTrackedVideos =
    dashboard.learningProgress.completedVideos
    + dashboard.learningProgress.inProgressVideos
    + dashboard.learningProgress.remainingVideos;
  const watchPercent = totalTrackedVideos > 0
    ? Math.round((dashboard.learningProgress.completedVideos / totalTrackedVideos) * 100)
    : 0;

  const recentActivity = (dashboard.history as HistoryItem[]).slice(0, 5).map((h) => ({
    id: h.id,
    title: h.title,
    description: `${h.progressPercent}% complete`,
    time: new Date(h.lastWatchedAt).toLocaleDateString(),
  }));

  return (
    <div className="kh-home kh-dashboard kh-p8-dashboard">
      {sections.map((section) => {
        switch (section.id) {
          case "welcome":
            return (
              <div key={section.id} className="kh-home__welcome-block">
                <h1>Welcome back, {user?.name?.split(" ")[0] || "Learner"}</h1>
                <p>Your personalized learning hub — pick up where you left off.</p>
              </div>
            );
          case "progress":
            return (
              <div key={section.id}>
                <QuickActionsGrid actions={userQuickActions} />
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={16}>
                    <DashboardProgress
                      summary={dashboard.learningProgress}
                      weekly={dashboard.weeklyActivity}
                    />
                  </Col>
                  <Col xs={24} lg={8}>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <StatCard
                          title="Streak"
                          value={`${dashboard.learningProgress.currentStreakDays} days`}
                          icon={<FireOutlined />}
                        />
                      </Col>
                      <Col span={12}>
                        <StatCard
                          title="Bookmarks"
                          value={bookmarks.length}
                          subtitle="Saved sessions"
                        />
                      </Col>
                      <Col span={24}>
                        <ProgressCard
                          title="Watch progress"
                          percent={watchPercent}
                          label={`${dashboard.learningProgress.completedVideos} videos completed`}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            );
          case "featured":
            return <FeaturedSection key={section.id} video={featuredVideo} />;
          case "continue":
            return (
              <ContentRow
                key={section.id}
                title="Continue Watching"
                items={dashboard.continueWatching as VideoSummary[]}
              />
            );
          case "recommended":
            return (
              <ContentRow
                key={section.id}
                title="Recommended for you"
                items={dashboard.recommended as VideoSummary[]}
              />
            );
          case "trending":
            return (
              <ContentRow
                key={section.id}
                title="Trending"
                items={dashboard.popularThisWeek as VideoSummary[]}
              />
            );
          case "latest-meets":
          case "upcoming":
            return (
              <Row key={section.id} gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <LatestMeetsCard sessions={latestMeets} />
                </Col>
                <Col xs={24} lg={12}>
                  {featuredSpeaker ? (
                    <SpeakerCard
                      speaker={{
                        id: featuredSpeaker.id,
                        slug: featuredSpeaker.slug,
                        name: featuredSpeaker.name,
                        designation: featuredSpeaker.designation,
                        competency: null,
                        avatarUrl: featuredSpeaker.avatarUrl,
                        avgRating: null,
                        sessionCount: featuredSpeaker.sessionCount ?? 0,
                      }}
                    />
                  ) : (
                    <section className="kh-p8-widget">
                      <div className="kh-p8-widget__body">
                        <p className="kh-p8-empty">No speakers available yet.</p>
                      </div>
                    </section>
                  )}
                </Col>
              </Row>
            );
          case "series":
            return (
              <ContentRow
                key={section.id}
                title="Knowledge Series"
                items={dashboard.knowledgeSeries as KnowledgeSeriesSummary[]}
                showProgress
              />
            );
          case "latest":
            return (
              <ContentRow
                key={section.id}
                title="Latest Sessions"
                items={dashboard.latestVideos as VideoSummary[]}
              />
            );
          default:
            return null;
        }
      })}

      {(show("progress") || show("continue")) && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <ActivityFeed title="Recent Activity" items={recentActivity} />
          </Col>
          <Col xs={24} lg={12}>
            <WidgetBookmarks bookmarks={bookmarks.slice(0, 3)} />
          </Col>
        </Row>
      )}
    </div>
  );
}

function WidgetBookmarks({
  bookmarks,
}: {
  bookmarks: Array<{ id: string; title: string; subtitle: string | null }>;
}) {
  return (
    <section className="kh-p8-widget">
      <div className="kh-p8-widget__header">
        <h3 className="kh-p8-widget__title">Bookmarks</h3>
        <Link href="/library">View All</Link>
      </div>
      <div className="kh-p8-widget__body">
        {bookmarks.length === 0 ? (
          <p className="kh-p8-empty">No bookmarks yet</p>
        ) : (
          <ul className="kh-p8-activity__list">
            {bookmarks.map((b) => (
              <li key={b.id} className="kh-p8-activity__item">
                <strong>{b.title}</strong>
                {b.subtitle && <p>{b.subtitle}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

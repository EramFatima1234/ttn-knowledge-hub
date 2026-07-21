"use client";

import Link from "next/link";
import { Col, Row, Spin, Table, Tag } from "antd";
import { EyeOutlined, StarOutlined, UploadOutlined } from "@ant-design/icons";
import AspireButton from "@/components/ui/AspireButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useMyUploads } from "@/hooks/useAdmin";
import { useMeets } from "@/hooks/useContent";
import { useAdminAnalytics } from "@/hooks/useRecommendations";
import { useTeamFeedback } from "@/hooks/usePhase8";
import QuickActionsGrid from "@/features/phase8/quick-actions/QuickActionsGrid";
import { teamQuickActions } from "@/features/phase8/quick-actions/actions";
import {
  ActivityFeed,
  ChartCard,
  StatCard,
  LatestMeetsCard,
} from "@/features/phase8/widgets";

export default function TeamDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: uploads = [], isLoading } = useMyUploads();
  const { data: meets = [] } = useMeets({ sort: "newest", limit: 4 });
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics(30);
  const { data: feedback = [] } = useTeamFeedback();

  if (isLoading) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  const drafts = uploads.filter((u) => u.status === "DRAFT");
  const pending = uploads.filter((u) => u.status === "PENDING_APPROVAL");
  const published = uploads.filter((u) => u.status === "PUBLISHED");

  const latestMeets = meets.slice(0, 4).map((m) => ({
    id: m.id,
    title: m.title,
    timeLabel: new Date(m.scheduledAt).toLocaleString(),
    durationMinutes: m.durationMinutes,
    competency: m.competency?.name ?? null,
    difficulty: m.difficulty ?? null,
    href:
      m.videoId && m.hasRecording ? `/watch/${m.videoId}` : `/meets/${m.id}`,
  }));

  const activity = uploads.slice(0, 5).map((u) => ({
    id: u.id,
    title: u.title,
    description: u.status,
    time: new Date(u.updatedAt).toLocaleDateString(),
  }));

  return (
    <div className="kh-home kh-dashboard kh-p8-dashboard kh-p8-dashboard--team">
      <div className="kh-home__welcome-block">
        <div className="kh-p8-dashboard__hero-row">
          <div>
            <h1>Creator Studio</h1>
            <p>Welcome, {user?.name?.split(" ")[0] || "Creator"} — manage your content pipeline.</p>
          </div>
          <Link href="/team/studio">
            <AspireButton icon={<UploadOutlined />}>Quick Upload</AspireButton>
          </Link>
        </div>
      </div>

      <QuickActionsGrid actions={teamQuickActions} />

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <StatCard title="My Uploads" value={uploads.length} loading={isLoading} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Drafts" value={drafts.length} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Pending Approval" value={pending.length} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Published" value={published.length} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <StatCard
            title="Total Views"
            value={analytics?.content.totalViews ?? 0}
            icon={<EyeOutlined />}
            loading={analyticsLoading}
          />
        </Col>
        <Col xs={24} lg={8}>
          <StatCard
            title="Comments"
            value={analytics?.engagement.totalComments ?? 0}
            loading={analyticsLoading}
          />
        </Col>
        <Col xs={24} lg={8}>
          <StatCard
            title="Bookmarks"
            value={analytics?.engagement.totalBookmarks ?? 0}
            icon={<StarOutlined />}
            loading={analyticsLoading}
          />
        </Col>
      </Row>

      <ChartCard title="My Uploads" delay={0.1}>
        <Table
          className="aspire-custom-table"
          size="small"
          rowKey="id"
          dataSource={uploads}
          pagination={false}
          columns={[
            { title: "Title", dataIndex: "title" },
            {
              title: "Status",
              dataIndex: "status",
              render: (s: string) => <Tag>{s}</Tag>,
            },
            {
              title: "Updated",
              dataIndex: "updatedAt",
              render: (v: string) => new Date(v).toLocaleDateString(),
            },
          ]}
        />
      </ChartCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <LatestMeetsCard sessions={latestMeets} />
        </Col>
        <Col xs={24} lg={12}>
          <ActivityFeed title="Latest Feedback" items={feedback.map((f) => ({
            id: f.id,
            title: `${f.sessionTitle} · ${f.rating}★`,
            description: f.comment,
            time: new Date(f.createdAt).toLocaleDateString(),
          }))} />
        </Col>
      </Row>

      <ActivityFeed title="Recent Upload Activity" items={activity} />
    </div>
  );
}

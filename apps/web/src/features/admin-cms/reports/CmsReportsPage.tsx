"use client";

import { Row, Col, Spin } from "antd";
import { useCmsReports } from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import { StatCard } from "@/features/phase8/widgets";

export default function CmsReportsPage() {
  const { data, isLoading, isError } = useCmsReports();

  if (isLoading) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="kh-cms-page">
        <AdminPageHeader title="Reports" description="Platform engagement and content performance." />
        <p className="kh-p8-empty">Reports are not available right now. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="kh-cms-page">
      <AdminPageHeader
        title="Reports"
        description="Platform engagement, content performance, and learning analytics."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Most Viewed Session" value={data.mostViewedSession.title} subtitle={`${data.mostViewedSession.viewCount} views`} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Most Popular Series" value={data.mostPopularSeries.title} subtitle={`${data.mostPopularSeries.viewCount} views`} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Top Competency" value={data.topCompetency.name} subtitle={`${data.topCompetency.sessionCount} sessions`} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Top Speaker" value={data.topSpeaker.name} subtitle={`${data.topSpeaker.sessionCount} sessions`} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Most Active Users" value={data.activeUsers} subtitle="Last 30 days" />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Monthly Uploads" value={data.monthlyUploads} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Downloads" value={data.downloads} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Watch Hours" value={data.watchHours} />
        </Col>
      </Row>
    </div>
  );
}

"use client";

import { Card, Col, Row, Select, Statistic, Table } from "antd";
import { useAdminAnalytics } from "@/hooks/useRecommendations";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import { useState } from "react";

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useAdminAnalytics(days);

  return (
    <div className="kh-home">
      <div className="page_header kh-home__welcome--row">
        <div>
          <h1 className="inner_heading pink-border">Analytics</h1>
          <p>Platform engagement and content performance</p>
        </div>
        <Select
          value={days}
          onChange={setDays}
          style={{ width: 160 }}
          options={[
            { label: "Last 7 days", value: 7 },
            { label: "Last 30 days", value: 30 },
            { label: "Last 90 days", value: 90 },
          ]}
        />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic title="Published videos" value={data?.content.totalPublished ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic title="Total views" value={data?.content.totalViews ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic title="Comments" value={data?.engagement.totalComments ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic title="Active users" value={data?.users.activeUsers ?? 0} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Users by role" loading={isLoading}>
            <Table
              size="small"
              pagination={false}
              rowKey="role"
              dataSource={data?.users.usersByRole ?? []}
              columns={[
                { title: "Role", dataIndex: "role" },
                { title: "Count", dataIndex: "count" },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Engagement" loading={isLoading}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Bookmarks" value={data?.engagement.totalBookmarks ?? 0} />
              </Col>
              <Col span={12}>
                <Statistic title="Watch sessions" value={data?.engagement.watchSessions ?? 0} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <AnalyticsCharts {...(data !== undefined ? { data } : {})} loading={isLoading} />

      <Card title="Top videos" loading={isLoading} style={{ marginTop: 24 }}>
        <Table
          size="small"
          pagination={false}
          rowKey="id"
          dataSource={data?.content.topVideos ?? []}
          columns={[
            { title: "Title", dataIndex: "title" },
            { title: "Views", dataIndex: "viewCount", width: 120 },
          ]}
        />
      </Card>
    </div>
  );
}

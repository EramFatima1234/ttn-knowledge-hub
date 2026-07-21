"use client";

import dynamic from "next/dynamic";
import { Card, Col, Row } from "antd";
import { AdminAnalytics } from "@knowledgehub/types";

const Line = dynamic(
  () => import("@ant-design/plots").then((mod) => mod.Line),
  { ssr: false },
);

interface AnalyticsChartsProps {
  data?: AdminAnalytics;
  loading?: boolean;
}

function ChartCard({
  title,
  data,
  loading,
}: {
  title: string;
  data: { date: string; count: number }[];
  loading?: boolean;
}) {
  return (
    <Card title={title} loading={loading}>
      <Line
        data={data}
        xField="date"
        yField="count"
        height={260}
        smooth
        point={{ size: 3 }}
      />
    </Card>
  );
}

export default function AnalyticsCharts({ data, loading }: AnalyticsChartsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
      <Col xs={24} lg={12}>
        <ChartCard
          title="Uploads over time"
          data={data?.content.uploadsByDay ?? []}
          loading={loading}
        />
      </Col>
      <Col xs={24} lg={12}>
        <ChartCard
          title="Watch sessions over time"
          data={data?.content.viewsByDay ?? []}
          loading={loading}
        />
      </Col>
      <Col xs={24} lg={12}>
        <ChartCard
          title="Comments over time"
          data={data?.engagement.commentsByDay ?? []}
          loading={loading}
        />
      </Col>
      <Col xs={24} lg={12}>
        <ChartCard
          title="User signups over time"
          data={data?.users.signupsByDay ?? []}
          loading={loading}
        />
      </Col>
    </Row>
  );
}

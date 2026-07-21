"use client";

import { Card, Col, Progress, Row, Statistic } from "antd";
import type { LearningProgressSummary, WeeklyActivityPoint } from "@knowledgehub/types";

interface DashboardProgressProps {
  summary: LearningProgressSummary;
  weekly: WeeklyActivityPoint[];
}

export default function DashboardProgress({
  summary,
  weekly,
}: DashboardProgressProps) {
  const maxMinutes = Math.max(...weekly.map((d) => d.minutes), 1);

  return (
    <section className="kh-dashboard-progress">
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Completed" value={summary.completedVideos} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="In Progress" value={summary.inProgressVideos} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Hours Watched" value={summary.hoursWatched} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Streak (days)" value={summary.currentStreakDays} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Series Completion" size="small">
            {summary.seriesProgress.slice(0, 4).map((series) => (
              <div key={series.seriesId} className="kh-dashboard-progress__series">
                <span>{series.title}</span>
                <Progress percent={series.percent} size="small" />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Weekly Activity" size="small">
            <div className="kh-dashboard-progress__chart">
              {weekly.map((day) => (
                <div key={day.date} className="kh-dashboard-progress__bar-wrap">
                  <div
                    className="kh-dashboard-progress__bar"
                    style={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                    title={`${day.minutes} min`}
                  />
                  <small>{day.date.slice(5)}</small>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </section>
  );
}

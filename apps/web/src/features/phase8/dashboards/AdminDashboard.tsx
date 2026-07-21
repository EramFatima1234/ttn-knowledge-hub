"use client";

import Link from "next/link";
import { Col, Row, Spin } from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  CloudOutlined,
  NotificationOutlined,
  SettingOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useAdminOverview } from "@/hooks/useAdmin";
import { useAdminAnalytics } from "@/hooks/useRecommendations";
import { usePendingApprovals } from "@/hooks/useAdmin";
import { StatCard } from "@/features/phase8/widgets";

const manageLinks = [
  {
    title: "Admin CMS",
    description: "Content, catalog, and platform settings",
    href: "/admin",
    icon: <SettingOutlined />,
  },
  {
    title: "Approvals",
    description: "Review pending team uploads",
    href: "/admin/platform?tab=approvals",
    icon: <CheckCircleOutlined />,
  },
  {
    title: "Reports",
    description: "Content performance and usage",
    href: "/admin/reports",
    icon: <BarChartOutlined />,
  },
  {
    title: "Analytics",
    description: "Charts and engagement trends",
    href: "/admin/analytics",
    icon: <CloudOutlined />,
  },
  {
    title: "Announcements",
    description: "Broadcast updates to users",
    href: "/admin/announcements",
    icon: <NotificationOutlined />,
  },
];

export default function AdminDashboard() {
  const { data: overview, isLoading } = useAdminOverview();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics(30);
  const { data: pending = [] } = usePendingApprovals();

  if (isLoading) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  const pendingCount = overview?.pendingApprovals ?? pending.length;

  return (
    <div className="kh-home kh-p8-dashboard kh-control-center">
      <div className="kh-home__welcome-block">
        <h1>Control Center</h1>
        <p>Platform health, approvals, and engagement at a glance.</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StatCard title="Users" value={overview?.users ?? 0} icon={<TeamOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Videos" value={overview?.videos ?? 0} icon={<VideoCameraOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Pending"
            value={pendingCount}
            icon={<CheckCircleOutlined />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Active Users"
            value={analytics?.users.activeUsers ?? 0}
            icon={<CloudOutlined />}
            subtitle="Last 30 days"
            loading={analyticsLoading}
          />
        </Col>
      </Row>

      {pendingCount > 0 && (
        <section className="kh-control-center__notice">
          <Link href="/admin/platform?tab=approvals" className="kh-cms-dashboard__notice-link">
            {pendingCount} item{pendingCount === 1 ? "" : "s"} waiting for approval
          </Link>
        </section>
      )}

      <section className="kh-cms-panel kh-cms-dashboard__nav">
        <h2>Manage</h2>
        <div className="kh-cms-dashboard__grid">
          {manageLinks.map((item) => (
            <Link key={item.href} href={item.href} className="kh-cms-dashboard__card">
              <span className="kh-cms-dashboard__card-icon">{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="kh-cms-panel kh-control-center__health">
        <h2>Platform snapshot</h2>
        <ul className="kh-p8-health">
          <li>API status: Operational</li>
          <li>Search: Postgres full-text</li>
          <li>Published sessions: {analytics?.content.totalPublished ?? overview?.videos ?? 0}</li>
          <li>Approval queue: {pendingCount} pending</li>
        </ul>
      </section>
    </div>
  );
}

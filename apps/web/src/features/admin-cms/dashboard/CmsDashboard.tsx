"use client";

import Link from "next/link";
import { Col, Row, Spin } from "antd";
import {
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  FileOutlined,
  PlaySquareOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useCmsDashboardStats } from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import { StatCard } from "@/features/phase8/widgets";
import { adminQuickActions } from "@/features/phase8/quick-actions/actions";
import QuickActionsGrid from "@/features/phase8/quick-actions/QuickActionsGrid";

const adminSections = [
  {
    title: "Content",
    description: "Manage knowledge meets and series",
    href: "/admin/content?tab=meets",
    icon: <BookOutlined />,
  },
  {
    title: "Catalog",
    description: "Manage speakers and competencies",
    href: "/admin/catalog?tab=speakers",
    icon: <TagsOutlined />,
  },
  {
    title: "Platform",
    description: "User roles and content approvals",
    href: "/admin/platform?tab=users",
    icon: <TeamOutlined />,
  },
  {
    title: "Settings",
    description: "Homepage banner and theme defaults",
    href: "/admin/settings",
    icon: <SettingOutlined />,
  },
];

export default function CmsDashboard() {
  const { stats, isLoading, latestMeets, recentUploads } = useCmsDashboardStats();

  if (isLoading) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  const attentionItems = [
    stats.drafts > 0 ? { label: `${stats.drafts} draft${stats.drafts === 1 ? "" : "s"}`, href: "/admin/content?tab=meets" } : null,
    stats.pending > 0 ? { label: `${stats.pending} pending approval${stats.pending === 1 ? "" : "s"}`, href: "/admin/platform?tab=approvals" } : null,
    stats.publishedMeets > 0 ? { label: `${stats.publishedMeets} published session${stats.publishedMeets === 1 ? "" : "s"}`, href: "/admin/content?tab=meets" } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="kh-cms-page kh-cms-dashboard">
      <AdminPageHeader
        title="Admin"
        description="Manage learning content and platform settings."
        actionLabel="+ Add Knowledge Meet"
        actionHref="/admin/meets/new"
      />

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StatCard title="Total Users" value={stats.users} icon={<TeamOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Knowledge Meets" value={stats.meets} icon={<CalendarOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Knowledge Series" value={stats.series} icon={<PlaySquareOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Resources" value={stats.publishedVideos} icon={<FileOutlined />} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StatCard title="Published Meets" value={stats.publishedMeets ?? stats.upcoming} icon={<CalendarOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Pending Approval" value={stats.pending} icon={<UploadOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Speakers" value={stats.speakers} icon={<TeamOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Drafts" value={stats.drafts} icon={<BookOutlined />} />
        </Col>
      </Row>

      <QuickActionsGrid actions={adminQuickActions} />

      {attentionItems.length > 0 && (
        <section className="kh-cms-dashboard__notice">
          {attentionItems.map((item) => (
            <Link key={item.href + item.label} href={item.href} className="kh-cms-dashboard__notice-link">
              {item.label}
            </Link>
          ))}
        </section>
      )}

      <section className="kh-cms-panel kh-cms-dashboard__nav">
        <h2>Manage</h2>
        <div className="kh-cms-dashboard__grid">
          {adminSections.map((section) => (
            <Link key={section.href} href={section.href} className="kh-cms-dashboard__card">
              <span className="kh-cms-dashboard__card-icon">{section.icon}</span>
              <div>
                <strong>{section.title}</strong>
                <p>{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {recentUploads.length > 0 && (
        <section className="kh-cms-panel">
          <div className="kh-cms-panel__header">
            <h2>Recent Uploads</h2>
            <Link href="/admin/platform?tab=approvals">View approvals</Link>
          </div>
          <ul className="kh-cms-list kh-cms-list--simple">
            {recentUploads.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.type} · {item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {latestMeets.length > 0 && (
        <section className="kh-cms-panel">
          <div className="kh-cms-panel__header">
            <h2>Latest published meets</h2>
            <Link href="/admin/content?tab=meets">View all</Link>
          </div>
          <ul className="kh-cms-list kh-cms-list--simple">
            {latestMeets.slice(0, 5).map((meet) => (
              <li key={meet.id}>
                <div>
                  <strong>{meet.title}</strong>
                  <span>{new Date(meet.scheduledAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

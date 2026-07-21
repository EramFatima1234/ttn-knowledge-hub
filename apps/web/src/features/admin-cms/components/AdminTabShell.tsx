"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "antd";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";

export interface AdminTabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  actionLabel?: string;
  actionHref?: string;
}

interface AdminTabShellProps {
  basePath: string;
  defaultTab: string;
  title: string;
  description: string;
  tabs: AdminTabItem[];
  actionLabel?: string;
  actionHref?: string;
  panelClassName?: string;
  tabsClassName?: string;
}

export default function AdminTabShell({
  basePath,
  defaultTab,
  title,
  description,
  tabs,
  actionLabel,
  actionHref,
  panelClassName,
  tabsClassName,
}: AdminTabShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? defaultTab;
  const activeTabConfig = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  return (
    <div className="kh-cms-page">
      <AdminPageHeader
        title={title}
        description={description}
        actionLabel={actionLabel ?? activeTabConfig?.actionLabel}
        actionHref={actionHref ?? activeTabConfig?.actionHref}
      />

      <section
        className={["kh-cms-panel kh-cms-panel--tabs", panelClassName].filter(Boolean).join(" ")}
      >
        <Tabs
          className={tabsClassName}
          activeKey={activeTab}
          onChange={(key) => router.push(`${basePath}?tab=${key}`)}
          items={tabs.map((tab) => ({
            key: tab.key,
            label: tab.label,
            children: <div className="kh-cms-tab-content">{tab.children}</div>,
          }))}
        />
      </section>
    </div>
  );
}

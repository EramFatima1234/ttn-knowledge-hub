"use client";

import AdminTabShell from "@/features/admin-cms/components/AdminTabShell";
import MeetListPage from "@/features/admin-cms/meets/MeetListPage";
import SeriesListPage from "@/features/admin-cms/series/SeriesListPage";

const tabs = [
  {
    key: "meets",
    label: "Knowledge Meets",
    actionLabel: "+ Add Knowledge Meet",
    actionHref: "/admin/meets/new",
    children: <MeetListPage embedded />,
  },
  {
    key: "series",
    label: "Knowledge Series",
    actionLabel: "+ Add Knowledge Series",
    actionHref: "/admin/series/new",
    children: <SeriesListPage embedded />,
  },
];

export default function ContentHubPage() {
  return (
    <AdminTabShell
      basePath="/admin/content"
      defaultTab="meets"
      title="Content"
      description="Manage knowledge meets and series from one place."
      tabs={tabs}
    />
  );
}

"use client";

import AdminTabShell from "@/features/admin-cms/components/AdminTabShell";
import CompetencyListPage from "@/features/admin-cms/competencies/CompetencyListPage";
import SpeakerListPage from "@/features/admin-cms/speakers/SpeakerListPage";

const tabs = [
  {
    key: "speakers",
    label: "Speakers",
    actionLabel: "+ Add Speaker",
    actionHref: "/admin/speakers/new",
    children: <SpeakerListPage embedded />,
  },
  {
    key: "competencies",
    label: "Competencies",
    actionLabel: "+ Add Competency",
    actionHref: "/admin/competencies/new",
    children: <CompetencyListPage embedded />,
  },
];

export default function CatalogHubPage() {
  return (
    <AdminTabShell
      basePath="/admin/catalog"
      defaultTab="speakers"
      title="Catalog"
      description="Manage speakers and competency taxonomy used across the platform."
      tabs={tabs}
    />
  );
}

"use client";

import { use } from "react";
import CompetencyFormPage from "@/features/admin-cms/competencies/CompetencyFormPage";

export default function AdminCompetencyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CompetencyFormPage competencyId={id} />;
}

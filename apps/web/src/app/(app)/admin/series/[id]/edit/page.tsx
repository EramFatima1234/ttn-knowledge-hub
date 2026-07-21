"use client";

import { use } from "react";
import SeriesFormPage from "@/features/admin-cms/series/SeriesFormPage";

export default function AdminSeriesEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SeriesFormPage seriesId={id} />;
}

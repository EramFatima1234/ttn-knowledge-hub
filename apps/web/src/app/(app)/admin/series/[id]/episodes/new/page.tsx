"use client";

import { use } from "react";
import EpisodeFormPage from "@/features/admin-cms/series/EpisodeFormPage";

export default function AdminEpisodeCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: seriesId } = use(params);
  return <EpisodeFormPage seriesId={seriesId} />;
}

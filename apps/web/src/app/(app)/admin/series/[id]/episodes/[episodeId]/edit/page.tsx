"use client";

import { use } from "react";
import EpisodeFormPage from "@/features/admin-cms/series/EpisodeFormPage";

export default function AdminEpisodeEditPage({
  params,
}: {
  params: Promise<{ id: string; episodeId: string }>;
}) {
  const { id: seriesId, episodeId } = use(params);
  return <EpisodeFormPage seriesId={seriesId} episodeId={episodeId} />;
}

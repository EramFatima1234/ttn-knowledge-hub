"use client";

import { use } from "react";
import EpisodeListPage from "@/features/admin-cms/series/EpisodeListPage";

export default function AdminEpisodesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EpisodeListPage seriesId={id} />;
}

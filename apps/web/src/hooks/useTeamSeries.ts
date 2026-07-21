"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApiJson } from "@/lib/api";
import type { AdminEpisodeRecord } from "@/features/admin-cms/types";

export interface TeamSeriesOption {
  id: string;
  title: string;
  description?: string | null;
  competency?: { id: string; name: string } | null;
  episodeCount: number;
  uploadedCount: number;
}

const TEAM_SERIES_KEY = ["team", "series"];

export function useTeamSeries() {
  return useQuery({
    queryKey: TEAM_SERIES_KEY,
    queryFn: () => fetchApiJson<TeamSeriesOption[]>("team/series"),
  });
}

export function useTeamEpisodes(seriesId: string) {
  return useQuery({
    queryKey: [...TEAM_SERIES_KEY, seriesId, "episodes"],
    queryFn: () => fetchApiJson<AdminEpisodeRecord[]>(`team/series/${seriesId}/episodes`),
    enabled: Boolean(seriesId),
  });
}

export function useUploadEpisodeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      seriesId: string;
      orderIndex: number;
      title: string;
      description?: string;
      durationMinutes?: number;
      videoUrl?: string;
      storageKey?: string;
      thumbnailUrl?: string;
    }) =>
      fetchApiJson<AdminEpisodeRecord>(
        `team/series/${input.seriesId}/episodes/${input.orderIndex}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: input.title,
            description: input.description,
            durationMinutes: input.durationMinutes,
            videoUrl: input.videoUrl,
            storageKey: input.storageKey,
            thumbnailUrl: input.thumbnailUrl,
          }),
        },
      ),
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: TEAM_SERIES_KEY });
      qc.invalidateQueries({ queryKey: [...TEAM_SERIES_KEY, input.seriesId, "episodes"] });
    },
  });
}

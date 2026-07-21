"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApiJson } from "@/lib/api";
import type { AdminMeetRecord } from "@/features/admin-cms/types";

export interface TeamMeetOption {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  competency?: { id: string; name: string } | null;
  speaker?: { id: string; name: string } | null;
  hasRecording: boolean;
  hasRecordingUpload?: boolean;
  recordingStatus: string | null;
}

const TEAM_MEETS_KEY = ["team", "meets"];

export function useTeamMeets() {
  return useQuery({
    queryKey: TEAM_MEETS_KEY,
    queryFn: () => fetchApiJson<TeamMeetOption[]>("team/meets"),
  });
}

export function useUploadMeetRecording() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      meetId: string;
      title?: string;
      description?: string;
      durationMinutes?: number;
      videoUrl?: string;
      storageKey?: string;
      thumbnailUrl?: string;
      cmsStatus?: string;
    }) =>
      fetchApiJson<AdminMeetRecord>(`team/meets/${input.meetId}/recording`, {
        method: "PUT",
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          durationMinutes: input.durationMinutes,
          videoUrl: input.videoUrl,
          storageKey: input.storageKey,
          thumbnailUrl: input.thumbnailUrl,
          cmsStatus: input.cmsStatus,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEAM_MEETS_KEY });
      qc.invalidateQueries({ queryKey: ["admin", "cms"] });
    },
  });
}

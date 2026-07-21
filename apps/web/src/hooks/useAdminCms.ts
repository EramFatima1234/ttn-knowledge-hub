"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi, fetchApiJson, fetchApiVoid } from "@/lib/api";
import type {
  AdminCompetencyRecord,
  AdminEpisodeRecord,
  AdminMeetRecord,
  AdminResourceRecord,
  AdminSeriesRecord,
  AdminSpeakerRecord,
  CmsPublishStatus,
} from "@/features/admin-cms/types";
import {
  slugify,
} from "@/features/admin-cms/utils/slug.util";

const CMS_QUERY_KEY = ["admin", "cms"];

function isPersistedId(id: string | undefined, localPrefix: string): boolean {
  return Boolean(id && !id.startsWith(`${localPrefix}-`));
}

// ─── Meets ───────────────────────────────────────────────────────────────────

export function useAdminMeets() {
  return useQuery({
    queryKey: [...CMS_QUERY_KEY, "meets"],
    queryFn: () => fetchApiJson<AdminMeetRecord[]>("admin/cms/meets"),
  });
}

export function useAdminMeet(id: string) {
  return useQuery({
    queryKey: [...CMS_QUERY_KEY, "meets", id],
    queryFn: () => fetchApiJson<AdminMeetRecord>(`admin/cms/meets/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveMeet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AdminMeetRecord & { cmsStatus?: CmsPublishStatus }) => {
      const body = {
        title: record.title,
        subtitle: record.subtitle,
        description: record.description,
        speakerId: record.speakerId ?? record.speaker?.id,
        competencyId: record.competencyId ?? record.competency?.id,
        scheduledAt: record.scheduledAt,
        durationMinutes: record.durationMinutes,
        meetingLink: record.meetingLink,
        thumbnailUrl: record.thumbnailUrl,
        bannerUrl: record.bannerUrl,
        repositoryUrl: record.githubRepo,
        presentationUrl: record.slidesUrl,
        recordingUrl: record.recordingUrl,
        pdfResourceUrl: record.pdfResources?.[0] ?? null,
        externalResourceUrls: record.externalResourceUrls ?? record.pdfResources?.slice(1) ?? [],
        difficulty: record.difficulty,
        tags: record.tags,
        homepageTags: record.homepageTags,
        displayPriority: record.displayPriority,
        mandatory: record.mandatory,
        cmsStatus: record.cmsStatus ?? record.status,
      };

      if (isPersistedId(record.id, "meet")) {
        const res = await fetchApiJson<AdminMeetRecord>(`admin/cms/meets/${record.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        return res;
      }

      return fetchApiJson<AdminMeetRecord>("admin/cms/meets", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CMS_QUERY_KEY }),
  });
}

export function useDeleteMeet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApiVoid(`admin/cms/meets/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CMS_QUERY_KEY }),
  });
}

export function useDuplicateMeet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApiJson<AdminMeetRecord>(`admin/cms/meets/${id}/duplicate`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CMS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["explore"] });
      qc.invalidateQueries({ queryKey: ["meets"] });
    },
  });
}

export function useUploadAdminMeetRecording() {
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
      fetchApiJson<AdminMeetRecord>(`admin/cms/meets/${input.meetId}/recording`, {
        method: "PUT",
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          durationMinutes: input.durationMinutes,
          videoUrl: input.videoUrl,
          storageKey: input.storageKey,
          thumbnailUrl: input.thumbnailUrl,
          cmsStatus: input.cmsStatus ?? "PUBLISHED",
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CMS_QUERY_KEY }),
  });
}

// ─── Series ──────────────────────────────────────────────────────────────────

export function useAdminSeries() {
  return useQuery({
    queryKey: [...CMS_QUERY_KEY, "series"],
    queryFn: () => fetchApiJson<AdminSeriesRecord[]>("admin/cms/series"),
  });
}

export function useAdminSeriesItem(id: string) {
  const { data, ...rest } = useQuery({
    queryKey: [...CMS_QUERY_KEY, "series", id],
    queryFn: () => fetchApiJson<AdminSeriesRecord>(`admin/cms/series/${id}`),
    enabled: Boolean(id),
  });
  return { data: data as AdminSeriesRecord | undefined, ...rest };
}

export function useSaveSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AdminSeriesRecord & { cmsStatus?: CmsPublishStatus }) => {
      const targetEpisodeCount =
        typeof record.plannedEpisodeCount === "number" && record.plannedEpisodeCount >= 1
          ? Math.floor(record.plannedEpisodeCount)
          : undefined;

      const body = {
        title: record.title,
        description: record.description,
        competencyId: record.competencyId ?? record.competency?.id,
        thumbnailUrl: record.thumbnailUrl,
        bannerUrl: record.bannerUrl,
        tags: record.tags,
        homepageTags: record.homepageTags,
        displayPriority: record.displayPriority,
        cmsStatus: record.cmsStatus ?? record.status,
        episodeCount: targetEpisodeCount,
      };

      const saved = isPersistedId(record.id, "series")
        ? await fetchApiJson<AdminSeriesRecord>(`admin/cms/series/${record.id}`, {
            method: "PATCH",
            body: JSON.stringify(body),
          })
        : await fetchApiJson<AdminSeriesRecord>("admin/cms/series", {
            method: "POST",
            body: JSON.stringify(body),
          });

      if (targetEpisodeCount) {
        await ensureEpisodeSlots(saved.id, targetEpisodeCount);
      }

      return saved;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CMS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["explore"] });
      qc.invalidateQueries({ queryKey: ["series"] });
    },
  });
}

async function ensureEpisodeSlots(seriesId: string, targetCount: number) {
  const existing = await fetchApiJson<AdminEpisodeRecord[]>(
    `admin/cms/series/${seriesId}/episodes`,
  );

  for (let slot = existing.length + 1; slot <= targetCount; slot += 1) {
    await fetchApiJson<AdminEpisodeRecord>(`admin/cms/series/${seriesId}/episodes`, {
      method: "POST",
      body: JSON.stringify({ title: `Episode ${slot}` }),
    });
  }
}

export function useDeleteSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApiVoid(`admin/cms/series/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CMS_QUERY_KEY }),
  });
}

// ─── Episodes ────────────────────────────────────────────────────────────────

export function useAdminEpisodes(seriesId: string) {
  return useQuery({
    queryKey: [...CMS_QUERY_KEY, "episodes", seriesId],
    queryFn: () =>
      fetchApiJson<AdminEpisodeRecord[]>(`admin/cms/series/${seriesId}/episodes`),
    enabled: Boolean(seriesId),
  });
}

export function useSaveEpisode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AdminEpisodeRecord & { cmsStatus?: CmsPublishStatus }) => {
      const body = {
        title: record.title,
        description: record.description,
        durationMinutes: record.durationMinutes,
        orderIndex: record.orderIndex,
        videoUrl: record.videoUrl,
        storageKey: record.storageKey,
        thumbnailUrl: record.thumbnailUrl,
        cmsStatus: record.cmsStatus ?? record.status,
      };

      if (isPersistedId(record.id, "episode")) {
        return fetchApiJson<AdminEpisodeRecord>(
          `admin/cms/series/${record.seriesId}/episodes/${record.id}`,
          { method: "PATCH", body: JSON.stringify(body) },
        );
      }

      return fetchApiJson<AdminEpisodeRecord>(
        `admin/cms/series/${record.seriesId}/episodes`,
        { method: "POST", body: JSON.stringify(body) },
      );
    },
    onSuccess: (_, record) => {
      qc.invalidateQueries({ queryKey: [...CMS_QUERY_KEY, "episodes", record.seriesId] });
      qc.invalidateQueries({ queryKey: CMS_QUERY_KEY });
    },
  });
}

export function useDeleteEpisode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ seriesId, episodeId }: { seriesId: string; episodeId: string }) =>
      fetchApiVoid(`admin/cms/series/${seriesId}/episodes/${episodeId}`, { method: "DELETE" }),
    onSuccess: (_, { seriesId }) => {
      qc.invalidateQueries({ queryKey: [...CMS_QUERY_KEY, "episodes", seriesId] });
      qc.invalidateQueries({ queryKey: CMS_QUERY_KEY });
    },
  });
}

export function useReorderEpisodes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ seriesId, orderedIds }: { seriesId: string; orderedIds: string[] }) =>
      fetchApiJson(`admin/cms/series/${seriesId}/episodes/reorder`, {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      }),
    onSuccess: (_, { seriesId }) => {
      qc.invalidateQueries({ queryKey: [...CMS_QUERY_KEY, "episodes", seriesId] });
    },
  });
}

// ─── Resources ───────────────────────────────────────────────────────────────

export function useAdminResources() {
  return useQuery({
    queryKey: [...CMS_QUERY_KEY, "resources"],
    queryFn: () => fetchApiJson<AdminResourceRecord[]>("admin/cms/resources"),
  });
}

export function useSaveResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AdminResourceRecord & { cmsStatus?: CmsPublishStatus }) => {
      const body = {
        title: record.title,
        description: record.description,
        competencyId: record.competencyId ?? record.competency?.id,
        resourceType: record.resourceType,
        fileKey: record.fileUrl,
        externalUrl: record.externalUrl,
        cmsStatus: record.cmsStatus ?? record.status,
      };

      if (isPersistedId(record.id, "resource")) {
        return fetchApiJson<AdminResourceRecord>(`admin/cms/resources/${record.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }

      return fetchApiJson<AdminResourceRecord>("admin/cms/resources", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CMS_QUERY_KEY }),
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApiVoid(`admin/cms/resources/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CMS_QUERY_KEY }),
  });
}

// ─── Speakers ────────────────────────────────────────────────────────────────

export function useAdminSpeakers() {
  return useQuery({
    queryKey: [...CMS_QUERY_KEY, "speakers"],
    queryFn: () => fetchApiJson<AdminSpeakerRecord[]>("admin/cms/speakers"),
  });
}

export function useSaveSpeaker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AdminSpeakerRecord) => {
      const body = {
        name: record.name,
        designation: record.designation,
        competencyId: record.competencyId ?? record.competency?.id ?? null,
        bio: record.bio,
        linkedinUrl: record.linkedinUrl,
        avatarUrl: record.avatarUrl,
        slug: record.slug,
      };

      if (isPersistedId(record.id, "speaker")) {
        return fetchApiJson<AdminSpeakerRecord>(`admin/cms/speakers/${record.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }

      return fetchApiJson<AdminSpeakerRecord>("admin/cms/speakers", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CMS_QUERY_KEY }),
  });
}

export function useDeleteSpeaker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApiVoid(`admin/cms/speakers/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CMS_QUERY_KEY }),
  });
}

// ─── Competencies ────────────────────────────────────────────────────────────

export function useAdminCompetencies() {
  return useQuery({
    queryKey: [...CMS_QUERY_KEY, "competencies"],
    queryFn: () => fetchApiJson<AdminCompetencyRecord[]>("admin/cms/competencies"),
  });
}

export function useSaveCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AdminCompetencyRecord) => {
      const body = {
        name: record.name,
        icon: record.icon,
        slug: record.slug,
      };

      if (isPersistedId(record.id, "competency")) {
        return fetchApiJson<AdminCompetencyRecord>(`admin/cms/competencies/${record.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }

      return fetchApiJson<AdminCompetencyRecord>("admin/cms/competencies", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CMS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["competencies"] });
    },
  });
}

export function useDeleteCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchApiVoid(`admin/cms/competencies/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CMS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["competencies"] });
    },
  });
}

export { slugify };

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookmarkItem,
  CommentItem,
  HistoryItem,
  HomeFeed,
  KnowledgeMeetDetail,
  KnowledgeMeetSummary,
  KnowledgeSeriesDetail,
  KnowledgeSeriesSummary,
  VideoDetail,
  VideoSummary,
} from "@knowledgehub/types";
import { ContentType } from "@knowledgehub/types";
import { fetchApi, fetchApiJson } from "@/lib/api";

export function useHomeFeed() {
  return useQuery({
    queryKey: ["feed", "home"],
    queryFn: () => fetchApiJson<HomeFeed>("feed/home"),
  });
}

export function useVideos(params?: {
  sort?: string;
  competencyId?: string;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.sort) search.set("sort", params.sort);
  if (params?.competencyId) search.set("competencyId", params.competencyId);
  if (params?.limit) search.set("limit", String(params.limit));

  return useQuery({
    queryKey: ["videos", params],
    queryFn: () =>
      fetchApiJson<VideoSummary[]>(`videos?${search.toString()}`),
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: () => fetchApiJson<VideoDetail>(`videos/${id}`),
    enabled: Boolean(id),
  });
}

export function useMeets(params?: {
  status?: string;
  competencyId?: string;
  speakerId?: string;
  year?: number;
  search?: string;
  sort?: "newest" | "oldest" | "popular";
  difficulty?: string;
  tag?: string;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.competencyId) search.set("competencyId", params.competencyId);
  if (params?.speakerId) search.set("speakerId", params.speakerId);
  if (params?.year) search.set("year", String(params.year));
  if (params?.search) search.set("search", params.search);
  if (params?.sort) search.set("sort", params.sort);
  if (params?.difficulty) search.set("difficulty", params.difficulty);
  if (params?.tag) search.set("tag", params.tag);
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();

  return useQuery({
    queryKey: ["meets", params ?? "all"],
    queryFn: () =>
      fetchApiJson<KnowledgeMeetSummary[]>(
        query ? `knowledge-meets?${query}` : "knowledge-meets",
      ),
  });
}

export function useMeet(id: string) {
  return useQuery({
    queryKey: ["meet", id],
    queryFn: () => fetchApiJson<KnowledgeMeetDetail>(`knowledge-meets/${id}`),
    enabled: Boolean(id),
  });
}

export function useSeriesList() {
  return useQuery({
    queryKey: ["series"],
    queryFn: () => fetchApiJson<KnowledgeSeriesSummary[]>("knowledge-series"),
  });
}

export function useSeries(id: string) {
  return useQuery({
    queryKey: ["series", id],
    queryFn: () => fetchApiJson<KnowledgeSeriesDetail>(`knowledge-series/${id}`),
    enabled: Boolean(id),
  });
}

export function useComments(contentType: ContentType, contentId: string) {
  return useQuery({
    queryKey: ["comments", contentType, contentId],
    queryFn: () =>
      fetchApiJson<CommentItem[]>(
        `comments?contentType=${contentType}&contentId=${contentId}`,
      ),
    enabled: Boolean(contentId),
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => fetchApiJson<BookmarkItem[]>("bookmarks"),
  });
}

export function useContinueWatching() {
  return useQuery({
    queryKey: ["history", "continue"],
    queryFn: () => fetchApiJson<HistoryItem[]>("history/continue-watching"),
  });
}

export function useWatchHistory() {
  return useQuery({
    queryKey: ["history"],
    queryFn: () => fetchApiJson<HistoryItem[]>("history?limit=50"),
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { contentType: ContentType; contentId: string }) =>
      fetchApi("bookmarks", {
        method: "POST",
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["video"] });
      queryClient.invalidateQueries({ queryKey: ["meet"] });
      queryClient.invalidateQueries({ queryKey: ["series"] });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      contentType: ContentType;
      contentId: string;
      body: string;
      parentId?: string;
    }) =>
      fetchApi("comments", {
        method: "POST",
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.contentType, variables.contentId],
      });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      contentType: ContentType;
      contentId: string;
      progressSeconds: number;
      completed?: boolean;
    }) =>
      fetchApi("history", {
        method: "PUT",
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["video"] });
    },
  });
}

export function useRecordView() {
  return useMutation({
    mutationFn: (videoId: string) =>
      fetchApi(`videos/${videoId}/view`, { method: "POST" }),
  });
}

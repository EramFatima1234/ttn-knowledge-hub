import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleName } from "@knowledgehub/types";
import { fetchApi, fetchApiJson, fetchApiVoid } from "@/lib/api";

export interface PendingApproval {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  status: string;
  updatedAt: string;
  contentType?: "MEET_RECORDING" | "SERIES_EPISODE" | "STANDALONE_VIDEO";
  contextTitle?: string;
  contextId?: string;
  episodeNumber?: number;
  speaker?: string;
  uploadedBy: { id: string; name: string; email: string };
  competency?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

export interface MyUpload {
  id: string;
  title: string;
  status: string;
  thumbnailUrl: string | null;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roles: string[];
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ["admin", "approvals"],
    queryFn: () => fetchApiJson<PendingApproval[]>("admin/approvals/pending"),
  });
}

export function useApproveVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApiVoid(`admin/approvals/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["videos"] });
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["admin", "cms"] });
      qc.invalidateQueries({ queryKey: ["knowledge-meets"] });
      qc.invalidateQueries({ queryKey: ["team", "meets"] });
    },
  });
}

export function useRejectVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApiVoid(`admin/approvals/${id}/reject`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["admin", "cms"] });
      qc.invalidateQueries({ queryKey: ["team", "meets"] });
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements", "all"],
    queryFn: () => fetchApiJson<Announcement[]>("admin/announcements"),
  });
}

export function useActiveAnnouncements() {
  return useQuery({
    queryKey: ["announcements", "active"],
    queryFn: () => fetchApiJson<Announcement[]>("announcements"),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; body: string; priority?: number }) =>
      fetchApiVoid("admin/announcements", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApiVoid(`admin/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchApiJson<AdminUser[]>("users"),
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: RoleName }) =>
      fetchApiVoid(`users/${userId}/roles`, {
        method: "POST",
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useMyUploads() {
  return useQuery({
    queryKey: ["videos", "mine"],
    queryFn: () => fetchApiJson<MyUpload[]>("videos/mine"),
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetchApi("videos", { method: "POST", body: JSON.stringify(body) }).then(
        (r) => r.json(),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos", "mine"] }),
  });
}

export function useSubmitVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApiVoid(`videos/${id}/submit`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos", "mine"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export async function uploadFile(
  file: File,
  category: import("@/lib/upload").StorageCategory = "resources",
): Promise<string> {
  const { uploadFile: upload } = await import("@/lib/upload");
  const result = await upload(file, category);
  return result.url;
}

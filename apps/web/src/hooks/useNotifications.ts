import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationItem, UnreadCountResponse } from "@knowledgehub/types";
import { fetchApi, fetchApiJson } from "@/lib/api";

export function useNotifications(
  unreadOnly = false,
  options?: { enabled?: boolean },
) {
  const query = unreadOnly ? "?unreadOnly=true" : "";
  return useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: async () => {
      const response = await fetchApiJson<{
        items: NotificationItem[];
      }>(`notifications${query}`);
      return response.items;
    },
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => fetchApiJson<UnreadCountResponse>("notifications/unread-count"),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchApi("notifications/read-all", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

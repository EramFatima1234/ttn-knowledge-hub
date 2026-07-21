"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchApi, fetchApiJson, getApiErrorMessage } from "@/lib/api";
import { env } from "@/config/env";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  AiDiscoverResponse,
  AiQuizResponse,
  AiStatusResponse,
  AiVideoSummaryResponse,
} from "@knowledgehub/types";

export function useAiStatus(enabled = true) {
  return useQuery({
    queryKey: ["ai", "status"],
    queryFn: () => fetchApiJson<AiStatusResponse>("ai/status"),
    staleTime: 60_000,
    enabled,
  });
}

export function useAiDiscover() {
  return useMutation({
    mutationFn: (prompt: string) =>
      fetchApiJson<AiDiscoverResponse>("ai/discover", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),
  });
}

export async function streamAiDiscover(
  prompt: string,
  handlers: {
    onDelta: (text: string) => void;
    onDone: (result: AiDiscoverResponse) => void;
    onError?: (message: string) => void;
  },
) {
  const { user } = useAuthStore.getState();
  const streamBase =
    typeof window !== "undefined" ? env.apiUrl.replace(/\/$/, "") : env.apiUrl;
  const endpoint = `${streamBase}/ai/discover/stream`;

  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  });
  if (user?.accessToken) {
    headers.set("Authorization", `Bearer ${user.accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt }),
      credentials: "include",
    });
  } catch {
    handlers.onError?.("Could not reach the AI service");
    return;
  }

  if (!response.ok || !response.body) {
    handlers.onError?.(`AI request failed (${response.status})`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part
        .split("\n")
        .find((l) => l.startsWith("data:"));
      if (!line) continue;
      try {
        const payload = JSON.parse(line.slice(5).trim()) as
          | { type: "delta"; text: string }
          | { type: "done"; result: AiDiscoverResponse }
          | { type: "error"; message: string };
        if (payload.type === "delta") handlers.onDelta(payload.text);
        if (payload.type === "done") {
          completed = true;
          handlers.onDone(payload.result);
        }
        if (payload.type === "error") handlers.onError?.(payload.message);
      } catch {
        // ignore malformed chunk
      }
    }
  }

  if (!completed) {
    handlers.onError?.("AI stream ended unexpectedly");
  }
}

export function useAiVideoSummary(videoId: string) {
  return useMutation({
    mutationFn: () =>
      fetchApiJson<AiVideoSummaryResponse>(`ai/videos/${videoId}/summary`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
  });
}

export function useAiVideoQuiz(videoId: string) {
  return useMutation({
    mutationFn: () =>
      fetchApiJson<AiQuizResponse>(`ai/videos/${videoId}/quiz`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
  });
}

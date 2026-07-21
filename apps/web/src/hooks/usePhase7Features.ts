import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApiJson } from '@/lib/api';
import type { SpeakerProfile, QaQuestion, VideoResource } from '@knowledgehub/types';

export interface SpeakerListItem {
  id: string;
  name: string;
  slug: string;
  designation?: string | null;
  avatarUrl?: string | null;
  sessionCount?: number;
}

export function useSpeaker(slugOrId: string) {
  return useQuery({
    queryKey: ['speaker', slugOrId],
    queryFn: () => fetchApiJson<SpeakerProfile>(`speakers/${slugOrId}`),
    enabled: Boolean(slugOrId),
  });
}

export function useSpeakers() {
  return useQuery({
    queryKey: ['speakers'],
    queryFn: () => fetchApiJson<SpeakerListItem[]>('speakers'),
  });
}

export function useVideoQuestions(videoId: string) {
  return useQuery({
    queryKey: ['qa', videoId],
    queryFn: () => fetchApiJson<QaQuestion[]>(`videos/${videoId}/questions`),
    enabled: Boolean(videoId),
  });
}

export function useCreateQuestion(videoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      fetchApiJson(`videos/${videoId}/questions`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qa', videoId] }),
  });
}

export function useCreateAnswer(questionId: string, videoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      fetchApiJson(`questions/${questionId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qa', videoId] }),
  });
}

export function useVoteQuestion(videoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, value }: { questionId: string; value: 1 | -1 }) =>
      fetchApiJson(`questions/${questionId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qa', videoId] }),
  });
}

export function useVideoResources(videoId: string) {
  return useQuery({
    queryKey: ['resources', videoId],
    queryFn: () => fetchApiJson<VideoResource[]>(`videos/${videoId}/resources`),
    enabled: Boolean(videoId),
  });
}

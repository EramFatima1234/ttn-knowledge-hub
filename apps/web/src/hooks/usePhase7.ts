import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApiJson } from '@/lib/api';
import type {
  DashboardFeed,
  LearningProgressSummary,
  PlaybackManifest,
  WeeklyActivityPoint,
} from '@knowledgehub/types';

export function useDashboard() {
  return useQuery({
    queryKey: ['feed', 'dashboard'],
    queryFn: () => fetchApiJson<DashboardFeed>('feed/dashboard'),
  });
}

export function usePlayback(videoId: string) {
  return useQuery({
    queryKey: ['playback', videoId],
    queryFn: () => fetchApiJson<PlaybackManifest>(`videos/${videoId}/playback`),
    enabled: Boolean(videoId),
  });
}

export function useProgressSummary() {
  return useQuery({
    queryKey: ['progress', 'summary'],
    queryFn: () => fetchApiJson<LearningProgressSummary>('progress/summary'),
  });
}

export function useWeeklyActivity() {
  return useQuery({
    queryKey: ['progress', 'weekly'],
    queryFn: () => fetchApiJson<WeeklyActivityPoint[]>('progress/weekly-activity'),
  });
}

export function useUpdatePlaybackPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { playbackSpeed?: number; autoPlayNext?: boolean }) =>
      fetchApiJson('progress/playback-preferences', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playback'] });
    },
  });
}

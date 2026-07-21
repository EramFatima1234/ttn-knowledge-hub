import { create } from 'zustand';

interface MiniPlayerState {
  videoId: string | null;
  title: string | null;
  streamUrl: string | null;
  posterUrl: string | null;
  progressSeconds: number;
  isOpen: boolean;
  open: (payload: {
    videoId: string;
    title: string;
    streamUrl: string;
    posterUrl?: string | null;
    progressSeconds?: number;
  }) => void;
  close: () => void;
  setProgress: (seconds: number) => void;
}

export const useMiniPlayerStore = create<MiniPlayerState>((set) => ({
  videoId: null,
  title: null,
  streamUrl: null,
  posterUrl: null,
  progressSeconds: 0,
  isOpen: false,
  open: (payload) =>
    set({
      isOpen: true,
      videoId: payload.videoId,
      title: payload.title,
      streamUrl: payload.streamUrl,
      posterUrl: payload.posterUrl ?? null,
      progressSeconds: payload.progressSeconds ?? 0,
    }),
  close: () => set({ isOpen: false }),
  setProgress: (progressSeconds) => set({ progressSeconds }),
}));

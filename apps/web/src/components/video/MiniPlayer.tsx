"use client";

import Link from "next/link";
import { useMiniPlayerStore } from "@/store/useMiniPlayerStore";

export default function MiniPlayer() {
  const { isOpen, title, streamUrl, posterUrl, progressSeconds, close, setProgress } =
    useMiniPlayerStore();

  if (!isOpen || !streamUrl) return null;

  return (
    <div className="kh-mini-player">
      <div className="kh-mini-player__header">
        <strong>{title}</strong>
        <button type="button" onClick={close} aria-label="Close mini player">
          ×
        </button>
      </div>
      <video
        className="kh-mini-player__video"
        controls
        playsInline
        preload="metadata"
        src={streamUrl}
        poster={posterUrl ?? undefined}
        onLoadedMetadata={(e) => {
          if (progressSeconds > 0) {
            e.currentTarget.currentTime = progressSeconds;
          }
        }}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
      />
      <Link href={`/watch/${useMiniPlayerStore.getState().videoId}`} className="kh-mini-player__expand">
        Expand
      </Link>
    </div>
  );
}

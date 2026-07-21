"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "antd";
import { ContentType } from "@knowledgehub/types";
import { useUpdateProgress } from "@/hooks/useContent";
import { usePlayback, useUpdatePlaybackPreferences } from "@/hooks/usePhase7";
import { useMiniPlayerStore } from "@/store/useMiniPlayerStore";
import { detectMediaProvider, toEmbedSrc } from "@/lib/media-url";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  src?: string;
  poster?: string | null;
  initialProgress?: number;
  durationSeconds: number;
  enableMiniPlayer?: boolean;
}

const SPEED_OPTIONS = [
  { label: "0.5x", value: 0.5 },
  { label: "0.75x", value: 0.75 },
  { label: "1x", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

export default function VideoPlayer({
  videoId,
  title,
  src,
  poster,
  initialProgress = 0,
  durationSeconds,
  enableMiniPlayer = true,
}: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const updateProgress = useUpdateProgress();
  const updatePrefs = useUpdatePlaybackPreferences();
  const { data: playback } = usePlayback(videoId);
  const openMini = useMiniPlayerStore((s) => s.open);
  const lastSaved = useRef(0);
  const [speed, setSpeed] = useState(playback?.playbackSpeed ?? 1);

  const streamUrl = playback?.streamUrl || src || "";
  const resumeAt = playback?.progressSeconds ?? initialProgress;
  const embedSrc =
    detectMediaProvider(streamUrl) === "embed" ? toEmbedSrc(streamUrl) : null;
  const isEmbed = Boolean(embedSrc);

  useEffect(() => {
    if (playback?.playbackSpeed) setSpeed(playback.playbackSpeed);
  }, [playback?.playbackSpeed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resumeAt || isEmbed) return;
    video.currentTime = resumeAt;
  }, [resumeAt, streamUrl, isEmbed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
  }, [speed]);

  const saveProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const current = Math.floor(video.currentTime);
    if (Math.abs(current - lastSaved.current) < 5) return;

    lastSaved.current = current;
    const completed =
      durationSeconds > 0 && current >= durationSeconds * 0.95;

    updateProgress.mutate({
      contentType: ContentType.VIDEO,
      contentId: videoId,
      progressSeconds: current,
      completed,
    });
  }, [durationSeconds, updateProgress, videoId]);

  const handleEnded = useCallback(() => {
    saveProgress();
    if (playback?.autoPlayNext && playback.nextEpisode?.videoId) {
      router.push(`/watch/${playback.nextEpisode.videoId}`);
    }
  }, [playback, router, saveProgress]);

  useEffect(() => {
    if (isEmbed) return;
    const interval = setInterval(saveProgress, 10000);
    return () => {
      clearInterval(interval);
      saveProgress();
    };
  }, [saveProgress, isEmbed]);

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    updatePrefs.mutate({ playbackSpeed: value });
  };

  return (
    <div className="kh-player kh-player--pro">
      <div className="kh-player__media">
        {isEmbed ? (
          <iframe
            className="kh-player__embed"
            src={embedSrc!}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            className="kh-player__video"
            controls
            playsInline
            preload="metadata"
            poster={playback?.posterUrl ?? poster ?? undefined}
            src={streamUrl}
            onPause={saveProgress}
            onEnded={handleEnded}
          />
        )}
      </div>
      <div className="kh-player__toolbar">
        {!isEmbed && (
          <Select
            size="small"
            value={speed}
            options={SPEED_OPTIONS}
            onChange={handleSpeedChange}
            className="kh-player__speed"
          />
        )}
        {enableMiniPlayer && !isEmbed && (
          <button
            type="button"
            className="kh-player__mini-btn"
            onClick={() =>
              openMini({
                videoId,
                title,
                streamUrl,
                posterUrl: playback?.posterUrl ?? poster,
                progressSeconds: videoRef.current?.currentTime ?? resumeAt,
              })
            }
          >
            Mini player
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Skeleton, Tag } from "antd";
import { formatDuration } from "@/lib/format";
import { resolveThumbnailUrl } from "@/lib/content-images";
import type { VideoSummary } from "@knowledgehub/types";

interface VideoGridProps {
  title: string;
  videos: VideoSummary[];
  loading?: boolean;
  viewAllHref?: string;
}

export default function VideoGrid({
  title,
  videos,
  loading = false,
  viewAllHref,
}: VideoGridProps) {
  if (!loading && videos.length === 0) {
    return null;
  }

  return (
    <section className="kh-video-grid-section">
      <div className="kh-row__header">
        <h2>{title}</h2>
        {viewAllHref && <Link href={viewAllHref}>View all</Link>}
      </div>
      <div className="kh-video-grid">
        {loading &&
          Array.from({ length: 8 }).map((_, index) => (
            <Skeleton.Image key={index} active className="kh-card-skeleton" />
          ))}
        {!loading &&
          videos.map((video) => (
            <Link key={video.id} href={`/watch/${video.id}`} className="kh-card kh-card--link">
              <div className="kh-card__thumb">
                <Image
                  src={resolveThumbnailUrl(video.thumbnailUrl)}
                  alt={video.title}
                  fill
                  className="kh-card__image"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                {video.durationSeconds > 0 && (
                  <span className="kh-card__duration">
                    {formatDuration(video.durationSeconds)}
                  </span>
                )}
              </div>
              <div className="kh-card__body">
                <h3>{video.title}</h3>
                {video.speaker && (
                  <span className="kh-card__meta">{video.speaker.name}</span>
                )}
                <div className="kh-card__stats">
                  {video.viewCount > 0 && <span>{video.viewCount.toLocaleString()} views</span>}
                  {video.competency && (
                    <Tag className="kh-card__tag">{video.competency.name}</Tag>
                  )}
                </div>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}

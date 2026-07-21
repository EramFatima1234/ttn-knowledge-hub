"use client";

import Image from "next/image";
import Link from "next/link";
import { Tag } from "antd";
import AspireButton from "@/components/ui/AspireButton";
import { PlayCircleOutlined } from "@ant-design/icons";
import { formatDuration } from "@/lib/format";
import { resolveThumbnailUrl } from "@/lib/content-images";
import type { VideoSummary } from "@knowledgehub/types";

interface FeaturedSectionProps {
  video?: VideoSummary | null;
}

export default function FeaturedSection({ video }: FeaturedSectionProps) {
  if (!video) {
    return null;
  }

  const thumbnail = resolveThumbnailUrl(video.thumbnailUrl);

  return (
    <section className="kh-featured kh-featured--video">
      <div className="kh-featured__media">
        <Image
          src={thumbnail}
          alt={video.title}
          fill
          className="kh-featured__image"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      <div className="kh-featured__content">
        <Tag className="kh-featured__tag">Featured</Tag>
        <h2 className="kh-featured__title">{video.title}</h2>
        {video.description && (
          <p className="kh-featured__subtitle">{video.description}</p>
        )}
        <div className="kh-featured__meta">
          {video.speaker && <span>{video.speaker.name}</span>}
          {video.durationSeconds > 0 && (
            <span>{formatDuration(video.durationSeconds)}</span>
          )}
          {video.viewCount > 0 && <span>{video.viewCount.toLocaleString()} views</span>}
        </div>
        <Link href={`/watch/${video.id}`}>
          <AspireButton className="aspire-h45" icon={<PlayCircleOutlined />}>
            Watch now
          </AspireButton>
        </Link>
      </div>
    </section>
  );
}

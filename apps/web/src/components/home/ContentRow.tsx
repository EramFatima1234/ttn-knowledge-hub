"use client";

import Image from "next/image";
import Link from "next/link";
import { Progress, Skeleton, Tag } from "antd";
import { formatDuration, formatMeetDate } from "@/lib/format";
import { resolveThumbnailUrl } from "@/lib/content-images";
import type {
  HistoryItem,
  KnowledgeMeetSummary,
  KnowledgeSeriesSummary,
  VideoSummary,
} from "@knowledgehub/types";

type CardItem =
  | VideoSummary
  | KnowledgeMeetSummary
  | KnowledgeSeriesSummary
  | HistoryItem;

interface ContentRowProps {
  title: string;
  items: CardItem[];
  showProgress?: boolean;
  hrefForItem?: (item: CardItem) => string;
  loading?: boolean;
}

function getHref(item: CardItem): string {
  if ("contentId" in item && item.contentType === "VIDEO") {
    return `/watch/${item.contentId}`;
  }
  if ("videoUrl" in item || ("durationSeconds" in item && !("sessionCount" in item))) {
    return `/watch/${item.id}`;
  }
  if ("scheduledAt" in item) {
    if ("videoId" in item && item.videoId && item.hasRecording) {
      return `/watch/${item.videoId}`;
    }
    return `/meets/${item.id}`;
  }
  if ("sessionCount" in item) {
    return `/series/${item.id}`;
  }
  return "#";
}

function getThumbnail(item: CardItem): string {
  if ("thumbnailUrl" in item) return resolveThumbnailUrl(item.thumbnailUrl);
  return resolveThumbnailUrl(null);
}

function getTitle(item: CardItem): string {
  return item.title;
}

function getSubtitle(item: CardItem): string | undefined {
  if ("subtitle" in item && item.subtitle) return item.subtitle;
  if ("scheduledAt" in item) return formatMeetDate(item.scheduledAt);
  if ("sessionCount" in item)
    return `${item.sessionCount} sessions · ${item.progressPercent}% complete`;
  return undefined;
}

function getSpeaker(item: CardItem): string | undefined {
  if ("speaker" in item && item.speaker) return item.speaker.name;
  return undefined;
}

function getCompetency(item: CardItem): string | undefined {
  if ("competency" in item && item.competency) return item.competency.name;
  return undefined;
}

function getDuration(item: CardItem): string | undefined {
  if ("durationSeconds" in item && item.durationSeconds) {
    return formatDuration(item.durationSeconds);
  }
  return undefined;
}

function getProgress(item: CardItem): number | undefined {
  if ("progressPercent" in item) return item.progressPercent;
  return undefined;
}

function getBadge(item: CardItem): string | undefined {
  if ("attendanceType" in item) return item.attendanceType;
  return undefined;
}

export default function ContentRow({
  title,
  items,
  showProgress = false,
  hrefForItem,
  loading = false,
}: ContentRowProps) {
  return (
    <section className="kh-row">
      <div className="kh-row__header">
        <h2>{title}</h2>
      </div>
      <div className="kh-row__track">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton.Image key={i} active className="kh-card-skeleton" />
          ))}
        {!loading &&
          items.map((item) => {
            const href = hrefForItem?.(item) ?? getHref(item);
            const thumbnail = getThumbnail(item);
            const progress = getProgress(item);

            return (
              <Link key={item.id} href={href} className="kh-card kh-card--link">
                <div className="kh-card__thumb">
                  <Image
                    src={thumbnail}
                    alt={getTitle(item)}
                    fill
                    className="kh-card__image"
                    sizes="280px"
                  />
                  {getDuration(item) && (
                    <span className="kh-card__duration">{getDuration(item)}</span>
                  )}
                  {getBadge(item) && (
                    <Tag className="kh-card__badge">{getBadge(item)}</Tag>
                  )}
                </div>
                <div className="kh-card__body">
                  <h3>{getTitle(item)}</h3>
                  {getSubtitle(item) && <p>{getSubtitle(item)}</p>}
                  {getSpeaker(item) && (
                    <span className="kh-card__meta">{getSpeaker(item)}</span>
                  )}
                  {getCompetency(item) && (
                    <Tag className="kh-card__tag">{getCompetency(item)}</Tag>
                  )}
                  {showProgress && progress !== undefined && (
                    <Progress percent={progress} size="small" showInfo={false} />
                  )}
                </div>
              </Link>
            );
          })}
      </div>
    </section>
  );
}

"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Button, Skeleton, Tag, Typography } from "antd";
import { ContentType } from "@knowledgehub/types";
import { useRecordView, useVideo } from "@/hooks/useContent";
import { useRelatedContent } from "@/hooks/useRecommendations";
import VideoPlayer from "@/components/video/VideoPlayer";
import BookmarkButton from "@/components/video/BookmarkButton";
import ContentRow from "@/components/home/ContentRow";
import { formatDuration } from "@/lib/format";
import Link from "next/link";

const VideoAiPanel = dynamic(() => import("@/features/ai/VideoAiPanel"));
const ResourceCenter = dynamic(() => import("@/components/video/ResourceCenter"));
const QaSection = dynamic(() => import("@/components/video/QaSection"));
const CommentSection = dynamic(() => import("@/components/video/CommentSection"));

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const { data: video, isLoading } = useVideo(params.id);
  const { data: related, isLoading: relatedLoading } = useRelatedContent(
    ContentType.VIDEO,
    params.id,
  );
  const recordView = useRecordView();

  useEffect(() => {
    if (params.id) {
      recordView.mutate(params.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (isLoading || !video) {
    return (
      <div className="kh-watch">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="kh-watch">
      <div className="kh-watch__main">
        <div className="kh-watch__player-wrap">
          {video.videoUrl ? (
            <VideoPlayer
              videoId={video.id}
              title={video.title}
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              initialProgress={video.userHistory?.progressSeconds ?? 0}
              durationSeconds={video.durationSeconds}
            />
          ) : (
            <div className="kh-player kh-player--empty">Video unavailable</div>
          )}
        </div>

        <div className="kh-watch__meta">
          <div className="kh-watch__meta-top">
            <Typography.Title level={2} className="kh-watch__title">
              {video.title}
            </Typography.Title>
            <div className="kh-watch__actions">
              <BookmarkButton
                contentType={ContentType.VIDEO}
                contentId={video.id}
                isBookmarked={video.isBookmarked}
              />
              {video.series && (
                <Link href={`/series/${video.series.id}`}>
                  <Button>View Series: {video.series.title}</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="kh-watch__meta-row">
            <div className="kh-watch__tags">
              {video.competency && <Tag className="kh-watch__tag">{video.competency.name}</Tag>}
              {video.category && <Tag className="kh-watch__tag">{video.category.name}</Tag>}
              {video.speaker && (
                <Link href={`/speakers/${video.speaker.id}`}>
                  <Tag className="kh-watch__tag">{video.speaker.name}</Tag>
                </Link>
              )}
            </div>
            <span className="kh-watch__duration">{formatDuration(video.durationSeconds)}</span>
          </div>

          {video.description && (
            <Typography.Paragraph className="kh-watch__description">
              {video.description}
            </Typography.Paragraph>
          )}
          {video.repository && (
            <p className="kh-watch__repo">
              Repository:{" "}
              <a href={video.repository.url} target="_blank" rel="noreferrer">
                {video.repository.url}
              </a>
            </p>
          )}
        </div>

        <div className="kh-watch__sections">
          <VideoAiPanel videoId={video.id} />
          <ResourceCenter videoId={video.id} />
          <QaSection videoId={video.id} />
          <CommentSection contentType={ContentType.VIDEO} contentId={video.id} />
        </div>
      </div>

      {(related?.videos?.length ?? 0) > 0 && (
        <section className="kh-watch__related">
          <ContentRow
            title="Related videos"
            items={related?.videos ?? []}
            loading={relatedLoading}
          />
        </section>
      )}
    </div>
  );
}

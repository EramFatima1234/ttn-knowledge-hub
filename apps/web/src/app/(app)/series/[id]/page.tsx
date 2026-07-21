"use client";

import { useParams } from "next/navigation";
import { List, Progress, Skeleton, Tag, Typography } from "antd";
import AspireButton from "@/components/ui/AspireButton";
import { useSeries } from "@/hooks/useContent";
import BookmarkButton from "@/components/video/BookmarkButton";
import { ContentType } from "@knowledgehub/types";
import Link from "next/link";
import Image from "next/image";

export default function SeriesDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: series, isLoading } = useSeries(params.id);

  if (isLoading || !series) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <div className="kh-detail">
      <div className="kh-detail__body">
        <Tag>{series.competency?.name}</Tag>
        <Typography.Title level={2}>{series.title}</Typography.Title>
        {series.description && <Typography.Paragraph>{series.description}</Typography.Paragraph>}

        <div className="kh-series-progress">
          <span>{series.progressPercent}% complete</span>
          <Progress percent={series.progressPercent} showInfo={false} />
        </div>

        <BookmarkButton
          contentType={ContentType.KNOWLEDGE_SERIES}
          contentId={series.id}
          isBookmarked={series.isBookmarked}
        />

        <Typography.Title level={4}>Sessions</Typography.Title>
        <List
          dataSource={series.sessions}
          renderItem={(session) => (
            <List.Item className="kh-session-item">
              <div className="kh-session-item__info">
                <span className="kh-session-item__index">{session.orderIndex}</span>
                <div>
                  <strong>{session.title}</strong>
                  {session.video && (
                    <p>{session.video.speaker?.name}</p>
                  )}
                  <Progress percent={session.progressPercent} size="small" showInfo={false} />
                </div>
              </div>
              {session.video && (
                <Link href={`/watch/${session.video.id}`}>
                  <AspireButton>
                    {session.progressPercent > 0 ? "Continue" : "Watch"}
                  </AspireButton>
                </Link>
              )}
            </List.Item>
          )}
        />
      </div>

      {series.thumbnailUrl && (
        <div className="kh-detail__side-thumb">
          <Image src={series.thumbnailUrl} alt={series.title} width={320} height={180} />
        </div>
      )}
    </div>
  );
}

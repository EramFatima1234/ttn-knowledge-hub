"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Empty, Segmented, Skeleton, Tag, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import { useSpeaker } from "@/hooks/usePhase7Features";
import ContentRow from "@/components/home/ContentRow";
import VideoGrid from "@/components/home/VideoGrid";
import type { KnowledgeMeetSummary, KnowledgeSeriesSummary, VideoSummary } from "@knowledgehub/types";

type SpeakerContentTab = "sessions" | "meets" | "series";

export default function SpeakerProfilePage() {
  const params = useParams<{ slug: string }>();
  const { data: speaker, isLoading, isError } = useSpeaker(params.slug);
  const [activeTab, setActiveTab] = useState<SpeakerContentTab>("sessions");

  const videos = useMemo<VideoSummary[]>(() => {
    if (!speaker) return [];
    return speaker.recentSessions.map((session) => ({
      id: session.id,
      title: session.title,
      description: null,
      thumbnailUrl: session.thumbnailUrl,
      videoUrl: null,
      durationSeconds: session.durationSeconds,
      viewCount: 0,
      isPinned: false,
      publishedAt: session.publishedAt,
      speaker: {
        id: speaker.id,
        name: speaker.name,
        designation: speaker.designation,
        avatarUrl: speaker.avatarUrl,
      },
      competency: session.competency
        ? {
            id: session.id,
            name: session.competency,
            slug: session.competency.toLowerCase().replace(/\s+/g, "-"),
          }
        : null,
      category: null,
    }));
  }, [speaker]);

  const meets = useMemo<KnowledgeMeetSummary[]>(() => {
    if (!speaker) return [];
    return speaker.recentMeets.map((meet) => ({
      id: meet.id,
      title: meet.title,
      subtitle: meet.competency,
      description: null,
      thumbnailUrl: meet.thumbnailUrl,
      scheduledAt: meet.scheduledAt,
      durationMinutes: 60,
      status: meet.status,
      attendanceType: "OPTIONAL",
      meetingLink: null,
      recordingUrl: null,
      videoId: meet.videoId ?? null,
      hasRecording: meet.hasRecording ?? false,
      speaker: {
        id: speaker.id,
        name: speaker.name,
        designation: speaker.designation,
        avatarUrl: speaker.avatarUrl,
      },
      competency: meet.competency
        ? {
            id: meet.id,
            name: meet.competency,
            slug: meet.competency.toLowerCase().replace(/\s+/g, "-"),
          }
        : null,
    }));
  }, [speaker]);

  const series = useMemo<KnowledgeSeriesSummary[]>(() => {
    if (!speaker) return [];
    return (speaker.recentSeries ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      thumbnailUrl: item.thumbnailUrl,
      sessionCount: item.sessionCount,
      progressPercent: 0,
      competency: item.competency
        ? {
            id: item.id,
            name: item.competency,
            slug: item.competency.toLowerCase().replace(/\s+/g, "-"),
          }
        : null,
    }));
  }, [speaker]);

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  if (isError || !speaker) {
    return (
      <div className="kh-speaker kh-speaker--empty">
        <Link href="/speakers" className="kh-speaker__back">
          <ArrowLeftOutlined /> Back to Speakers
        </Link>
        <Empty description="Speaker not found." />
      </div>
    );
  }

  return (
    <div className="kh-speaker">
      <Link href="/speakers" className="kh-speaker__back">
        <ArrowLeftOutlined /> Back to Speakers
      </Link>

      <div className="page_header">
        <div className="kh-speaker__hero">
          <Avatar size={96} src={speaker.avatarUrl || undefined}>
            {speaker.name.charAt(0)}
          </Avatar>
          <div>
            <h1 className="inner_heading pink-border">{speaker.name}</h1>
            {speaker.designation && <p>{speaker.designation}</p>}
            {speaker.avgRating != null && (
              <Tag color="magenta">Rating {speaker.avgRating}</Tag>
            )}
          </div>
        </div>
      </div>

      {speaker.bio && (
        <Typography.Paragraph className="kh-speaker__bio">
          {speaker.bio}
        </Typography.Paragraph>
      )}

      {speaker.linkedinUrl && (
        <p className="kh-speaker__linkedin">
          <a href={speaker.linkedinUrl} target="_blank" rel="noreferrer">
            LinkedIn Profile
          </a>
        </p>
      )}

      {speaker.competencies.length > 0 && (
        <div className="kh-speaker__competencies">
          {speaker.competencies.map((c) => (
            <Link key={c.id} href={`/explore?competency=${c.slug}`}>
              <Tag>{c.name}</Tag>
            </Link>
          ))}
        </div>
      )}

      <section className="kh-speaker__content">
        <Segmented
          className="kh-speaker__tabs"
          value={activeTab}
          onChange={(value) => setActiveTab(value as SpeakerContentTab)}
          options={[
            { label: `Sessions (${videos.length})`, value: "sessions" },
            { label: `Knowledge Meets (${meets.length})`, value: "meets" },
            { label: `Knowledge Series (${series.length})`, value: "series" },
          ]}
        />

        {activeTab === "sessions" && (
          videos.length > 0 ? (
            <VideoGrid title="" videos={videos} />
          ) : (
            <Empty description="No sessions from this speaker yet." />
          )
        )}

        {activeTab === "meets" && (
          meets.length > 0 ? (
            <div className="kh-speaker__meets">
              <ContentRow title="" items={meets} />
            </div>
          ) : (
            <Empty description="No knowledge meets from this speaker yet." />
          )
        )}

        {activeTab === "series" && (
          series.length > 0 ? (
            <div className="kh-speaker__series">
              <ContentRow title="" items={series} showProgress />
            </div>
          ) : (
            <Empty description="No knowledge series from this speaker yet." />
          )
        )}
      </section>
    </div>
  );
}

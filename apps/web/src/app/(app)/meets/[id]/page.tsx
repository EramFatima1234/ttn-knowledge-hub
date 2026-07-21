"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "antd";
import { useMeet } from "@/hooks/useContent";

/** Redirects to the watch page when a published recording exists; otherwise shows metadata shell. */
export default function MeetDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: meet, isLoading } = useMeet(params.id);

  useEffect(() => {
    if (!meet?.videoId || !meet.hasRecording) return;
    router.replace(`/watch/${meet.videoId}`);
  }, [meet, router]);

  if (isLoading || !meet) {
    return (
      <div className="kh-meet-detail">
        <Skeleton.Image active className="kh-meet-detail__hero-skeleton" />
        <div className="kh-meet-detail__content">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  if (meet.videoId && meet.hasRecording) {
    return (
      <div className="kh-auth-loading">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="kh-meet-detail kh-p8-empty">
      <p>This session is not available yet. Check back after the recording has been published.</p>
    </div>
  );
}

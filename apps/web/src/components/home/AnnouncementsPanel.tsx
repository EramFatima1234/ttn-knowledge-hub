"use client";

import { Card, Skeleton } from "antd";
import { useActiveAnnouncements } from "@/hooks/useAdmin";

interface AnnouncementsPanelProps {
  variant?: "default" | "panel";
}

export default function AnnouncementsPanel({
  variant = "default",
}: AnnouncementsPanelProps) {
  const { data, isLoading } = useActiveAnnouncements();
  const isPanel = variant === "panel";

  return (
    <section
      className={
        isPanel ? "right-panel-section kh-announcements--panel" : "kh-announcements"
      }
    >
      <h2 className={isPanel ? "right-panel-section__title" : undefined}>
        Announcements
      </h2>
      <div className="kh-announcements__list">
        {isLoading &&
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} loading size="small" />
          ))}
        {data?.map((item) => (
          <Card key={item.id} className="kh-announcement-card" size="small">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </Card>
        ))}
        {!isLoading && !data?.length && (
          <p className="kh-announcements__empty">No announcements right now.</p>
        )}
      </div>
    </section>
  );
}

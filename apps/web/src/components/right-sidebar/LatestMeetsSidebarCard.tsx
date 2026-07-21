"use client";

import Link from "next/link";
import { CalendarOutlined } from "@ant-design/icons";
import SidebarSection from "@/components/right-sidebar/SidebarSection";
import { useRightSidebarLatestMeets } from "@/hooks/useRightSidebar";

export default function LatestMeetsSidebarCard({ contentOnly = false }: { contentOnly?: boolean }) {
  const { sessions, isLoading, isError, refetch } = useRightSidebarLatestMeets();

  return (
    <SidebarSection
      title="Latest Knowledge Meets"
      icon="📅"
      contentOnly={contentOnly}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      delay={0.05}
      action={
        contentOnly ? undefined : (
          <Link href="/meets" className="kh-rs-section__link">
            View All
          </Link>
        )
      }
    >
      {sessions.length === 0 ? (
        <div className="kh-rs-empty kh-rs-empty--illustrated">
          <CalendarOutlined className="kh-rs-empty__icon" />
          <p>No sessions published yet</p>
          <Link href="/meets">Browse meets</Link>
        </div>
      ) : (
        <div className="kh-rs-sessions-minimal">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={session.href}
              className="kh-rs-sessions-minimal__item"
            >
              <strong>{session.title}</strong>
              {session.speakerName && <span>{session.speakerName}</span>}
            </Link>
          ))}
        </div>
      )}
    </SidebarSection>
  );
}

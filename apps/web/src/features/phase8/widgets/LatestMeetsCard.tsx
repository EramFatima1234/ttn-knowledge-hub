"use client";

import Link from "next/link";
import { Tag } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import WidgetShell from "./WidgetShell";

export interface LatestMeetCardData {
  id: string;
  title: string;
  timeLabel: string;
  durationMinutes: number;
  competency?: string | null;
  difficulty?: string | null;
  href: string;
}

interface LatestMeetsCardProps {
  sessions: LatestMeetCardData[];
  viewAllHref?: string;
  delay?: number;
}

export default function LatestMeetsCard({
  sessions,
  viewAllHref = "/meets",
  delay = 0,
}: LatestMeetsCardProps) {
  return (
    <WidgetShell
      title="Latest Knowledge Meets"
      action={<Link href={viewAllHref}>View All</Link>}
      delay={delay}
      className="kh-p8-sessions"
    >
      {sessions.length === 0 ? (
        <p className="kh-p8-empty">No published sessions yet</p>
      ) : (
        sessions.slice(0, 4).map((s) => (
          <Link key={s.id} href={s.href} className="kh-p8-sessions__item">
            <strong>{s.title}</strong>
            <span>
              <ClockCircleOutlined /> {s.timeLabel} · {s.durationMinutes} min
            </span>
            <div className="kh-p8-sessions__tags">
              {s.competency && <Tag>{s.competency}</Tag>}
              {s.difficulty && <Tag color="blue">{s.difficulty}</Tag>}
            </div>
          </Link>
        ))
      )}
    </WidgetShell>
  );
}

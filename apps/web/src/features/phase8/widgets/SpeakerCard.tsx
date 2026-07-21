"use client";

import Link from "next/link";
import { Avatar, Rate, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import WidgetShell from "./WidgetShell";

export interface SpeakerCardData {
  id: string;
  slug: string;
  name: string;
  designation?: string | null;
  competency?: string | null;
  avatarUrl?: string | null;
  avgRating?: number | null;
  sessionCount?: number;
}

interface SpeakerCardProps {
  speaker: SpeakerCardData;
  delay?: number;
}

export default function SpeakerCard({ speaker, delay = 0 }: SpeakerCardProps) {
  return (
    <WidgetShell delay={delay} className="kh-p8-speaker-card">
      <Link href={`/speakers/${speaker.slug}`} className="kh-p8-speaker-card__link">
        <Avatar size={64} src={speaker.avatarUrl || undefined} icon={<UserOutlined />} />
        <h4>{speaker.name}</h4>
        {speaker.designation && <p>{speaker.designation}</p>}
        {speaker.competency && <Tag color="magenta">{speaker.competency}</Tag>}
        {speaker.avgRating != null && (
          <div className="kh-p8-speaker-card__rating">
            <Rate disabled allowHalf value={speaker.avgRating} />
            <span>{speaker.avgRating}</span>
          </div>
        )}
        {speaker.sessionCount != null && (
          <small>{speaker.sessionCount} sessions</small>
        )}
      </Link>
    </WidgetShell>
  );
}

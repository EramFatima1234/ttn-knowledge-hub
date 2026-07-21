"use client";

import Link from "next/link";
import { Avatar, Rate } from "antd";
import { UserOutlined } from "@ant-design/icons";
import AspireButton from "@/components/ui/AspireButton";
import SidebarSection from "@/components/right-sidebar/SidebarSection";
import { useRightSidebarSpeakerSpotlight } from "@/hooks/useRightSidebar";

export default function SpeakerSpotlightCard() {
  const { speaker } = useRightSidebarSpeakerSpotlight();

  if (!speaker) {
    return null;
  }

  return (
    <SidebarSection title="Speaker Spotlight" icon="👨‍🏫" delay={0.2}>
      <div className="kh-rs-card kh-rs-speaker">
        <Avatar
          size={72}
          src={speaker.avatarUrl || undefined}
          icon={<UserOutlined />}
          className="kh-rs-speaker__avatar"
        />
        <h3>{speaker.name}</h3>
        <p className="kh-rs-speaker__designation">{speaker.designation}</p>
        <span className="kh-rs-speaker__competency">{speaker.competency}</span>
        <div className="kh-rs-speaker__rating">
          <Rate disabled allowHalf value={speaker.avgRating ?? 0} />
          {speaker.avgRating != null && <span>{speaker.avgRating}</span>}
        </div>
        <p className="kh-rs-speaker__sessions">{speaker.sessionCount} Sessions</p>
        <Link href={`/speakers/${speaker.slug}`}>
          <AspireButton aspireVariant="secondary" block size="small">
            View Profile
          </AspireButton>
        </Link>
      </div>
    </SidebarSection>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpOutlined, FireOutlined } from "@ant-design/icons";
import SidebarSection from "@/components/right-sidebar/SidebarSection";
import { useRightSidebarTrending } from "@/hooks/useRightSidebar";

export default function TrendingTechnologiesCard({ contentOnly = false }: { contentOnly?: boolean }) {
  const { technologies } = useRightSidebarTrending();

  return (
    <SidebarSection title="Trending Technologies" icon="🔥" contentOnly={contentOnly} delay={0.1}>
      <div className="kh-rs-card kh-rs-trending">
        {technologies.map((tech) => (
          <Link
            key={tech.id}
            href={`/explore?competency=${tech.filterSlug}`}
            className="kh-rs-trending__item"
          >
            <div className="kh-rs-trending__left">
              <span className="kh-rs-trending__emoji">{tech.emoji}</span>
              <div>
                <strong>{tech.name}</strong>
                <small>{tech.sessionCount} Sessions</small>
              </div>
            </div>
            <span className="kh-rs-trending__arrow" aria-hidden>
              {tech.trend === "hot" ? <FireOutlined /> : <ArrowUpOutlined />}
            </span>
          </Link>
        ))}
      </div>
    </SidebarSection>
  );
}

"use client";

import Link from "next/link";
import { Collapse } from "antd";
import LatestMeetsSidebarCard from "@/components/right-sidebar/LatestMeetsSidebarCard";
import TrendingTechnologiesCard from "@/components/right-sidebar/TrendingTechnologiesCard";
import CompetenciesCard from "@/components/right-sidebar/CompetenciesCard";
import BookmarksCard from "@/components/right-sidebar/BookmarksCard";

function AccordionLabel({ icon, title }: { icon: string; title: string }) {
  return (
    <span className="kh-rs-accordion__label">
      <span className="kh-rs-accordion__icon">{icon}</span>
      {title}
    </span>
  );
}

function AccordionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="kh-rs-section__link"
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </Link>
  );
}

export default function RightSidebar() {
  return (
    <div className="kh-right-sidebar">
      <Collapse
        bordered={false}
        className="kh-rs-accordion"
        defaultActiveKey={["latest-meets"]}
        expandIconPosition="end"
        items={[
          {
            key: "latest-meets",
            label: <AccordionLabel icon="📅" title="Latest Knowledge Meets" />,
            extra: <AccordionLink href="/meets">View All</AccordionLink>,
            children: <LatestMeetsSidebarCard contentOnly />,
          },
          {
            key: "trending",
            label: <AccordionLabel icon="🔥" title="Trending Technologies" />,
            children: <TrendingTechnologiesCard contentOnly />,
          },
          {
            key: "competencies",
            label: <AccordionLabel icon="🏷" title="Competencies" />,
            extra: <AccordionLink href="/explore">View All</AccordionLink>,
            children: <CompetenciesCard contentOnly />,
          },
          {
            key: "bookmarks",
            label: <AccordionLabel icon="⭐" title="Recently Bookmarked" />,
            extra: <AccordionLink href="/explore">View All</AccordionLink>,
            children: <BookmarksCard contentOnly />,
          },
        ]}
      />
    </div>
  );
}

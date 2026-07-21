"use client";

import Link from "next/link";
import SidebarSection from "@/components/right-sidebar/SidebarSection";
import { useRightSidebarCompetencies } from "@/hooks/useRightSidebar";

export default function CompetenciesCard({ contentOnly = false }: { contentOnly?: boolean }) {
  const { competencies, isLoading, isError, refetch } = useRightSidebarCompetencies();

  return (
    <SidebarSection
      title="Competencies"
      icon="🏷"
      contentOnly={contentOnly}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      delay={0.15}
      action={
        contentOnly ? undefined : (
          <Link href="/explore" className="kh-rs-section__link">
            View All
          </Link>
        )
      }
    >
      <div className="kh-rs-card kh-rs-competencies">
        {competencies.map((item) => (
          <Link
            key={item.id}
            href={`/competencies/${item.slug}`}
            className="kh-rs-competency-chip"
          >
            <span>{item.name}</span>
            <small>({item.sessionCount})</small>
          </Link>
        ))}
      </div>
    </SidebarSection>
  );
}

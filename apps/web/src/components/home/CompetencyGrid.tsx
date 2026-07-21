"use client";

import { Skeleton, Tag } from "antd";
import Link from "next/link";
import { useCompetencies } from "@/hooks/useTaxonomy";

interface CompetencyGridProps {
  variant?: "default" | "panel";
}

export default function CompetencyGrid({ variant = "default" }: CompetencyGridProps) {
  const { data, isLoading } = useCompetencies();
  const isPanel = variant === "panel";
  const limit = isPanel ? 10 : 12;

  return (
    <section className={isPanel ? "right-panel-section kh-competency--panel" : "kh-row"}>
      <div className={isPanel ? "right-panel-section__header" : "kh-row__header"}>
        <h2 className={isPanel ? "right-panel-section__title" : undefined}>
          Competencies
        </h2>
        <Link href="/explore">View all</Link>
      </div>
      <div
        className={
          isPanel ? "kh-competency-grid kh-competency-grid--panel" : "kh-competency-grid"
        }
      >
        {isLoading &&
          Array.from({ length: isPanel ? 6 : 8 }).map((_, i) => (
            <Skeleton.Button key={i} active block className="kh-competency-skeleton" />
          ))}
        {data?.slice(0, limit).map((item) => (
          <Link
            key={item.id}
            href={`/explore?competency=${item.slug}`}
            className="kh-competency-chip"
          >
            <Tag>{item.name}</Tag>
          </Link>
        ))}
      </div>
    </section>
  );
}

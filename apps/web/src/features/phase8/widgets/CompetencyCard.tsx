"use client";

import Link from "next/link";
import WidgetShell from "./WidgetShell";

export interface CompetencyCardData {
  id: string;
  slug: string;
  name: string;
  sessionCount: number;
  description?: string | null;
}

interface CompetencyCardProps {
  competency: CompetencyCardData;
  delay?: number;
}

export default function CompetencyCard({ competency, delay = 0 }: CompetencyCardProps) {
  return (
    <WidgetShell delay={delay} className="kh-p8-competency-card">
      <Link href={`/competencies/${competency.slug}`} className="kh-p8-competency-card__link">
        <h4>{competency.name}</h4>
        {competency.description && <p>{competency.description}</p>}
        <strong>{competency.sessionCount} sessions</strong>
      </Link>
    </WidgetShell>
  );
}

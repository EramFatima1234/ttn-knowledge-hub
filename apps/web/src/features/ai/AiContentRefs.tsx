"use client";

import Link from "next/link";
import type { AiContentRef } from "@knowledgehub/types";

function RefList({ title, items }: { title: string; items: AiContentRef[] }) {
  if (!items.length) return null;
  return (
    <section className="kh-ai-refs">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <Link href={item.href}>{item.title}</Link>
            {item.subtitle && <span>{item.subtitle}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AiContentRefs({
  sessions,
  series,
  speakers,
  competencies,
}: {
  sessions: AiContentRef[];
  series: AiContentRef[];
  speakers: AiContentRef[];
  competencies: AiContentRef[];
}) {
  return (
    <div className="kh-ai-refs-grid">
      <RefList title="Sessions" items={sessions} />
      <RefList title="Knowledge Series" items={series} />
      <RefList title="Speakers" items={speakers} />
      <RefList title="Competencies" items={competencies} />
    </div>
  );
}

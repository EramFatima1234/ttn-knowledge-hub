"use client";

import Link from "next/link";
import { Empty, Input, Select, Spin } from "antd";
import { useMemo, useState } from "react";
import ContentRow from "@/components/home/ContentRow";
import { useMeets } from "@/hooks/useContent";
import { useSpeakers } from "@/hooks/usePhase7Features";
import { useExploreHub } from "@/hooks/useRecommendations";
import type { KnowledgeMeetSummary } from "@knowledgehub/types";

type MeetSort = "newest" | "oldest" | "popular";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

export default function MeetsPage() {
  const [search, setSearch] = useState("");
  const [competencyId, setCompetencyId] = useState<string>();
  const [speakerId, setSpeakerId] = useState<string>();
  const [year, setYear] = useState<number>();
  const [difficulty, setDifficulty] = useState<string>();
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<MeetSort>("newest");

  const { data: hub } = useExploreHub();
  const { data: speakers = [] } = useSpeakers();
  const { data: meets, isLoading, isError } = useMeets({
    search: search || undefined,
    competencyId,
    speakerId,
    year,
    difficulty,
    tag: tag || undefined,
    sort,
    limit: 48,
  });

  const items = useMemo(
    () => (meets ?? []) as KnowledgeMeetSummary[],
    [meets],
  );

  const hasFilters = Boolean(search || competencyId || speakerId || year || difficulty || tag || sort !== "newest");

  return (
    <div className="kh-page kh-meets-page">
      <div className="page_header kh-meets-page__header">
        <div>
          <h1 className="inner_heading pink-border">Knowledge Meets</h1>
          <p>Recorded monthly learning sessions — watch anytime.</p>
        </div>
      </div>

      <div className="kh-cms-filters kh-meets-page__filters">
        <Input.Search
          placeholder="Search sessions"
          allowClear
          onSearch={setSearch}
          style={{ maxWidth: 280 }}
        />
        <Select
          allowClear
          placeholder="Competency"
          style={{ minWidth: 180 }}
          value={competencyId}
          onChange={setCompetencyId}
          options={(hub?.competencies ?? []).map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          allowClear
          placeholder="Speaker"
          style={{ minWidth: 180 }}
          value={speakerId}
          onChange={setSpeakerId}
          options={speakers.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Select
          allowClear
          placeholder="Year"
          style={{ width: 120 }}
          value={year}
          onChange={setYear}
          options={yearOptions.map((y) => ({ value: y, label: String(y) }))}
        />
        <Select
          allowClear
          placeholder="Difficulty"
          style={{ width: 140 }}
          value={difficulty}
          onChange={setDifficulty}
          options={[
            { value: "BEGINNER", label: "Beginner" },
            { value: "INTERMEDIATE", label: "Intermediate" },
            { value: "ADVANCED", label: "Advanced" },
          ]}
        />
        <Input
          allowClear
          placeholder="Tag"
          style={{ width: 140 }}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <Select
          value={sort}
          onChange={setSort}
          style={{ width: 150 }}
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "popular", label: "Most Viewed" },
          ]}
        />
        {hasFilters && (
          <button
            type="button"
            className="kh-explore-filters__clear"
            onClick={() => {
              setSearch("");
              setCompetencyId(undefined);
              setSpeakerId(undefined);
              setYear(undefined);
              setDifficulty(undefined);
              setTag("");
              setSort("newest");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="kh-auth-loading">
          <Spin size="large" />
        </div>
      ) : isError ? (
        <Empty description="Unable to load sessions. Please try again." />
      ) : items.length === 0 ? (
        <div className="kh-meets-page__empty">
          <Empty description="No published sessions match your filters." />
          <Link href="/explore" className="kh-meets-page__explore-link">
            Explore learning content
          </Link>
        </div>
      ) : (
        <div className="kh-meets-page__grid">
          <ContentRow title="" items={items} />
        </div>
      )}
    </div>
  );
}

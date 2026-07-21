"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ContentType, SearchSort } from "@knowledgehub/types";
import { useSearch } from "@/hooks/useSearch";
import { useCompetencies } from "@/hooks/useTaxonomy";
import { useSpeakers } from "@/hooks/usePhase7Features";
import { useSeriesList } from "@/hooks/useContent";
import SearchResults, { SearchTypeFilter } from "@/components/search/SearchResults";
import SearchDiscovery from "@/components/search/SearchDiscovery";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="kh-search__loading">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

const DURATION_FILTERS = [
  { label: "Any duration", min: undefined, max: undefined },
  { label: "Under 15 min", min: undefined, max: 900 },
  { label: "15–45 min", min: 900, max: 2700 },
  { label: "Over 45 min", min: 2700, max: undefined },
];

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [types, setTypes] = useState<ContentType[]>([]);
  const [competencyId, setCompetencyId] = useState<string>();
  const [speakerId, setSpeakerId] = useState<string>();
  const [seriesId, setSeriesId] = useState<string>();
  const [durationKey, setDurationKey] = useState(0);
  const [sort, setSort] = useState<SearchSort>("relevance");
  const [page, setPage] = useState(1);

  const DEFAULT_DURATION = DURATION_FILTERS[0]!;
  const duration = DURATION_FILTERS[durationKey] ?? DEFAULT_DURATION;
  const { data: competencies = [] } = useCompetencies();
  const { data: speakers = [] } = useSpeakers();
  const { data: seriesList = [] } = useSeriesList();
  const { data, isLoading } = useSearch({
    q: submittedQuery,
    types: types.length ? types : undefined,
    competencyId,
    speakerId,
    seriesId,
    minDuration: duration.min,
    maxDuration: duration.max,
    sort,
    page,
    limit: 12,
  });

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setSubmittedQuery(q);
    setPage(1);
  }, [searchParams]);

  const runSearch = (value?: string) => {
    const next = (value ?? query).trim();
    setSubmittedQuery(next);
    setPage(1);
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  };

  return (
    <div className="kh-search">
      <div className="page_header">
        <h1 className="inner_heading pink-border">Search</h1>
        <Input.Search
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Search videos, series, meets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={runSearch}
          enterButton="Search"
          allowClear
        />
      </div>

      {!submittedQuery && (
        <SearchDiscovery onSelect={(q) => {
          setQuery(q);
          runSearch(q);
        }} />
      )}

      {submittedQuery && (
        <>
          <div className="kh-search__filters">
            <SearchTypeFilter value={types} onChange={setTypes} />
            <Select
              allowClear
              placeholder="Competency"
              style={{ minWidth: 180 }}
              value={competencyId}
              onChange={setCompetencyId}
              options={competencies.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
            <Select
              allowClear
              placeholder="Speaker"
              style={{ minWidth: 180 }}
              value={speakerId}
              onChange={setSpeakerId}
              options={speakers.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
            />
            <Select
              allowClear
              placeholder="Series"
              style={{ minWidth: 180 }}
              value={seriesId}
              onChange={setSeriesId}
              options={seriesList.map((s) => ({
                label: s.title,
                value: s.id,
              }))}
            />
            <Select
              value={durationKey}
              onChange={setDurationKey}
              style={{ minWidth: 160 }}
              options={DURATION_FILTERS.map((item, index) => ({
                label: item.label,
                value: index,
              }))}
            />
            <Select
              value={sort}
              onChange={setSort}
              style={{ width: 160 }}
              options={[
                { label: "Relevance", value: "relevance" },
                { label: "Newest", value: "newest" },
                { label: "Popular", value: "popular" },
              ]}
            />
          </div>

          <p className="kh-search__summary">
            {data?.meta.total ?? 0} results for &ldquo;{submittedQuery}&rdquo;
          </p>

          <SearchResults
            items={data?.items ?? []}
            loading={isLoading}
            total={data?.meta.total}
            page={page}
            pageSize={12}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

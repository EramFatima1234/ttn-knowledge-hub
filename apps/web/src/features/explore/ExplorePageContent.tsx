"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Segmented, Select, Skeleton } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useExploreHub } from "@/hooks/useRecommendations";
import { useMeets, useSeriesList, useVideos } from "@/hooks/useContent";
import ContentRow from "@/components/home/ContentRow";
import VideoGrid from "@/components/home/VideoGrid";
import type { VideoSummary } from "@knowledgehub/types";

type ContentFilter = "all" | "videos" | "series" | "meets";
type SortFilter = "popular" | "latest";

function matchesSearch(title: string, query: string) {
  if (!query.trim()) return true;
  return title.toLowerCase().includes(query.trim().toLowerCase());
}

export default function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const competencySlug = searchParams.get("competency");
  const contentType = (searchParams.get("type") as ContentFilter) || "all";
  const sort = (searchParams.get("sort") as SortFilter) || "popular";
  const searchQuery = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      const qs = params.toString();
      router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
    },
    [router, searchParams],
  );

  const { data: hub, isLoading } = useExploreHub();
  const selectedCompetency = hub?.competencies.find((item) => item.slug === competencySlug);

  const { data: videos = [], isLoading: videosLoading } = useVideos({
    competencyId: selectedCompetency?.id,
    limit: 24,
    sort,
  });
  const { data: meets = [], isLoading: meetsLoading } = useMeets({
    competencyId: selectedCompetency?.id,
    sort: "newest",
    limit: 24,
  });
  const { data: series = [], isLoading: seriesLoading } = useSeriesList();

  const filteredVideos = useMemo(() => {
    const source = videos.length > 0 ? videos : (hub?.featuredVideos ?? []);
    return source.filter((item) => matchesSearch(item.title, searchQuery)) as VideoSummary[];
  }, [videos, hub?.featuredVideos, searchQuery]);

  const filteredSeries = useMemo(() => {
    let items = series.length > 0 ? series : (hub?.featuredSeries ?? []);
    if (selectedCompetency) {
      items = items.filter((item) => item.competency?.slug === competencySlug);
    }
    return items.filter((item) => matchesSearch(item.title, searchQuery));
  }, [series, hub?.featuredSeries, selectedCompetency, competencySlug, searchQuery]);

  const filteredMeets = useMemo(() => {
    let items = meets.length > 0 ? meets : (hub?.latestMeets ?? hub?.upcomingMeets ?? []);
    if (selectedCompetency) {
      items = items.filter((item) => item.competency?.slug === competencySlug);
    }
    return items.filter((item) => matchesSearch(item.title, searchQuery));
  }, [meets, hub?.latestMeets, hub?.upcomingMeets, selectedCompetency, competencySlug, searchQuery]);

  const resultCount =
    (contentType === "all" || contentType === "videos" ? filteredVideos.length : 0)
    + (contentType === "all" || contentType === "series" ? filteredSeries.length : 0)
    + (contentType === "all" || contentType === "meets" ? filteredMeets.length : 0);

  const runSearch = (value?: string) => {
    updateParams({ q: (value ?? searchInput).trim() || null });
  };

  const clearFilters = () => {
    setSearchInput("");
    router.replace("/explore", { scroll: false });
  };

  if (isLoading || !hub) {
    return (
      <div className="kh-explore">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  const hasActiveFilters = Boolean(competencySlug || searchQuery || contentType !== "all" || sort !== "popular");

  return (
    <div className="kh-explore">
      <div className="kh-explore__hero">
        <div>
          <h1 className="inner_heading pink-border">Explore</h1>
          <p>Discover videos, series, and recorded knowledge meets across competencies.</p>
        </div>
      </div>

      <section className="kh-explore-filters">
        <div className="kh-explore-filters__search">
          <Input
            size="large"
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search within explore..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onPressEnter={() => runSearch()}
          />
          <button type="button" className="kh-explore-filters__search-btn" onClick={() => runSearch()}>
            Search
          </button>
        </div>

        <div className="kh-explore-filters__row">
          <span className="kh-explore-filters__label">Content</span>
          <Segmented
            value={contentType}
            onChange={(value) => updateParams({ type: value === "all" ? null : String(value) })}
            options={[
              { label: "All", value: "all" },
              { label: "Videos", value: "videos" },
              { label: "Series", value: "series" },
              { label: "Meets", value: "meets" },
            ]}
          />
          <Select
            value={sort}
            onChange={(value) => updateParams({ sort: value === "popular" ? null : value })}
            style={{ minWidth: 150 }}
            options={[
              { label: "Most popular", value: "popular" },
              { label: "Latest", value: "latest" },
            ]}
          />
          {hasActiveFilters && (
            <button type="button" className="kh-explore-filters__clear" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        <div className="kh-explore-filters__row kh-explore-filters__row--chips">
          <span className="kh-explore-filters__label">Competency</span>
          <div className="kh-explore-filters__chips">
            <button
              type="button"
              className={`kh-explore-chip${!competencySlug ? " kh-explore-chip--active" : ""}`}
              onClick={() => updateParams({ competency: null })}
            >
              All
            </button>
            {hub.competencies.map((competency) => (
              <button
                key={competency.id}
                type="button"
                className={`kh-explore-chip${competencySlug === competency.slug ? " kh-explore-chip--active" : ""}`}
                onClick={() => updateParams({ competency: competency.slug })}
              >
                <span>{competency.icon ?? "📚"}</span>
                {competency.name}
                <small>{competency.videoCount + competency.seriesCount + competency.meetCount}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="kh-explore__summary">
        {resultCount} result{resultCount === 1 ? "" : "s"}
        {selectedCompetency ? ` in ${selectedCompetency.name}` : ""}
        {searchQuery ? ` matching "${searchQuery}"` : ""}
      </p>

      {(contentType === "all" || contentType === "videos") && (
        <VideoGrid
          title={contentType === "videos" ? "Videos" : "Featured videos"}
          videos={filteredVideos}
          loading={videosLoading}
        />
      )}

      {(contentType === "all" || contentType === "series") && (
        <ContentRow
          title="Knowledge series"
          items={filteredSeries}
          showProgress
          loading={seriesLoading}
        />
      )}

      {(contentType === "all" || contentType === "meets") && (
        <ContentRow
          title="Latest Knowledge Meets"
          items={filteredMeets}
          loading={meetsLoading}
        />
      )}

      {resultCount === 0 && (
        <div className="kh-explore__empty">
          <p>No content matches your filters.</p>
          <button type="button" className="kh-explore-filters__clear" onClick={clearFilters}>
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}

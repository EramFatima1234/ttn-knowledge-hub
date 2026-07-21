"use client";

import Link from "next/link";
import { Empty, Pagination, Select, Spin, Tag } from "antd";
import { ContentType, SearchResultItem } from "@knowledgehub/types";
import { formatMeetDate } from "@/lib/format";
import { resolveThumbnailUrl } from "@/lib/content-images";

interface SearchResultsProps {
  items: SearchResultItem[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

function getHref(item: SearchResultItem): string {
  switch (item.type) {
    case ContentType.KNOWLEDGE_MEET:
      return `/meets/${item.id}`;
    case ContentType.KNOWLEDGE_SERIES:
      return `/series/${item.id}`;
    default:
      return `/watch/${item.id}`;
  }
}

function getTypeLabel(type: ContentType): string {
  switch (type) {
    case ContentType.KNOWLEDGE_MEET:
      return "Meet";
    case ContentType.KNOWLEDGE_SERIES:
      return "Series";
    default:
      return "Video";
  }
}

export default function SearchResults({
  items,
  loading,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="kh-search__loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!items.length) {
    return <Empty description="No results found" />;
  }

  return (
    <div className="kh-search__results">
      <div className="kh-search__grid">
        {items.map((item) => (
          <Link key={`${item.type}-${item.id}`} href={getHref(item)} className="kh-search-card">
            <div className="kh-search-card__thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveThumbnailUrl(item.thumbnailUrl)} alt={item.title} />
            </div>
            <div className="kh-search-card__body">
              <div className="kh-search-card__tags">
                <Tag>{getTypeLabel(item.type as ContentType)}</Tag>
                {item.competency && <Tag color="purple">{item.competency.name}</Tag>}
              </div>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
              <div className="kh-search-card__meta">
                {item.scheduledAt && <span>{formatMeetDate(item.scheduledAt)}</span>}
                {item.viewCount !== undefined && <span>{item.viewCount} views</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {total > pageSize && onPageChange && (
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          className="kh-search__pagination"
        />
      )}
    </div>
  );
}

export function SearchTypeFilter({
  value,
  onChange,
}: {
  value?: ContentType[];
  onChange: (types: ContentType[]) => void;
}) {
  return (
    <Select
      mode="multiple"
      allowClear
      placeholder="All content types"
      style={{ minWidth: 220 }}
      value={value}
      onChange={onChange}
      options={[
        { label: "Videos", value: ContentType.VIDEO },
        { label: "Meets", value: ContentType.KNOWLEDGE_MEET },
        { label: "Series", value: ContentType.KNOWLEDGE_SERIES },
      ]}
    />
  );
}

"use client";

import { Tag } from "antd";
import {
  usePopularSearches,
  useRecentSearches,
  useTrendingSearches,
} from "@/hooks/useSearch";

interface SearchDiscoveryProps {
  onSelect: (query: string) => void;
}

export default function SearchDiscovery({ onSelect }: SearchDiscoveryProps) {
  const { data: recent = [] } = useRecentSearches();
  const { data: popular = [] } = usePopularSearches();
  const { data: trending = [] } = useTrendingSearches();

  return (
    <div className="kh-search-discovery">
      {recent.length > 0 && (
        <section>
          <h3>Recent searches</h3>
          <div className="kh-search-discovery__tags">
            {recent.map((query) => (
              <Tag
                key={query}
                className="kh-search-discovery__tag"
                onClick={() => onSelect(query)}
              >
                {query}
              </Tag>
            ))}
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section>
          <h3>Trending</h3>
          <div className="kh-search-discovery__tags">
            {trending.map((item) => (
              <Tag
                key={item.query}
                color="magenta"
                className="kh-search-discovery__tag"
                onClick={() => onSelect(item.query)}
              >
                {item.query}
                <small>{item.count}</small>
              </Tag>
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section>
          <h3>Popular</h3>
          <div className="kh-search-discovery__tags">
            {popular.map((item) => (
              <Tag
                key={item.query}
                className="kh-search-discovery__tag"
                onClick={() => onSelect(item.query)}
              >
                {item.query}
                <small>{item.count}</small>
              </Tag>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

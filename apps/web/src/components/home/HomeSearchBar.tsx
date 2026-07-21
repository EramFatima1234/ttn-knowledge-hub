"use client";

import { useMemo, useState } from "react";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ContentType } from "@knowledgehub/types";
import { useSearchSuggestions } from "@/hooks/useSearch";

const TYPE_LABELS: Record<ContentType, string> = {
  VIDEO: "Video",
  KNOWLEDGE_MEET: "Meet",
  KNOWLEDGE_SERIES: "Series",
};

function hrefForSuggestion(type: ContentType, id: string): string {
  if (type === ContentType.VIDEO) return `/watch/${id}`;
  if (type === ContentType.KNOWLEDGE_MEET) return `/meets/${id}`;
  return `/series/${id}`;
}

export default function HomeSearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const { data: suggestions = [] } = useSearchSuggestions(value);

  const options = useMemo(
    () =>
      suggestions.map((item) => ({
        value: item.text,
        label: (
          <div className="kh-home-search__option">
            <span>{item.text}</span>
            <small>{TYPE_LABELS[item.type]}</small>
          </div>
        ),
        suggestion: item,
      })),
    [suggestions],
  );

  const navigate = (query: string) => {
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <section className="kh-home-search">
      <AutoComplete
        className="kh-home-search__autocomplete"
        value={value}
        options={options}
        onSearch={setValue}
        onSelect={(_, option) => {
          const suggestion = (option as { suggestion?: { type: ContentType; id: string; text: string } })
            .suggestion;
          if (suggestion) {
            router.push(hrefForSuggestion(suggestion.type, suggestion.id));
            return;
          }
          navigate(String(option.value ?? value));
        }}
      >
        <Input
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Search videos, series, meets..."
          className="kh-home-search__input"
          allowClear
          onClear={() => setValue("")}
          onPressEnter={() => navigate(value)}
        />
      </AutoComplete>
    </section>
  );
}

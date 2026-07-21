"use client";

import { Spin } from "antd";
import ContentRow from "@/components/home/ContentRow";
import { useSeriesList } from "@/hooks/useContent";

export default function SeriesListPage() {
  const { data: series, isLoading } = useSeriesList();

  return (
    <div className="kh-page">
      <div className="page_header">
        <div>
          <h1 className="inner_heading pink-border">Knowledge Series</h1>
          <p>Structured learning paths with session progress.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="kh-auth-loading">
          <Spin size="large" />
        </div>
      ) : (
        <ContentRow title="" items={series ?? []} showProgress />
      )}
    </div>
  );
}

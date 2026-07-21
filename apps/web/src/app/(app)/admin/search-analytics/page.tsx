"use client";

import { Row, Col, Spin, Empty, Tag } from "antd";
import { useSearchAnalyticsDashboard } from "@/hooks/usePhase8";
import { ChartCard, StatCard } from "@/features/phase8/widgets";

export default function SearchAnalyticsPage() {
  const {
    topSearched,
    noResults,
    popular,
    trending,
    recent,
    suggestions,
    isLoading,
    isError,
  } = useSearchAnalyticsDashboard();

  if (isLoading) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="kh-p8-page">
        <p className="kh-p8-empty">Search analytics are not available right now.</p>
      </div>
    );
  }

  return (
    <div className="kh-p8-page">
      <div className="page_header">
        <h1 className="inner_heading pink-border">Search Analytics</h1>
        <p>Understand what engineers are looking for and where content gaps exist.</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard title="Top Searched Technologies">
            {topSearched.length === 0 ? (
              <Empty description="No search data yet" />
            ) : (
              <ul className="kh-p8-list">
                {topSearched.map((item) => (
                  <li key={item.query}>
                    <strong>{item.query}</strong>
                    <span>{item.count} searches</span>
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="Searches With No Results">
            {noResults.length === 0 ? (
              <Empty description="No zero-result searches recorded" />
            ) : (
              <ul className="kh-p8-list">
                {noResults.map((item) => (
                  <li key={item.query} className="kh-p8-list__alert">
                    <div>
                      <strong>{item.query}</strong>
                      <span>{item.count} searches</span>
                    </div>
                    {item.suggestion && <Tag color="magenta">Suggestion: {item.suggestion}</Tag>}
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <StatCard title="Trending (7d)" value={trending.length} loading={isLoading} />
          <ul className="kh-p8-list kh-p8-list--compact">
            {trending.map((t) => (
              <li key={t.query}>{t.query} ({t.count})</li>
            ))}
          </ul>
        </Col>
        <Col xs={24} md={8}>
          <StatCard title="Popular (30d)" value={popular.length} loading={isLoading} />
          <ul className="kh-p8-list kh-p8-list--compact">
            {popular.map((p) => (
              <li key={p.query}>{p.query} ({p.count})</li>
            ))}
          </ul>
        </Col>
        <Col xs={24} md={8}>
          <StatCard title="Recent Searches" value={recent.length} loading={isLoading} />
          <ul className="kh-p8-list kh-p8-list--compact">
            {recent.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Col>
      </Row>

      <ChartCard title="Admin Suggestions">
        <ul className="kh-p8-suggestions">
          {suggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </ChartCard>
    </div>
  );
}

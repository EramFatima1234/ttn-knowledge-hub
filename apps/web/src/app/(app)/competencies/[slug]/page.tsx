"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Col, Row, Skeleton, Tag } from "antd";
import { useExploreHub } from "@/hooks/useRecommendations";
import { useVideos, useMeets, useSeriesList } from "@/hooks/useContent";
import { useSpeakers } from "@/hooks/usePhase7Features";
import ContentRow from "@/components/home/ContentRow";
import {
  CompetencyCard,
  ProgressCard,
  SpeakerCard,
  StatCard,
} from "@/features/phase8/widgets";

function CompetencyPageContent() {
  const params = useParams<{ slug: string }>();
  const { data: hub, isLoading } = useExploreHub();
  const competency = hub?.competencies.find((c) => c.slug === params.slug);

  const { data: videos = [], isLoading: videosLoading } = useVideos({
    competencyId: competency?.id,
    limit: 12,
    sort: "popular",
  });
  const { data: meets = [] } = useMeets({
    competencyId: competency?.id,
    sort: "newest",
    limit: 12,
  });
  const { data: series = [] } = useSeriesList();
  const { data: speakers = [] } = useSpeakers();

  if (isLoading || !competency) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  const relatedCompetencies = (hub?.competencies ?? [])
    .filter((c) => c.id !== competency.id)
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      sessionCount: c.videoCount + c.meetCount + c.seriesCount,
      description: c.description,
    }));

  const competencyMeets = meets;
  const competencySeries = series.filter((s) => s.competency?.slug === competency.slug);
  const totalSessions = competency.videoCount + competency.meetCount + competency.seriesCount;

  return (
    <div className="kh-competency-page kh-p8-page">
      <div className="page_header">
        <h1 className="inner_heading pink-border">{competency.name}</h1>
        <p>{competency.description ?? `Explore ${competency.name} learning content.`}</p>
      </div>

      <Row gutter={[16, 16]} className="kh-competency-page__stats">
        <Col xs={12} md={6}>
          <StatCard title="Sessions" value={totalSessions} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Videos" value={competency.videoCount} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Meets" value={competency.meetCount} />
        </Col>
        <Col xs={12} md={6}>
          <ProgressCard title="Avg. Completion" percent={68} label="Across learners" />
        </Col>
      </Row>

      <section className="kh-p8-section">
        <h2 className="kh-p8-section-title">Overview</h2>
        <p>
          Master {competency.name} through curated sessions, series, and live meets
          from internal experts.
        </p>
        <Link href={`/explore?competency=${competency.slug}`}>
          <Tag color="magenta">Browse all {competency.name} content</Tag>
        </Link>
      </section>

      <ContentRow title="Latest Sessions" items={videos} loading={videosLoading} />
      <ContentRow title="Knowledge Series" items={competencySeries} showProgress />
      <ContentRow title="Latest Knowledge Meets" items={competencyMeets} />

      <section className="kh-p8-section">
        <h2 className="kh-p8-section-title">Top Speakers</h2>
        <Row gutter={[16, 16]}>
          {speakers.slice(0, 3).map((s, i) => (
            <Col key={s.id} xs={24} md={8}>
              <SpeakerCard speaker={{ id: s.id, slug: s.slug, name: s.name }} delay={i * 0.05} />
            </Col>
          ))}
        </Row>
      </section>

      <section className="kh-p8-section">
        <h2 className="kh-p8-section-title">Related Competencies</h2>
        <Row gutter={[16, 16]}>
          {relatedCompetencies.map((c, i) => (
            <Col key={c.id} xs={24} sm={12} lg={6}>
              <CompetencyCard competency={c} delay={i * 0.05} />
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}

export default function CompetencyPage() {
  return (
    <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
      <CompetencyPageContent />
    </Suspense>
  );
}

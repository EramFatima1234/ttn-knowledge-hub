"use client";

import Link from "next/link";
import { Row, Col, Skeleton, Empty } from "antd";
import { useSpeakers } from "@/hooks/usePhase7Features";
import { useAuthStore } from "@/store/useAuthStore";
import { SpeakerCard } from "@/features/phase8/widgets";

export default function SpeakersListingPage() {
  const { data: speakers = [], isLoading } = useSpeakers();
  const isAdmin = useAuthStore((s) => s.isAdmin());

  return (
    <div className="kh-p8-page kh-speakers-page">
      <div className="page_header">
        <h1 className="inner_heading pink-border">Speakers</h1>
        <p>Internal experts sharing engineering knowledge across competencies.</p>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : speakers.length === 0 ? (
        <Empty description="No speakers available yet." />
      ) : (
        <Row gutter={[16, 16]}>
          {speakers.map((speaker, index) => (
            <Col key={speaker.id} xs={24} sm={12} lg={8} xl={6}>
              <SpeakerCard
                speaker={{
                  id: speaker.id,
                  slug: speaker.slug,
                  name: speaker.name,
                  designation: speaker.designation,
                  avatarUrl: speaker.avatarUrl,
                  sessionCount: speaker.sessionCount,
                }}
                delay={index * 0.04}
              />
            </Col>
          ))}
        </Row>
      )}

      {isAdmin && (
        <p className="kh-p8-page__footer">
          <Link href="/admin/catalog?tab=speakers">Admin: Manage Speakers</Link>
        </p>
      )}
    </div>
  );
}

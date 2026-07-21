"use client";

import { Col, Row } from "antd";
import { QuickActionCard } from "@/features/phase8/widgets";
import type { QuickAction } from "@/features/phase8/widgets";

interface QuickActionsGridProps {
  actions: QuickAction[];
  title?: string;
}

export default function QuickActionsGrid({ actions, title = "Quick Actions" }: QuickActionsGridProps) {
  return (
    <section className="kh-p8-quick-actions">
      <h2 className="kh-p8-section-title">{title}</h2>
      <Row gutter={[16, 16]}>
        {actions.map((action, index) => (
          <Col key={action.id} xs={24} sm={12} lg={8} xl={6}>
            <QuickActionCard action={action} delay={index * 0.04} />
          </Col>
        ))}
      </Row>
    </section>
  );
}

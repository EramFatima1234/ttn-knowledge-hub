"use client";

import { Skeleton } from "antd";
import type { ReactNode } from "react";
import WidgetShell from "./WidgetShell";

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  subtitle?: string;
  loading?: boolean;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  icon,
  subtitle,
  loading,
  delay = 0,
}: StatCardProps) {
  return (
    <WidgetShell delay={delay} className="kh-p8-stat">
      {loading ? (
        <Skeleton active paragraph={false} />
      ) : (
        <>
          <div className="kh-p8-stat__top">
            <span className="kh-p8-stat__title">{title}</span>
            {icon && <span className="kh-p8-stat__icon">{icon}</span>}
          </div>
          <div className="kh-p8-stat__value">{value}</div>
          {subtitle && <small className="kh-p8-stat__subtitle">{subtitle}</small>}
        </>
      )}
    </WidgetShell>
  );
}

"use client";

import WidgetShell from "./WidgetShell";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  delay?: number;
}

export default function ChartCard({ title, children, action, delay = 0 }: ChartCardProps) {
  return (
    <WidgetShell title={title} action={action} delay={delay} className="kh-p8-chart">
      {children}
    </WidgetShell>
  );
}

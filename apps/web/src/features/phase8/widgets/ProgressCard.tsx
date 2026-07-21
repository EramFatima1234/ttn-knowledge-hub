"use client";

import { Progress } from "antd";
import WidgetShell from "./WidgetShell";

interface ProgressCardProps {
  title: string;
  percent: number;
  label?: string;
  delay?: number;
}

export default function ProgressCard({ title, percent, label, delay = 0 }: ProgressCardProps) {
  return (
    <WidgetShell title={title} delay={delay} className="kh-p8-progress">
      <Progress percent={percent} strokeColor="#DE1186" trailColor="#f3e8ef" />
      {label && <small className="kh-p8-progress__label">{label}</small>}
    </WidgetShell>
  );
}

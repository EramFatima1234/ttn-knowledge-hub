"use client";

import { Tag } from "antd";
import type { CmsPublishStatus } from "../types";

const STATUS_COLORS: Record<CmsPublishStatus, string> = {
  DRAFT: "default",
  PUBLISHED: "success",
  ARCHIVED: "warning",
  PENDING: "processing",
};

export default function StatusTag({ status }: { status: CmsPublishStatus | string }) {
  const normalized = (status || "DRAFT").toUpperCase() as CmsPublishStatus;
  return <Tag color={STATUS_COLORS[normalized] ?? "default"}>{normalized}</Tag>;
}

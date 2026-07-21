"use client";

import Image from "next/image";
import Link from "next/link";
import { Checkbox, Tag } from "antd";
import AspireButton from "@/components/ui/AspireButton";
import WidgetShell from "./WidgetShell";

export interface ApprovalCardData {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  speaker?: string | null;
  competency?: string | null;
  contentType?: "MEET_RECORDING" | "SERIES_EPISODE" | "STANDALONE_VIDEO";
  contextTitle?: string | null;
  contextHref?: string | null;
  submittedBy: string;
  submittedAt: string;
  status: string;
}

function contentTypeLabel(
  contentType?: ApprovalCardData["contentType"],
): string {
  switch (contentType) {
    case "MEET_RECORDING":
      return "Knowledge Meet Recording";
    case "SERIES_EPISODE":
      return "Series Episode";
    default:
      return "Standalone Video";
  }
}

interface ApprovalCardProps {
  item: ApprovalCardData;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading?: boolean;
}

export default function ApprovalCard({
  item,
  selected,
  onSelect,
  onApprove,
  onReject,
  loading,
}: ApprovalCardProps) {
  return (
    <WidgetShell className="kh-p8-approval">
      <div className="kh-p8-approval__row">
        {onSelect && (
          <Checkbox
            checked={selected}
            onChange={(e) => onSelect(item.id, e.target.checked)}
          />
        )}
        <div className="kh-p8-approval__thumb">
          {item.thumbnailUrl ? (
            <Image src={item.thumbnailUrl} alt="" width={120} height={68} unoptimized />
          ) : (
            <div className="kh-p8-approval__placeholder" />
          )}
        </div>
        <div className="kh-p8-approval__meta">
          <Tag color="blue">{contentTypeLabel(item.contentType)}</Tag>
          <strong>{item.title}</strong>
          {item.contextTitle && item.contextHref && (
            <p>
              Session:{" "}
              <Link href={item.contextHref} className="kh-table-link">
                {item.contextTitle}
              </Link>
            </p>
          )}
          {item.contextTitle && !item.contextHref && (
            <p>Session: {item.contextTitle}</p>
          )}
          <p>Speaker: {item.speaker ?? "—"}</p>
          <p>Competency: {item.competency ?? "—"}</p>
          <p>By {item.submittedBy}</p>
          <small>{new Date(item.submittedAt).toLocaleString()}</small>
          <Tag color="orange">{item.status}</Tag>
        </div>
        <div className="kh-p8-approval__actions">
          <AspireButton size="small" loading={loading} onClick={() => onApprove(item.id)}>
            Approve
          </AspireButton>
          <AspireButton
            aspireVariant="secondary"
            size="small"
            loading={loading}
            onClick={() => onReject(item.id)}
          >
            Reject
          </AspireButton>
          <Link href={`/watch/${item.id}`}>
            <AspireButton aspireVariant="secondary" size="small">
              Preview
            </AspireButton>
          </Link>
        </div>
      </div>
    </WidgetShell>
  );
}

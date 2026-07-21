"use client";

import { useMemo, useState } from "react";
import { DatePicker, Select, Space, message } from "antd";
import AspireButton from "@/components/ui/AspireButton";
import {
  useApproveVideo,
  usePendingApprovals,
  useRejectVideo,
  type PendingApproval,
} from "@/hooks/useAdmin";
import { ApprovalCard } from "@/features/phase8/widgets";

function toApprovalCardItem(item: PendingApproval) {
  let contextHref: string | null = null;
  if (item.contentType === "MEET_RECORDING" && item.contextId) {
    contextHref = `/meets/${item.contextId}`;
  } else if (item.contentType === "SERIES_EPISODE" && item.contextId) {
    contextHref = `/series/${item.contextId}`;
  }

  return {
    id: item.id,
    title: item.title,
    thumbnailUrl: item.thumbnailUrl,
    competency: item.competency,
    speaker: item.speaker,
    contentType: item.contentType,
    contextTitle: item.contextTitle,
    contextHref,
    submittedBy: item.uploadedBy.name,
    submittedAt: item.updatedAt,
    status: item.status,
  };
}

export default function ApprovalCenter({ embedded = false }: { embedded?: boolean }) {
  const { data = [], isLoading } = usePendingApprovals();
  const approve = useApproveVideo();
  const reject = useRejectVideo();
  const [selected, setSelected] = useState<string[]>([]);
  const [competency, setCompetency] = useState<string>();
  const [contentType, setContentType] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();

  const competencies = useMemo(
    () => [...new Set(data.map((d) => d.competency).filter(Boolean))] as string[],
    [data],
  );

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (competency && item.competency !== competency) return false;
      if (contentType && item.contentType !== contentType) return false;
      if (status && item.status !== status) return false;
      return true;
    });
  }, [competency, contentType, data, status]);

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const bulkApprove = async () => {
    for (const id of selected) {
      await approve.mutateAsync(id);
    }
    messageApi.success(`Approved ${selected.length} sessions`);
    setSelected([]);
  };

  const handleApprove = async (id: string) => {
    await approve.mutateAsync(id);
    messageApi.success("Approved and published");
  };

  const handleReject = async (id: string) => {
    await reject.mutateAsync(id);
    messageApi.info("Returned to draft");
  };

  return (
    <div className={embedded ? "kh-cms-embedded" : "kh-p8-approval-center"}>
      {contextHolder}
      {!embedded && (
        <div className="page_header">
          <div>
            <h1 className="inner_heading pink-border">Approval Center</h1>
            <p>Review, preview, and bulk-approve team uploads including meet recordings.</p>
          </div>
        </div>
      )}

      <div className="kh-p8-approval-center__filters">
        <Space wrap>
          <Select
            allowClear
            placeholder="Competency"
            style={{ minWidth: 160 }}
            value={competency}
            onChange={setCompetency}
            options={competencies.map((c) => ({ label: c, value: c }))}
          />
          <Select
            allowClear
            placeholder="Content type"
            style={{ minWidth: 180 }}
            value={contentType}
            onChange={setContentType}
            options={[
              { label: "Meet Recording", value: "MEET_RECORDING" },
              { label: "Series Episode", value: "SERIES_EPISODE" },
              { label: "Standalone Video", value: "STANDALONE_VIDEO" },
            ]}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ minWidth: 160 }}
            value={status}
            onChange={setStatus}
            options={[{ label: "PENDING_APPROVAL", value: "PENDING_APPROVAL" }]}
          />
          <DatePicker placeholder="Submitted date" />
          <AspireButton
            disabled={!selected.length}
            loading={approve.isPending}
            onClick={bulkApprove}
          >
            Bulk Approve ({selected.length})
          </AspireButton>
        </Space>
      </div>

      {isLoading && <p>Loading approvals...</p>}

      {!isLoading && filtered.length === 0 && (
        <p className="kh-p8-empty">No pending approvals match your filters.</p>
      )}

      <div className="kh-p8-approval-center__list">
        {filtered.map((item) => (
          <ApprovalCard
            key={item.id}
            item={toApprovalCardItem(item)}
            selected={selected.includes(item.id)}
            onSelect={toggleSelect}
            onApprove={handleApprove}
            onReject={handleReject}
            loading={approve.isPending || reject.isPending}
          />
        ))}
      </div>
    </div>
  );
}

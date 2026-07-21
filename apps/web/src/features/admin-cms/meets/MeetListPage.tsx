"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Select, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useAdminMeets,
  useDeleteMeet,
  useDuplicateMeet,
  useSaveMeet,
  useAdminSpeakers,
  useAdminCompetencies,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import CmsDataTable from "@/features/admin-cms/components/CmsDataTable";
import { createActionColumn } from "@/features/admin-cms/components/createActionColumn";
import StatusTag from "@/features/admin-cms/components/StatusTag";
import type { AdminMeetRecord } from "@/features/admin-cms/types";
import { HOMEPAGE_SECTION_OPTIONS } from "@/features/admin-cms/constants/homepage-tags";
import { runCmsAction } from "@/lib/cms-actions";

const meetExportColumns = [
  { header: "Title", value: (row: AdminMeetRecord) => row.title },
  { header: "Speaker", value: (row: AdminMeetRecord) => row.speaker?.name ?? "" },
  { header: "Competency", value: (row: AdminMeetRecord) => row.competency?.name ?? "" },
  {
    header: "Date",
    value: (row: AdminMeetRecord) => new Date(row.scheduledAt).toLocaleDateString(),
  },
  {
    header: "Time",
    value: (row: AdminMeetRecord) =>
      row.startTime
      ?? new Date(row.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
  { header: "Duration (min)", value: (row: AdminMeetRecord) => row.durationMinutes },
  {
    header: "Recording",
    value: (row: AdminMeetRecord) =>
      row.hasRecording ? row.recordingStatus ?? "Uploaded" : "Pending",
  },
  { header: "Status", value: (row: AdminMeetRecord) => row.status },
];

interface MeetListPageProps {
  embedded?: boolean;
}

export default function MeetListPage({ embedded = false }: MeetListPageProps) {
  const { data = [], isLoading } = useAdminMeets();
  const { data: speakers = [] } = useAdminSpeakers();
  const { data: competencies = [] } = useAdminCompetencies();
  const saveMeet = useSaveMeet();
  const duplicateMeet = useDuplicateMeet();
  const deleteMeet = useDeleteMeet();
  const [messageApi, contextHolder] = message.useMessage();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [competencyId, setCompetencyId] = useState<string | undefined>();
  const [speakerId, setSpeakerId] = useState<string | undefined>();
  const [tagFilter, setTagFilter] = useState<string | undefined>();
  const [homepageFilter, setHomepageFilter] = useState<string | undefined>();
  const [timeFilter, setTimeFilter] = useState<string | undefined>();

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (status && item.status !== status) return false;
      if (competencyId && item.competency?.id !== competencyId) return false;
      if (speakerId && item.speaker?.id !== speakerId) return false;
      if (tagFilter && !(item.tags ?? []).includes(tagFilter)) return false;
      if (homepageFilter && !(item.homepageTags ?? []).includes(homepageFilter)) return false;
      if (timeFilter === "published" && item.status !== "PUBLISHED") return false;
      if (timeFilter === "draft" && item.status !== "DRAFT") return false;
      if (timeFilter === "archived" && item.status !== "ARCHIVED") return false;
      return true;
    });
  }, [data, search, status, competencyId, speakerId, tagFilter, homepageFilter, timeFilter]);

  const handlePublish = (record: AdminMeetRecord) =>
    runCmsAction(
      () => saveMeet.mutateAsync({ ...record, cmsStatus: "PUBLISHED" }),
      messageApi,
      "Meet published",
    );

  const handleDuplicate = (record: AdminMeetRecord) =>
    runCmsAction(
      () => duplicateMeet.mutateAsync(record.id),
      messageApi,
      "Meet duplicated as draft",
    );

  const columns: ColumnsType<AdminMeetRecord> = [
    {
      title: "Banner",
      dataIndex: "thumbnailUrl",
      width: 72,
      render: (url: string | null, record) => (
        <Avatar shape="square" size={48} src={url ?? record.bannerUrl ?? undefined}>
          KM
        </Avatar>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      className: "wrap_text_column kh-cms-title-column",
      width: 240,
      render: (title, record) => (
        <Link href={`/admin/meets/${record.id}/edit`} className="kh-table-link">
          {title}
        </Link>
      ),
    },
    { title: "Speaker", dataIndex: ["speaker", "name"], width: 140, render: (v) => v ?? "—" },
    { title: "Competency", dataIndex: ["competency", "name"], width: 120, render: (v) => v ?? "—" },
    {
      title: "Tags",
      dataIndex: "tags",
      width: 160,
      render: (tags: string[] = []) =>
        tags.length ? tags.slice(0, 3).map((t) => <Tag key={t}>{t}</Tag>) : "—",
    },
    {
      title: "Homepage",
      dataIndex: "homepageTags",
      width: 140,
      render: (tags: string[] = []) =>
        tags.length ? tags.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>) : "—",
    },
    {
      title: "Priority",
      dataIndex: "displayPriority",
      width: 80,
      render: (v: number | undefined) => v ?? 100,
    },
    {
      title: "Published",
      dataIndex: "scheduledAt",
      width: 110,
      render: (v, record) =>
        record.status === "PUBLISHED" ? new Date(v).toLocaleDateString() : "—",
    },
    {
      title: "Recording",
      dataIndex: "recordingUrl",
      width: 100,
      render: (_: string | null, record) =>
        record.recordingUrl || record.hasRecordingUpload ? "Ready" : "Pending",
    },
    { title: "Status", dataIndex: "status", width: 110, render: (v) => <StatusTag status={v} /> },
    createActionColumn<AdminMeetRecord>((record) => [
      { key: "view", label: "View", icon: <EyeOutlined />, href: `/meets/${record.id}` },
      { key: "edit", label: "Edit", icon: <EditOutlined />, href: `/admin/meets/${record.id}/edit` },
      { key: "duplicate", label: "Duplicate", icon: <CopyOutlined />, onClick: () => handleDuplicate(record) },
      {
        key: "publish",
        label: "Publish",
        icon: <CheckCircleOutlined />,
        hidden: record.status === "PUBLISHED",
        onClick: () => handlePublish(record),
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () =>
          runCmsAction(
            () => deleteMeet.mutateAsync(record.id),
            messageApi,
            "Meet deleted",
          ),
      },
    ]),
  ];

  return (
    <div className={embedded ? "kh-cms-embedded" : "kh-cms-page"}>
      {contextHolder}
      {!embedded && (
        <AdminPageHeader
          title="Knowledge Meets"
          description="Publish recorded monthly competency sessions to the learning library."
          actionLabel="+ Add Knowledge Meet"
          actionHref="/admin/meets/new"
        />
      )}

      <div className="kh-cms-filters">
        <Select
          allowClear
          placeholder="Time"
          style={{ width: 140 }}
          onChange={setTimeFilter}
          options={[
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
            { value: "archived", label: "Archived" },
          ]}
        />
        <Select
          allowClear
          placeholder="Status"
          style={{ width: 140 }}
          onChange={setStatus}
          options={["DRAFT", "PUBLISHED", "PENDING", "ARCHIVED"].map((v) => ({ value: v, label: v }))}
        />
        <Select
          allowClear
          placeholder="Competency"
          style={{ width: 180 }}
          onChange={setCompetencyId}
          options={competencies.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          allowClear
          placeholder="Speaker"
          style={{ width: 180 }}
          onChange={setSpeakerId}
          options={speakers.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Select
          allowClear
          placeholder="Tag"
          style={{ width: 160 }}
          onChange={setTagFilter}
          options={[...new Set(data.flatMap((m) => m.tags ?? []))].map((t) => ({
            value: t,
            label: t,
          }))}
        />
        <Select
          allowClear
          placeholder="Homepage section"
          style={{ width: 180 }}
          onChange={setHomepageFilter}
          options={HOMEPAGE_SECTION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
      </div>

      <CmsDataTable
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
        columns={columns}
        scroll={{ x: 1100 }}
        search={{ placeholder: "Search meets", onSearch: setSearch }}
        exportConfig={{
          filename: "knowledge-meets",
          sheetName: "Meets",
          columns: meetExportColumns,
          getRows: () => filtered,
        }}
      />
    </div>
  );
}

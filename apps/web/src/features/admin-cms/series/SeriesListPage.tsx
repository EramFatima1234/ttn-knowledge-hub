"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useAdminSeries, useDeleteSeries, useSaveSeries, useAdminCompetencies } from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import CmsDataTable from "@/features/admin-cms/components/CmsDataTable";
import { createActionColumn } from "@/features/admin-cms/components/createActionColumn";
import StatusTag from "@/features/admin-cms/components/StatusTag";
import type { AdminSeriesRecord } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

const seriesExportColumns = [
  { header: "Title", value: (row: AdminSeriesRecord) => row.title },
  { header: "Instructor", value: (row: AdminSeriesRecord) => row.instructor?.name ?? "" },
  { header: "Competency", value: (row: AdminSeriesRecord) => row.competency?.name ?? "" },
  { header: "Episodes", value: (row: AdminSeriesRecord) => row.episodeCount },
  { header: "Level", value: (row: AdminSeriesRecord) => row.level ?? "" },
  { header: "Views", value: (row: AdminSeriesRecord) => row.viewCount },
  { header: "Status", value: (row: AdminSeriesRecord) => row.status },
];

interface SeriesListPageProps {
  embedded?: boolean;
}

export default function SeriesListPage({ embedded = false }: SeriesListPageProps) {
  const { data = [], isLoading } = useAdminSeries();
  const { data: competencies = [] } = useAdminCompetencies();
  const saveSeries = useSaveSeries();
  const deleteSeries = useDeleteSeries();
  const [messageApi, contextHolder] = message.useMessage();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [competencyId, setCompetencyId] = useState<string | undefined>();

  const filtered = useMemo(
    () =>
      data.filter((item) => {
        if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (status && item.status !== status) return false;
        if (competencyId && item.competency?.id !== competencyId) return false;
        return true;
      }),
    [data, search, status, competencyId],
  );

  const columns: ColumnsType<AdminSeriesRecord> = [
    {
      title: "Cover",
      dataIndex: "thumbnailUrl",
      width: 72,
      render: (url) => (
        <Avatar shape="square" size={48} src={url ?? undefined}>
          S
        </Avatar>
      ),
    },
    {
      title: "Series Title",
      dataIndex: "title",
      className: "wrap_text_column",
      render: (title, record) => (
        <Link href={`/admin/series/${record.id}/edit`} className="kh-table-link">
          {title}
        </Link>
      ),
    },
    { title: "Instructor", dataIndex: ["instructor", "name"], width: 140, render: (v) => v ?? "—" },
    { title: "Competency", dataIndex: ["competency", "name"], width: 140, render: (v) => v ?? "—" },
    { title: "Episodes", dataIndex: "episodeCount", width: 90 },
    { title: "Level", dataIndex: "level", width: 110 },
    { title: "Views", dataIndex: "viewCount", width: 90 },
    { title: "Status", dataIndex: "status", width: 110, render: (v) => <StatusTag status={v} /> },
    createActionColumn<AdminSeriesRecord>((record) => [
      { key: "view", label: "View", icon: <EyeOutlined />, href: `/series/${record.id}` },
      { key: "edit", label: "Edit", icon: <EditOutlined />, href: `/admin/series/${record.id}/edit` },
      {
        key: "episodes",
        label: "Manage Episodes",
        icon: <UnorderedListOutlined />,
        href: `/admin/series/${record.id}/episodes`,
      },
      {
        key: "publish",
        label: "Publish",
        icon: <CheckCircleOutlined />,
        hidden: record.status === "PUBLISHED",
        onClick: () =>
          runCmsAction(
            () => saveSeries.mutateAsync({ ...record, cmsStatus: "PUBLISHED" }),
            messageApi,
            "Series published",
          ),
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () =>
          runCmsAction(
            () => deleteSeries.mutateAsync(record.id),
            messageApi,
            "Series deleted",
          ),
      },
    ]),
  ];

  return (
    <div className={embedded ? "kh-cms-embedded" : "kh-cms-page"}>
      {contextHolder}
      {!embedded && (
        <AdminPageHeader
          title="Knowledge Series"
          description="Add and manage multi-episode learning series."
          actionLabel="+ Add Knowledge Series"
          actionHref="/admin/series/new"
        />
      )}

      <div className="kh-cms-filters">
        <Select
          allowClear
          placeholder="Status"
          style={{ width: 140 }}
          onChange={setStatus}
          options={["DRAFT", "PUBLISHED", "ARCHIVED"].map((v) => ({ value: v, label: v }))}
        />
        <Select
          allowClear
          placeholder="Competency"
          style={{ width: 180 }}
          onChange={setCompetencyId}
          options={competencies.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>

      <CmsDataTable
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
        columns={columns}
        scroll={{ x: 1000 }}
        search={{ placeholder: "Search series", onSearch: setSearch }}
        exportConfig={{
          filename: "knowledge-series",
          sheetName: "Series",
          columns: seriesExportColumns,
          getRows: () => filtered,
        }}
      />
    </div>
  );
}

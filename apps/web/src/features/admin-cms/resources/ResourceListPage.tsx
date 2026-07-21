"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  useAdminCompetencies,
  useAdminResources,
  useDeleteResource,
  useSaveResource,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import CmsDataTable from "@/features/admin-cms/components/CmsDataTable";
import { createActionColumn } from "@/features/admin-cms/components/createActionColumn";
import StatusTag from "@/features/admin-cms/components/StatusTag";
import type { AdminResourceRecord } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

const resourceExportColumns = [
  { header: "Title", value: (row: AdminResourceRecord) => row.title },
  { header: "Competency", value: (row: AdminResourceRecord) => row.competency?.name ?? "" },
  { header: "Type", value: (row: AdminResourceRecord) => row.resourceType },
  { header: "Downloads", value: (row: AdminResourceRecord) => row.downloadCount },
  { header: "Status", value: (row: AdminResourceRecord) => row.status },
];

interface ResourceListPageProps {
  embedded?: boolean;
}

export default function ResourceListPage({ embedded = false }: ResourceListPageProps) {
  const { data = [], isLoading } = useAdminResources();
  const { data: competencies = [] } = useAdminCompetencies();
  const saveResource = useSaveResource();
  const deleteResource = useDeleteResource();
  const [messageApi, contextHolder] = message.useMessage();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [resourceType, setResourceType] = useState<string | undefined>();
  const [competencyId, setCompetencyId] = useState<string | undefined>();

  const filtered = useMemo(
    () =>
      data.filter((item) => {
        if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (status && item.status !== status) return false;
        if (resourceType && item.resourceType !== resourceType) return false;
        if (competencyId && item.competency?.id !== competencyId) return false;
        return true;
      }),
    [data, search, status, resourceType, competencyId],
  );

  const columns: ColumnsType<AdminResourceRecord> = [
    {
      title: "Thumbnail",
      dataIndex: "thumbnailUrl",
      width: 72,
      render: (url) => (
        <Avatar shape="square" size={48} src={url ?? undefined}>
          R
        </Avatar>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      className: "wrap_text_column",
      render: (title, record) => (
        <Link href={`/admin/resources/${record.id}/edit`} className="kh-table-link">
          {title}
        </Link>
      ),
    },
    { title: "Competency", dataIndex: ["competency", "name"], width: 140, render: (v) => v ?? "—" },
    { title: "Type", dataIndex: "resourceType", width: 120 },
    { title: "Downloads", dataIndex: "downloadCount", width: 100 },
    { title: "Status", dataIndex: "status", width: 110, render: (v) => <StatusTag status={v} /> },
    createActionColumn<AdminResourceRecord>((record) => [
      { key: "edit", label: "Edit", icon: <EditOutlined />, href: `/admin/resources/${record.id}/edit` },
      {
        key: "publish",
        label: "Publish",
        icon: <CheckCircleOutlined />,
        hidden: record.status === "PUBLISHED",
        onClick: () =>
          runCmsAction(
            () => saveResource.mutateAsync({ ...record, cmsStatus: "PUBLISHED" }),
            messageApi,
            "Resource published",
          ),
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () =>
          runCmsAction(
            () => deleteResource.mutateAsync(record.id),
            messageApi,
            "Resource deleted",
          ),
      },
    ]),
  ];

  return (
    <div className={embedded ? "kh-cms-embedded" : "kh-cms-page"}>
      {contextHolder}
      {!embedded && (
        <AdminPageHeader
          title="Learning Resources"
          description="Manage PDFs, slides, GitHub repos, documentation, and external links."
          actionLabel="+ Upload Resource"
          actionHref="/admin/resources/new"
        />
      )}

      <div className="kh-cms-filters">
        <Select
          allowClear
          placeholder="Type"
          style={{ width: 160 }}
          onChange={setResourceType}
          options={["PDF", "SLIDES", "GITHUB", "ZIP", "EXTERNAL", "DOCUMENTATION"].map((v) => ({ value: v, label: v }))}
        />
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
        scroll={{ x: 900 }}
        search={{ placeholder: "Search resources", onSearch: setSearch }}
        exportConfig={{
          filename: "learning-resources",
          sheetName: "Resources",
          columns: resourceExportColumns,
          getRows: () => filtered,
        }}
      />
    </div>
  );
}

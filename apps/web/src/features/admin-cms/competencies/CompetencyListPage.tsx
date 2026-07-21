"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useAdminCompetencies, useDeleteCompetency } from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import CmsDataTable from "@/features/admin-cms/components/CmsDataTable";
import { createActionColumn } from "@/features/admin-cms/components/createActionColumn";
import type { AdminCompetencyRecord } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

const competencyExportColumns = [
  { header: "Name", value: (row: AdminCompetencyRecord) => row.name },
  { header: "Sessions", value: (row: AdminCompetencyRecord) => row.sessionCount },
  { header: "Series", value: (row: AdminCompetencyRecord) => row.seriesCount },
];

interface CompetencyListPageProps {
  embedded?: boolean;
}

export default function CompetencyListPage({ embedded = false }: CompetencyListPageProps) {
  const { data = [], isLoading } = useAdminCompetencies();
  const deleteCompetency = useDeleteCompetency();
  const [messageApi, contextHolder] = message.useMessage();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => data.filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase())),
    [data, search],
  );

  const columns: ColumnsType<AdminCompetencyRecord> = [
    { title: "Icon", dataIndex: "icon", width: 72, render: (v) => v ?? "📚" },
    {
      title: "Name",
      dataIndex: "name",
      className: "wrap_text_column",
      render: (name, record) => (
        <Link href={`/admin/competencies/${record.id}/edit`} className="kh-table-link">
          {name}
        </Link>
      ),
    },
    { title: "Sessions", dataIndex: "sessionCount", width: 90 },
    { title: "Series", dataIndex: "seriesCount", width: 90 },
    createActionColumn<AdminCompetencyRecord>((record) => [
      { key: "view", label: "View Page", icon: <EyeOutlined />, href: `/competencies/${record.slug}` },
      { key: "edit", label: "Edit", icon: <EditOutlined />, href: `/admin/competencies/${record.id}/edit` },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () =>
          runCmsAction(
            () => deleteCompetency.mutateAsync(record.id),
            messageApi,
            "Competency deleted",
          ),
      },
    ]),
  ];

  return (
    <div className={embedded ? "kh-cms-embedded" : "kh-cms-page"}>
      {contextHolder}
      {!embedded && (
        <AdminPageHeader
          title="Competencies"
          description="Manage the engineering skills taxonomy."
          actionLabel="+ Add Competency"
          actionHref="/admin/competencies/new"
        />
      )}

      <CmsDataTable
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
        columns={columns}
        scroll={{ x: 700 }}
        search={{ placeholder: "Search competencies", onSearch: setSearch }}
        exportConfig={{
          filename: "competencies",
          sheetName: "Competencies",
          columns: competencyExportColumns,
          getRows: () => filtered,
        }}
      />
    </div>
  );
}

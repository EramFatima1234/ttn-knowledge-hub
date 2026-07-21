"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useAdminSpeakers, useDeleteSpeaker } from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import CmsDataTable from "@/features/admin-cms/components/CmsDataTable";
import { createActionColumn } from "@/features/admin-cms/components/createActionColumn";
import type { AdminSpeakerRecord } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

const speakerExportColumns = [
  { header: "Name", value: (row: AdminSpeakerRecord) => row.name },
  { header: "Designation", value: (row: AdminSpeakerRecord) => row.designation ?? "" },
  { header: "Competency", value: (row: AdminSpeakerRecord) => row.competency?.name ?? "" },
  { header: "Sessions", value: (row: AdminSpeakerRecord) => row.sessionCount },
];

interface SpeakerListPageProps {
  embedded?: boolean;
}

export default function SpeakerListPage({ embedded = false }: SpeakerListPageProps) {
  const { data = [], isLoading } = useAdminSpeakers();
  const deleteSpeaker = useDeleteSpeaker();
  const [messageApi, contextHolder] = message.useMessage();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => data.filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase())),
    [data, search],
  );

  const columns: ColumnsType<AdminSpeakerRecord> = [
    {
      title: "Photo",
      dataIndex: "avatarUrl",
      width: 72,
      render: (url, record) => (
        <Avatar size={48} src={url ?? undefined}>
          {record.name[0]}
        </Avatar>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      className: "wrap_text_column",
      render: (name, record) => (
        <Link href={`/admin/speakers/${record.id}/edit`} className="kh-table-link">
          {name}
        </Link>
      ),
    },
    { title: "Designation", dataIndex: "designation", width: 160, render: (v) => v ?? "—" },
    {
      title: "Competency",
      dataIndex: "competency",
      width: 160,
      render: (competency) => competency?.name ?? "—",
    },
    { title: "Sessions", dataIndex: "sessionCount", width: 90 },
    createActionColumn<AdminSpeakerRecord>((record) => [
      { key: "view", label: "View Profile", icon: <EyeOutlined />, href: `/speakers/${record.slug}` },
      { key: "edit", label: "Edit", icon: <EditOutlined />, href: `/admin/speakers/${record.id}/edit` },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () =>
          runCmsAction(
            () => deleteSpeaker.mutateAsync(record.id),
            messageApi,
            "Speaker deleted",
          ),
      },
    ]),
  ];

  return (
    <div className={embedded ? "kh-cms-embedded" : "kh-cms-page"}>
      {contextHolder}
      {!embedded && (
        <AdminPageHeader
          title="Speakers"
          description="Manage internal experts and session presenters."
          actionLabel="+ Add Speaker"
          actionHref="/admin/speakers/new"
        />
      )}

      <CmsDataTable
        rowKey="id"
        loading={isLoading}
        dataSource={filtered}
        columns={columns}
        scroll={{ x: 900 }}
        search={{ placeholder: "Search speakers", onSearch: setSearch }}
        exportConfig={{
          filename: "speakers",
          sheetName: "Speakers",
          columns: speakerExportColumns,
          getRows: () => filtered,
        }}
      />
    </div>
  );
}

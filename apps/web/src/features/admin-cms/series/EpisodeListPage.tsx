"use client";

import { useMemo, useState } from "react";
import { message, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  useAdminEpisodes,
  useAdminSeriesItem,
  useDeleteEpisode,
  useReorderEpisodes,
  useSaveEpisode,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import CmsDataTable from "@/features/admin-cms/components/CmsDataTable";
import { createActionColumn } from "@/features/admin-cms/components/createActionColumn";
import StatusTag from "@/features/admin-cms/components/StatusTag";
import type { AdminEpisodeRecord } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

const episodeExportColumns = [
  { header: "Order", value: (row: AdminEpisodeRecord) => row.orderIndex },
  { header: "Title", value: (row: AdminEpisodeRecord) => row.title },
  { header: "Duration (min)", value: (row: AdminEpisodeRecord) => row.durationMinutes ?? "" },
  { header: "Status", value: (row: AdminEpisodeRecord) => row.status },
];

interface EpisodeListPageProps {
  seriesId: string;
}

export default function EpisodeListPage({ seriesId }: EpisodeListPageProps) {
  const { data: series } = useAdminSeriesItem(seriesId);
  const { data: episodes = [], isLoading } = useAdminEpisodes(seriesId);
  const deleteEpisode = useDeleteEpisode();
  const reorderEpisodes = useReorderEpisodes();
  const saveEpisode = useSaveEpisode();
  const [messageApi, contextHolder] = message.useMessage();
  const [search, setSearch] = useState("");

  const filteredEpisodes = useMemo(
    () =>
      episodes.filter(
        (episode) =>
          !search || episode.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [episodes, search],
  );

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= episodes.length) return;
    const ordered = [...episodes];
    const [item] = ordered.splice(index, 1);
    ordered.splice(target, 0, item);
    void runCmsAction(
      () => reorderEpisodes.mutateAsync({ seriesId, orderedIds: ordered.map((e) => e.id) }),
      messageApi,
      "Episode order updated",
    );
  };

  const columns: ColumnsType<AdminEpisodeRecord> = [
    { title: "#", dataIndex: "orderIndex", width: 60, align: "center" },
    { title: "Title", dataIndex: "title", className: "wrap_text_column" },
    {
      title: "Video",
      dataIndex: "hasVideo",
      width: 100,
      render: (hasVideo: boolean) =>
        hasVideo ? <Tag color="green">Uploaded</Tag> : <Tag color="default">Empty</Tag>,
    },
    { title: "Duration", dataIndex: "durationMinutes", width: 110, render: (v) => (v ? `${v} min` : "—") },
    { title: "Status", dataIndex: "status", width: 110, render: (v) => <StatusTag status={v} /> },
    createActionColumn<AdminEpisodeRecord>((record, index) => [
      {
        key: "edit",
        label: "Edit",
        icon: <EditOutlined />,
        href: `/admin/series/${seriesId}/episodes/${record.id}/edit`,
      },
      {
        key: "up",
        label: "Move Up",
        icon: <ArrowUpOutlined />,
        hidden: index === 0,
        onClick: () => move(index, -1),
      },
      {
        key: "down",
        label: "Move Down",
        icon: <ArrowDownOutlined />,
        hidden: index === episodes.length - 1,
        onClick: () => move(index, 1),
      },
      {
        key: "publish",
        label: "Publish",
        icon: <CheckCircleOutlined />,
        hidden: record.status === "PUBLISHED",
        onClick: () =>
          runCmsAction(
            () => saveEpisode.mutateAsync({ ...record, cmsStatus: "PUBLISHED" }),
            messageApi,
            "Episode published",
          ),
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () =>
          runCmsAction(
            () => deleteEpisode.mutateAsync({ seriesId, episodeId: record.id }),
            messageApi,
            "Episode deleted",
          ),
      },
    ]),
  ];

  return (
    <div className="kh-cms-page">
      {contextHolder}
      <AdminPageHeader
        backHref="/admin/content?tab=series"
        backLabel="Back to Content"
        title={`Episodes — ${series?.title ?? "Series"}`}
        description="Manage episode slots. Contributors upload videos to assigned episode numbers via Team → Series Upload."
        actionLabel="+ Add Episode"
        actionHref={`/admin/series/${seriesId}/episodes/new`}
      />

      <CmsDataTable
        rowKey="id"
        loading={isLoading}
        dataSource={filteredEpisodes}
        columns={columns}
        search={{ placeholder: "Search episodes", onSearch: setSearch }}
        exportConfig={{
          filename: `episodes-${series?.title ?? seriesId}`,
          sheetName: "Episodes",
          columns: episodeExportColumns,
          getRows: () => filteredEpisodes,
        }}
      />
    </div>
  );
}

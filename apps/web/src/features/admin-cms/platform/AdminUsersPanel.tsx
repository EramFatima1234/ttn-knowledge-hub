"use client";

import { useMemo, useState } from "react";
import { Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { RoleName } from "@knowledgehub/types";
import { useAdminUsers, useAssignRole } from "@/hooks/useAdmin";
import CmsDataTable from "@/features/admin-cms/components/CmsDataTable";
import { runCmsAction } from "@/lib/cms-actions";

import AspireTableActions from "@/features/admin-cms/components/AspireTableActions";

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roles: string[];
}

const userExportColumns = [
  { header: "Name", value: (row: AdminUserRow) => row.name },
  { header: "Email", value: (row: AdminUserRow) => row.email },
  { header: "Roles", value: (row: AdminUserRow) => row.roles.join(", ") },
];

export default function AdminUsersPanel() {
  const { data, isLoading } = useAdminUsers();
  const assignRole = useAssignRole();
  const [messageApi, contextHolder] = message.useMessage();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const items = data ?? [];
    if (!search) return items;
    const query = search.toLowerCase();
    return items.filter(
      (user) =>
        user.name.toLowerCase().includes(query)
        || user.email.toLowerCase().includes(query),
    );
  }, [data, search]);

  const handleAssign = (userId: string, role: RoleName) =>
    runCmsAction(
      () => assignRole.mutateAsync({ userId, role }),
      messageApi,
      `Assigned ${role} role`,
    );

  const columns: ColumnsType<AdminUserRow> = [
    { title: "Name", dataIndex: "name", className: "wrap_text_column" },
    { title: "Email", dataIndex: "email", className: "email_column" },
    {
      title: "Roles",
      dataIndex: "roles",
      width: 180,
      render: (roles: string[]) => roles.map((r) => <Tag key={r}>{r}</Tag>),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <AspireTableActions
          items={[
            {
              key: "assign-admin",
              label: "Make Admin",
              hidden: record.roles.includes(RoleName.ADMIN),
              onClick: () => handleAssign(record.id, RoleName.ADMIN),
            },
            {
              key: "assign-team",
              label: "Make Team",
              hidden: record.roles.includes(RoleName.TEAM),
              onClick: () => handleAssign(record.id, RoleName.TEAM),
            },
            {
              key: "assign-user",
              label: "Make User",
              hidden: record.roles.includes(RoleName.USER),
              onClick: () => handleAssign(record.id, RoleName.USER),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <CmsDataTable
        rowKey="id"
        loading={isLoading}
        dataSource={filteredUsers}
        columns={columns}
        scroll={{ x: 800 }}
        search={{ placeholder: "Search users", onSearch: setSearch }}
        exportConfig={{
          filename: "admin-users",
          sheetName: "Users",
          columns: userExportColumns,
          getRows: () => filteredUsers,
        }}
      />
    </>
  );
}

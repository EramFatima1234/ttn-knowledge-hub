"use client";

import AdminTabShell from "@/features/admin-cms/components/AdminTabShell";
import AdminUsersPanel from "@/features/admin-cms/platform/AdminUsersPanel";
import ApprovalCenter from "@/features/phase8/approval-center/ApprovalCenter";

const tabs = [
  {
    key: "users",
    label: "Users",
    children: <AdminUsersPanel />,
  },
  {
    key: "approvals",
    label: "Approvals",
    children: <ApprovalCenter embedded />,
  },
];

export default function PlatformHubPage() {
  return (
    <AdminTabShell
      basePath="/admin/platform"
      defaultTab="users"
      title="Platform"
      description="Manage user roles and review pending content approvals."
      tabs={tabs}
    />
  );
}

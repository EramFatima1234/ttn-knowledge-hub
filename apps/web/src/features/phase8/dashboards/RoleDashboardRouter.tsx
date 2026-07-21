"use client";

import { Spin } from "antd";
import { useAuthStore } from "@/store/useAuthStore";
import HomeDashboard from "./HomeDashboard";

export default function RoleDashboardRouter() {
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  return <HomeDashboard />;
}

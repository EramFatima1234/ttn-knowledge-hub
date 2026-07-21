import { Suspense } from "react";
import { Spin } from "antd";
import PlatformHubPage from "@/features/admin-cms/platform/PlatformHubPage";

export default function AdminPlatformPage() {
  return (
    <Suspense
      fallback={
        <div className="kh-auth-loading">
          <Spin size="large" />
        </div>
      }
    >
      <PlatformHubPage />
    </Suspense>
  );
}

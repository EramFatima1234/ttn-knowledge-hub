import { Suspense } from "react";
import { Spin } from "antd";
import ContentHubPage from "@/features/admin-cms/content/ContentHubPage";

export default function AdminContentPage() {
  return (
    <Suspense
      fallback={
        <div className="kh-auth-loading">
          <Spin size="large" />
        </div>
      }
    >
      <ContentHubPage />
    </Suspense>
  );
}

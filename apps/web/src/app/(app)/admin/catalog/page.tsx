import { Suspense } from "react";
import { Spin } from "antd";
import CatalogHubPage from "@/features/admin-cms/catalog/CatalogHubPage";

export default function AdminCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="kh-auth-loading">
          <Spin size="large" />
        </div>
      }
    >
      <CatalogHubPage />
    </Suspense>
  );
}

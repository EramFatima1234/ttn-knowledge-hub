"use client";

import { Suspense } from "react";
import { Skeleton } from "antd";
import ExplorePageContent from "@/features/explore/ExplorePageContent";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={(
        <div className="kh-explore">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      )}
    >
      <ExplorePageContent />
    </Suspense>
  );
}

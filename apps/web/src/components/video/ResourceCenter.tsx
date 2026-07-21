"use client";

import { Card, List, Tag } from "antd";
import { useVideoResources } from "@/hooks/usePhase7Features";

const KIND_LABELS: Record<string, string> = {
  GITHUB_REPO: "GitHub",
  SLIDES: "Slides",
  PDF: "PDF",
  DEMO: "Demo",
  DOCUMENTATION: "Docs",
  LINK: "Link",
  OTHER: "Resource",
};

export default function ResourceCenter({ videoId }: { videoId: string }) {
  const { data: resources = [], isLoading } = useVideoResources(videoId);

  return (
    <section className="kh-resources">
      <h2>Resource Center</h2>
      <List
        loading={isLoading}
        dataSource={resources}
        locale={{ emptyText: "No resources attached to this session." }}
        renderItem={(item) => (
          <Card size="small" className="kh-resources__card">
            <div className="kh-resources__row">
              <Tag>{KIND_LABELS[item.resourceKind ?? "OTHER"] ?? "Resource"}</Tag>
              <strong>{item.label ?? item.fileName}</strong>
            </div>
            <a href={item.downloadUrl} target="_blank" rel="noreferrer">
              Download / Open
            </a>
          </Card>
        )}
      />
    </section>
  );
}

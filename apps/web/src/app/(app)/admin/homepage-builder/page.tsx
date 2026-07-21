"use client";

import { useEffect, useState } from "react";
import { Switch, Spin, message } from "antd";
import AspireButton from "@/components/ui/AspireButton";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  type HomepageSectionConfig,
} from "@/lib/mock/phase8";
import {
  useAdminHomepageLayout,
  useSaveHomepageLayout,
} from "@/hooks/useAdminCms";

export default function HomepageBuilderPage() {
  const { data: layout, isLoading } = useAdminHomepageLayout();
  const saveLayout = useSaveHomepageLayout();
  const [sections, setSections] = useState<HomepageSectionConfig[]>(
    DEFAULT_HOMEPAGE_SECTIONS,
  );
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (layout?.length) {
      setSections(layout);
    }
  }, [layout]);

  const move = (index: number, direction: -1 | 1) => {
    const next = [...sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    // Bounds already verified above — non-null assertions are safe here
    const temp = next[index]!;
    next[index] = next[target]!;
    next[target] = temp;
    setSections(next.map((s, i) => ({ ...s, order: i })));
  };

  const toggle = (id: string, visible: boolean) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible } : s)),
    );
  };

  const handleSave = async () => {
    await saveLayout.mutateAsync(sections);
    messageApi.success("Homepage layout saved");
  };

  if (isLoading) {
    return (
      <div className="kh-auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="kh-p8-page">
      {contextHolder}
      <div className="page_header">
        <div>
          <h1 className="inner_heading pink-border">Homepage Builder</h1>
          <p>Reorder sections, toggle visibility, and curate the learner homepage.</p>
        </div>
        <AspireButton onClick={handleSave} loading={saveLayout.isPending}>
          Save Layout
        </AspireButton>
      </div>

      <div className="kh-p8-builder">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section, index) => (
            <div key={section.id} className="kh-p8-builder__row">
              <div>
                <strong>{section.title}</strong>
                <small>Section ID: {section.id}</small>
              </div>
              <div className="kh-p8-builder__actions">
                <Switch
                  checked={section.visible}
                  onChange={(checked) => toggle(section.id, checked)}
                />
                <AspireButton
                  aspireVariant="secondary"
                  size="small"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </AspireButton>
                <AspireButton
                  aspireVariant="secondary"
                  size="small"
                  disabled={index === sections.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </AspireButton>
              </div>
            </div>
          ))}
      </div>

      <p className="kh-p8-builder__note">
        Hero banner, featured sessions, and pinned series are configured here.
        Layout is saved to the platform database and applied to all learners.
      </p>
    </div>
  );
}

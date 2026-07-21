"use client";

import dynamic from "next/dynamic";
import { Button, Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useRightPanelStore } from "@/store/useRightPanelStore";

const RightSidebar = dynamic(
  () => import("@/components/right-sidebar/RightSidebar"),
  {
    loading: () => (
      <div className="kh-rs-loading">
        <Spin size="small" />
      </div>
    ),
  },
);

export default function AppRightPanel() {
  const open = useRightPanelStore((s) => s.open);
  const setOpen = useRightPanelStore((s) => s.setOpen);

  if (!open) return null;

  return (
    <div className="right_panel-overlay" role="presentation">
      <button
        type="button"
        className="right_panel-backdrop"
        aria-label="Close sidebar"
        onClick={() => setOpen(false)}
      />
      <aside className="right_panel right_panel--drawer" aria-label="Quick insights">
        <div className="right_panel__header">
          <span className="right_panel__title">Quick insights</span>
          <Button
            type="text"
            className="right_panel__close"
            icon={<CloseOutlined />}
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
          />
        </div>
        <div className="right_panel__body">
          <RightSidebar />
        </div>
      </aside>
    </div>
  );
}

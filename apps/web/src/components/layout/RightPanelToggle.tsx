"use client";

import { Button, Tooltip } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useRightPanelStore } from "@/store/useRightPanelStore";

export default function RightPanelToggle() {
  const open = useRightPanelStore((s) => s.open);
  const toggle = useRightPanelStore((s) => s.toggle);

  return (
    <Tooltip title={open ? "Hide sidebar" : "Show sidebar"}>
      <Button
        type="text"
        className={`header-right-panel-toggle${open ? " header-right-panel-toggle--active" : ""}`}
        icon={<MenuOutlined />}
        aria-label={open ? "Hide right sidebar" : "Show right sidebar"}
        aria-pressed={open}
        onClick={toggle}
      />
    </Tooltip>
  );
}

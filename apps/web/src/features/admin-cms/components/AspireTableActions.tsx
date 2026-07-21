"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, Dropdown, Modal } from "antd";
import type { MenuProps } from "antd";

export interface TableActionItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void | Promise<void | boolean>;
  href?: string;
  danger?: boolean;
  hidden?: boolean;
  confirmTitle?: string;
  confirmContent?: string;
}

interface AspireTableActionsProps {
  items: TableActionItem[];
}

export default function AspireTableActions({ items }: AspireTableActionsProps) {
  const router = useRouter();
  const visible = items.filter((item) => !item.hidden);

  if (visible.length === 0) return <span className="kh-table-action__empty">—</span>;

  const runAction = (item: TableActionItem) => {
    if (item.href) {
      router.push(item.href);
      return;
    }

    if (!item.onClick) return;

    if (item.danger) {
      Modal.confirm({
        title: item.confirmTitle ?? `Delete ${item.label.toLowerCase()}?`,
        content: item.confirmContent ?? "This action cannot be undone.",
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: () => item.onClick?.(),
      });
      return;
    }

    void item.onClick();
  };

  const menuItems: MenuProps["items"] = visible.map((item) => ({
    key: item.key,
    label: <span className="kh-table-action__label">{item.label}</span>,
    icon: item.icon,
    danger: item.danger,
    onClick: ({ domEvent }) => {
      domEvent.stopPropagation();
      runAction(item);
    },
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="text"
        className="actionsThreeDots"
        onClick={(event) => event.stopPropagation()}
        aria-label="Row actions"
      >
        <div className="more_icon_dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </Button>
    </Dropdown>
  );
}

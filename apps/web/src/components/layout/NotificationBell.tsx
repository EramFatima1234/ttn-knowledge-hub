"use client";

import { useState } from "react";
import { Badge, Button, Dropdown, Empty, Spin, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import Link from "next/link";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { NotificationItem } from "@knowledgehub/types";

function getNotificationHref(item: NotificationItem): string | null {
  const videoId = item.payload?.videoId;
  if (typeof videoId === "string") return `/watch/${videoId}`;
  const meetId = item.payload?.meetId;
  if (typeof meetId === "string") return `/meets/${meetId}`;
  return null;
}

export default function NotificationBell() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: countData } = useUnreadNotificationCount();
  const { data: notifications = [], isLoading } = useNotifications(false, {
    enabled: dropdownOpen,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { subscribe, loading: pushLoading } = usePushNotifications();
  const [messageApi, contextHolder] = message.useMessage();

  const unreadCount = countData?.count ?? 0;

  const dropdownContent = (
    <div className="kh-notifications">
      {contextHolder}
      <div className="kh-notifications__header">
        <strong>Notifications</strong>
        <div className="kh-notifications__actions">
          <Button
            type="link"
            size="small"
            loading={pushLoading}
            onClick={async () => {
              try {
                await subscribe();
                messageApi.success("Browser push enabled");
              } catch (error) {
                messageApi.error(
                  error instanceof Error
                    ? error.message
                    : "Could not enable push notifications",
                );
              }
            }}
          >
            Enable push
          </Button>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => markAllRead.mutate()}
              loading={markAllRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="kh-notifications__loading">
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications" />
      ) : (
        <ul className="kh-notifications__list">
          {notifications.slice(0, 8).map((item) => {
            const href = getNotificationHref(item);
            const content = (
              <button
                type="button"
                className={`kh-notifications__item${item.readAt ? "" : " kh-notifications__item--unread"}`}
                onClick={() => {
                  if (!item.readAt) markRead.mutate(item.id);
                }}
              >
                <strong>{item.title}</strong>
                {item.body && <span>{item.body}</span>}
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </button>
            );

            return (
              <li key={item.id}>
                {href ? <Link href={href}>{content}</Link> : content}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
      onOpenChange={setDropdownOpen}
    >
      <button type="button" className="header-bell" aria-label="Notifications">
        <Badge count={unreadCount} size="small">
          <BellOutlined style={{ fontSize: 18 }} />
        </Badge>
      </button>
    </Dropdown>
  );
}

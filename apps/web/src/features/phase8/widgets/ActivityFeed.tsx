"use client";

import WidgetShell from "./WidgetShell";

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  time: string;
}

interface ActivityFeedProps {
  title?: string;
  items: ActivityItem[];
  emptyText?: string;
  delay?: number;
}

export default function ActivityFeed({
  title = "Recent Activity",
  items,
  emptyText = "No recent activity",
  delay = 0,
}: ActivityFeedProps) {
  return (
    <WidgetShell title={title} delay={delay} className="kh-p8-activity">
      {items.length === 0 ? (
        <p className="kh-p8-empty">{emptyText}</p>
      ) : (
        <ul className="kh-p8-activity__list">
          {items.map((item) => (
            <li key={item.id} className="kh-p8-activity__item">
              <strong>{item.title}</strong>
              {item.description && <p>{item.description}</p>}
              <small>{item.time}</small>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

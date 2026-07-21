import { PaginationMeta } from './content';

export enum NotificationType {
  APPROVAL_APPROVED = 'APPROVAL_APPROVED',
  APPROVAL_REJECTED = 'APPROVAL_REJECTED',
  NEW_CONTENT = 'NEW_CONTENT',
  MEET_REMINDER = 'MEET_REMINDER',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export interface NotificationItem {
  id: string;
  type: NotificationType | string;
  title: string;
  body: string | null;
  payload: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  meta: PaginationMeta;
}

export interface UnreadCountResponse {
  count: number;
}

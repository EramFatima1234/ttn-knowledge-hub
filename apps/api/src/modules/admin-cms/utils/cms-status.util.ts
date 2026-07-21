import { ContentStatus, MeetStatus, Visibility } from '@prisma/client';

export type CmsPublishStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING';

export function meetToCmsStatus(meet: {
  status: MeetStatus;
  visibility: Visibility;
  deletedAt: Date | null;
}): CmsPublishStatus {
  if (meet.deletedAt) return 'ARCHIVED';
  if (meet.status === MeetStatus.CANCELLED) return 'ARCHIVED';
  if (meet.visibility === Visibility.RESTRICTED) return 'DRAFT';
  if (meet.status === MeetStatus.COMPLETED) return 'PUBLISHED';
  return 'PUBLISHED';
}

export function cmsStatusToMeetFields(status: CmsPublishStatus): {
  meetStatus: MeetStatus;
  visibility: Visibility;
  softDelete: boolean;
} {
  switch (status) {
    case 'DRAFT':
      return {
        meetStatus: MeetStatus.UPCOMING,
        visibility: Visibility.RESTRICTED,
        softDelete: false,
      };
    case 'ARCHIVED':
      return {
        meetStatus: MeetStatus.CANCELLED,
        visibility: Visibility.INTERNAL,
        softDelete: true,
      };
    case 'PENDING':
      return {
        meetStatus: MeetStatus.UPCOMING,
        visibility: Visibility.RESTRICTED,
        softDelete: false,
      };
    case 'PUBLISHED':
    default:
      return {
        meetStatus: MeetStatus.COMPLETED,
        visibility: Visibility.INTERNAL,
        softDelete: false,
      };
  }
}

export function seriesToCmsStatus(status: ContentStatus): CmsPublishStatus {
  if (status === ContentStatus.DRAFT) return 'DRAFT';
  if (status === ContentStatus.ARCHIVED) return 'ARCHIVED';
  if (status === ContentStatus.PENDING_APPROVAL) return 'PENDING';
  return 'PUBLISHED';
}

export function cmsStatusToContentStatus(status: CmsPublishStatus): ContentStatus {
  switch (status) {
    case 'DRAFT':
      return ContentStatus.DRAFT;
    case 'ARCHIVED':
      return ContentStatus.ARCHIVED;
    case 'PENDING':
      return ContentStatus.PENDING_APPROVAL;
    case 'PUBLISHED':
    default:
      return ContentStatus.PUBLISHED;
  }
}

# ADR-006 — Why URL-Based Media

**Status:** Accepted  
**Date:** 2026-07  
**Scope:** CMS + playback

## Problem

Much learning content is hosted on YouTube, Vimeo, or corporate CDNs. Requiring file upload for every meet/series episode blocks CMS adoption and duplicates storage costs.

## Decision

Support **external media URLs** and rich metadata on meets and series:

- Fields: `recordingUrl`, `videoUrl`, `thumbnailUrl`, `bannerUrl`, preview helpers in CMS (`CmsUrlField`, `MediaUrlPreview`).
- Optional link to internal `Video` for streaming (`KnowledgeMeet.videoId`, `SeriesSession.videoId`).
- `VideoPlayer` handles embed vs direct stream (`apps/web/src/components/video/VideoPlayer.tsx`); API streaming via `GET /videos/:id/stream` with Range when using stored files.

Migration family: `20260720143000_cms_url_metadata` (and related).

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Upload-only CMS | Too heavy for recorded meets sourced from existing URLs |
| iframe-only player | Insufficient for resume/progress on self-hosted files |

## Tradeoffs

- **Pros:** Faster content onboarding; `HomepageFeedService` can rank by `homepageTags` / `displayPriority`.
- **Cons:** Mixed playback paths (embed vs stream) increase test matrix; broken external URLs are a content ops issue.

## Future impact

- Keep storage adapter (`STORAGE_PROVIDER` LOCAL/S3) for team uploads and attachments.
- Validate URLs in DTOs; do not log signed URLs.

## Traceability

| Layer | Location |
|-------|----------|
| API CMS | `apps/api/src/modules/admin-cms/` |
| Web CMS | `apps/web/src/features/admin-cms/components/CmsUrlField.tsx` |
| Docs | `architecture/media-management-flow.md`, `architecture/content-management-flow.md` |

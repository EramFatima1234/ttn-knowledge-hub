# Data Model — KnowledgeHub

**Source of truth:** `apps/api/prisma/schema.prisma`  
**Migrations:** `apps/api/prisma/migrations/` (indexed in `database/schema-or-migrations/README.md`)

## User

| Field / concept | Purpose |
|-----------------|--------|
| `email`, `googleId` | Identity from Google OAuth |
| `status` | `ACTIVE` / `INACTIVE` / `SUSPENDED` |
| Relations | `roles`, `refreshTokens`, engagement rows |

**Indexes:** `email`, `status`

## Knowledge Meet (`KnowledgeMeet`)

Recorded session metadata: `title`, `recordingUrl`, `videoId`, `speakerId`, `competencyId`, `homepageTags`, `displayPriority`, `MeetStatus`.

**Indexes:** `scheduledAt`, `status`

## Knowledge Series (`KnowledgeSeries`)

Series container: `title`, `status` (`ContentStatus`), `competencyId`, `homepageTags`, `sessions` → `SeriesSession`.

## Episode (`SeriesSession`)

`seriesId`, `orderIndex`, optional `videoId`, `title`. Unique `(seriesId, orderIndex)`.

## Speaker (`Speaker`)

`name`, `slug`, `competencyId`, `avatarUrl`, `bio`. Linked to videos and meets.

## Competency (`Competency`)

`name`, `slug`, `icon`, `sortOrder`. Classifies content and speakers.

## Resource

- **CMS resources:** `admin/cms/resources` + `Attachment` / `ResourceKind` on videos/meets.
- **Video resources API:** `GET/POST /videos/:videoId/resources`.

## Bookmark (`Bookmark`)

`userId`, `contentType`, `contentId`. Unique per user+content.

## Comment (`Comment`)

Polymorphic `contentType` + `contentId`; optional `parentId` for threads.

## Learning Journey (runtime)

| Model | Role |
|-------|------|
| `History` | Resume position, `progressSeconds`, `completed` |
| `WatchActivity` | Activity telemetry |
| `UserPlaybackPreference` | Speed, autoplay next |
| `LearningPath` / `LearningPathItem` | **Schema only** — no active UI/API |

## Relationships (summary)

```
User ──uploads──▶ Video
KnowledgeSeries ──▶ SeriesSession ──▶ Video
KnowledgeMeet ──optional──▶ Video (recording)
Competency ──▶ Video, KnowledgeMeet, KnowledgeSeries, Speaker
User ──▶ Bookmark, History, Comment
```

## Indexes (highlights)

- Engagement: `comments (contentType, contentId)`, `histories (userId, lastWatchedAt)`
- Content: `videos (status, publishedAt)`
- Notifications: `(userId, readAt)`

## Validation

- Enums for status fields in Prisma; DTO validation at API boundary.
- Soft delete via `deletedAt` on several content models.

See also `docs/database-design.md` and `database/setup-notes.md`.

# Database Design

**ORM:** Prisma 6 · **Engine:** PostgreSQL 16 · **Schema:** `apps/api/prisma/schema.prisma`

## Entity catalog

### Identity & RBAC
| Model | Purpose | Key indexes |
|-------|---------|-------------|
| `User` | Google identity, profile | `email`, `status` |
| `Role`, `Permission` | RBAC definitions | `Role.name` unique |
| `UserRole`, `RolePermission` | Mappings | composite PKs |
| `RefreshToken` | Session refresh | `userId`, `expiresAt` |

### Taxonomy
| Model | Purpose |
|-------|---------|
| `Competency` | Skill pillars, slug unique |
| `Category` | Tree via `parentId` |
| `Tag`, `VideoTag` | Video tagging |
| `Speaker`, `SpeakerFollow` | Speakers; follow schema ready |

### Content
| Model | Purpose |
|-------|---------|
| `Video` | Primary playable asset, `ContentStatus` |
| `KnowledgeMeet` | Recorded meet metadata + `homepageTags` |
| `KnowledgeSeries`, `SeriesSession` | Ordered episodes |

### Engagement
`Comment`, `Like`, `Rating`, `Feedback`, `Bookmark`, `History`

### Q&A
`Question`, `Answer`, `QuestionVote`, `AnswerVote`

### Platform
`Attachment`, `Repository`, `Announcement`, `Notification`, `PushSubscription`, `Draft`, `SearchQueryLog`, `UserPlaybackPreference`, `WatchActivity`, `HomepageSection`, `PlatformSetting`, `AuditLog`

### Legacy / dormant
`LearningPath`, `LearningPathItem` — no active API/UI.

## Constraints

- Unique: user email, googleId; bookmark per user+content; history per user+content.
- Cascades on user delete for engagement rows.

## Validation

Application-layer via Nest DTOs; DB enums for status fields.

## Future improvements

- Drop or revive learning path tables.
- Index tuning for admin list filters if slow.
- Materialized views for analytics (not implemented).

See `docs/data-model.md` for relationship narrative.

# KnowledgeHub — Project Build Summary

> Detailed analysis of everything built in the KnowledgeHub monorepo so far.  
> **Repository:** `/home/eram/Documents/TTNP/Learning_TTN`  
> **Last updated:** July 19, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Technology Stack](#3-technology-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Development Phases — What Was Built](#5-development-phases--what-was-built)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Learner Experience (USER Role)](#7-learner-experience-user-role)
8. [Team / Contributor Experience (TEAM Role)](#8-team--contributor-experience-team-role)
9. [Admin Experience (ADMIN Role)](#9-admin-experience-admin-role)
10. [Admin CMS — Detailed Capabilities](#10-admin-cms--detailed-capabilities)
11. [Knowledge Series & Episode Slot Workflow](#11-knowledge-series--episode-slot-workflow)
12. [Content Approval Pipeline](#12-content-approval-pipeline)
13. [Search, Explore & Recommendations](#13-search-explore--recommendations)
14. [Engagement Features](#14-engagement-features)
15. [Notifications & Communication](#15-notifications--communication)
16. [Analytics & Reporting](#16-analytics--reporting)
17. [Database Model Reference](#17-database-model-reference)
18. [API Surface Reference](#18-api-surface-reference)
19. [Frontend Routes Reference](#19-frontend-routes-reference)
20. [UI & Design System](#20-ui--design-system)
21. [Infrastructure & DevOps](#21-infrastructure--devops)
22. [Environment Configuration](#22-environment-configuration)
23. [Known Gaps & Pending Work](#23-known-gaps--pending-work)
24. [Related Documentation](#24-related-documentation)

---

## 1. Executive Summary

**KnowledgeHub** is an internal corporate learning platform built for **TO THE NEW** (`@tothenew.com` employees). It enables employees to:

- Discover and watch engineering learning content (videos, live meets, structured series)
- Follow speakers and explore content by competency
- Search across the full content catalog
- Track personal learning progress (bookmarks, history, continue watching)

For content creators and admins, it provides:

- A multi-step upload studio and approval workflow
- A full admin CMS for meets, series, episodes, speakers, and competencies
- A **contributor episode-slot workflow** where admins pre-create series slots and team members upload to assigned episode numbers
- User/role management, analytics, announcements, and platform configuration

The platform is built as a **pnpm + Turbo monorepo** with a **Next.js 16** frontend and **NestJS 11** REST API backed by **PostgreSQL** and **Prisma**.

---

## 2. Monorepo Structure

```
Learning_TTN/
├── apps/
│   ├── web/                  # Next.js 16 frontend (port 3000)
│   └── api/                  # NestJS 11 REST API (port 3001)
├── packages/
│   ├── types/                # Shared TypeScript types & enums
│   └── tsconfig/             # Shared TS configs (base, nextjs, nestjs)
├── docker/
│   └── docker-compose.yml    # PostgreSQL 16 + Elasticsearch 8.15
├── docs/                     # Architecture & operational documentation
├── package.json              # Root workspace scripts
├── pnpm-workspace.yaml
└── turbo.json
```

### Apps

| App | Package | Port | Purpose |
|-----|---------|------|---------|
| `apps/web` | `@knowledgehub/web` | 3000 | Employee-facing web application |
| `apps/api` | `@knowledgehub/api` | 3001 | REST API, auth, business logic, file storage |

### Shared Packages

| Package | Purpose |
|---------|---------|
| `@knowledgehub/types` | Shared enums (`RoleName`), auth types, content/search/notification contracts |
| `@knowledgehub/tsconfig` | Base TypeScript configuration for web and API |

### Tooling

| Tool | Version | Role |
|------|---------|------|
| pnpm | 9.15.4 | Package manager |
| Turbo | 2.x | Monorepo task orchestration (`dev`, `build`, `lint`) |
| Node.js | ≥ 20 | Runtime |
| TypeScript | 5.8+ | Language |
| Prisma | 6.x | ORM, migrations, seed |
| ESLint | — | Per-app linting |

---

## 3. Technology Stack

### Frontend (`apps/web`)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), React 19, React Compiler |
| UI library | Ant Design 6, `@ant-design/icons`, `@ant-design/plots` |
| Styling | SCSS (Aspire theme), Tailwind CSS v4 (minimal) |
| State | Zustand (auth, theme, mini-player), Redux Toolkit, TanStack React Query v5 |
| Forms | react-hook-form, zod, `@hookform/resolvers` |
| Auth client | `@react-oauth/google` |
| Animation | framer-motion |
| Build | `output: "standalone"` for container deployment |

### Backend (`apps/api`)

| Layer | Technology |
|-------|------------|
| Framework | NestJS 11 on Express |
| ORM | Prisma 6 + PostgreSQL 16 |
| Auth | Google OAuth (`google-auth-library`), JWT, Passport, httpOnly refresh cookies |
| Validation | class-validator, class-transformer, global ValidationPipe |
| Security | helmet, CORS, cookie-parser |
| API docs | Swagger at `/api/v1/docs` |
| Scheduling | `@nestjs/schedule` (meet reminder cron jobs) |

### Pluggable Adapters (Port/Adapter Pattern)

| Concern | Options | Default |
|---------|---------|---------|
| File storage | LOCAL filesystem / AWS S3 | LOCAL |
| Search | PostgreSQL FTS / Elasticsearch | PostgreSQL FTS |
| Email | Console logger / SMTP (nodemailer) | Console |
| Push notifications | Console / Web Push (VAPID) | Console |
| Media processing | In-memory queue/cache (noop) | In-memory |

### Database

- **PostgreSQL 16** — primary data store
- **Elasticsearch 8.15** — optional, for advanced search indexing

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (localhost:3000)                                       │
│  Next.js App Router + React Query + Zustand                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ /api/* proxy rewrite
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  NestJS API (localhost:3001/api/v1)                             │
│  JwtAuthGuard → RolesGuard → PermissionsGuard → Controllers     │
└──────────┬──────────────────────────────┬───────────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌────────────────────────────────────┐
│  PostgreSQL (Prisma)  │    │  Local storage / S3 / Elasticsearch  │
└──────────────────────┘    └────────────────────────────────────┘
```

### Request Flow

1. User signs in via Google OAuth on `/login`
2. Frontend receives JWT access token; refresh token stored in httpOnly cookie at `/api/auth`
3. All authenticated requests include `Authorization: Bearer <token>`
4. Browser calls `/api/*` which Next.js rewrites to `http://localhost:3001/api/v1/*`
5. Global guards validate JWT and role/permission requirements per endpoint

### Layout Model

The authenticated app uses a **three-column Aspire layout**:

| Column | Component | Visibility |
|--------|-----------|------------|
| Left | `AppSidebar` — main navigation | Always (desktop) |
| Center | Page content | Always |
| Right | `RightSidebar` — personalized widgets | ≥ 1280px viewport |

Additional global UI: fixed header (search, notifications, avatar), floating `MiniPlayer` for PiP video playback.

---

## 5. Development Phases — What Was Built

Development was organized in phases. Each phase added a layer of capability.

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| **Phase 2** | Platform foundation | Monorepo, NestJS API, Prisma schema, Google OAuth, JWT auth, RBAC, Swagger |
| **Phase 3** | Frontend shell | Next.js app, login page, protected routes, app layout, auth store |
| **Phase 4** | Content consumption | Videos, series, meets, library, watch page, home feed |
| **Phase 5** | Content creation & admin | Team upload, admin approvals, user management, announcements |
| **Phase 6** | Discovery & engagement | Full-text search, explore hub, recommendations, notifications, analytics |
| **Phase 6.1** | Comms & automation | SMTP email, browser push, meet reminder cron jobs |
| **Phase 7** | Advanced learning | HTTP Range streaming, progress tracking, speakers, learning paths API, Q&A, upload studio, resource center |
| **Phase 8** | Role dashboards & CMS UX | Role-based home dashboards, approval center, admin hub pages, competency landing pages, reports, homepage builder |
| **Post-Phase 8** | Admin CMS module & series workflow | Full CMS backend module, episode slot system, team series upload, catalog management, UI polish |

Detailed phase docs: [`docs/architecture/`](./architecture/)

---

## 6. Authentication & Authorization

### Sign-In Flow

1. User clicks "Sign in with Google" on `/login`
2. Google returns an ID token to the frontend
3. Frontend `POST /api/auth/google` with `{ idToken }`
4. API verifies token against `GOOGLE_CLIENT_ID`
5. Email domain must match `ALLOWED_EMAIL_DOMAIN` (default: `tothenew.com`)
6. User record created on first login (auto-assigned **USER** role)
7. API returns access token + sets httpOnly refresh cookie
8. Bootstrap admin `eram.fatima@tothenew.com` auto-receives **ADMIN** on first login

### Token Model

| Token | Storage | TTL (default) | Purpose |
|-------|---------|---------------|---------|
| Access token | Zustand (encrypted persist) | 15 minutes | API authorization header |
| Refresh token | httpOnly cookie (`/api/auth`) | 7 days | Silent token refresh |

### Roles

| Role | Assigned | Capabilities |
|------|----------|--------------|
| **USER** | Automatically on first login | Browse, watch, search, bookmark, comment, Q&A |
| **TEAM** | By admin | All USER + upload content, studio, series episode upload |
| **ADMIN** | By admin | Full platform control, CMS, approvals, users, analytics |

Users can hold **multiple roles** simultaneously (e.g. ADMIN + TEAM).

### Permission Slugs

| Permission | USER | TEAM | ADMIN |
|------------|:----:|:----:|:-----:|
| `content:create` | — | ✅ | ✅ |
| `content:publish` | — | ✅ | ✅ |
| `analytics:view` | — | ✅ | ✅ |
| `content:approve` | — | — | ✅ |
| `users:manage` | — | — | ✅ |
| `announcements:manage` | — | — | ✅ |
| `teams:manage`, `content:delete`, `homepage:manage`, `comments:moderate` | — | — | ✅ (reserved) |

Full RBAC guide: [`docs/roles-and-permissions.md`](./roles-and-permissions.md)

---

## 7. Learner Experience (USER Role)

### Navigation (Left Sidebar)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Role-based dashboard (learner view: recommendations, continue watching) |
| `/explore` | Explore | Competency hub — browse content by technology area |
| `/meets` | Knowledge Meets | Recorded session library with competency, speaker, year, difficulty, tag, and search filters |
| `/series` | Knowledge Series | Browse structured multi-episode learning series |
| `/library` | My Library | Bookmarks, watch history, continue watching |
| `/speakers` | Speakers | Speaker directory |

### Content Consumption

| Feature | Route / API | Details |
|---------|-------------|---------|
| Watch video | `/watch/[id]` | Video player with comments, Q&A, resources, related content |
| Meet detail | `/meets/[id]` | Redirects to `/watch/[videoId]` when a recording is published |
| Series detail | `/series/[id]` | Episode list, series metadata, competency |
| Speaker profile | `/speakers/[slug]` | Tabs: Sessions, Knowledge Meets, Knowledge Series |
| Competency page | `/competencies/[slug]` | Landing page with sessions, series, meets, speakers for a competency |
| Search | `/search` | Full-text search with filters; header search bar passthrough |
| Mini player | Global overlay | Picture-in-picture floating video player |

### Right Sidebar (Personalized)

| Widget | Content |
|--------|---------|
| Latest Knowledge Meets | Title, speaker, difficulty for newest published sessions |
| Trending Technologies | Popular competencies |
| Competencies | Quick links to competency pages |
| Recently Bookmarked | User's saved content |

### Engagement (available on watch pages)

- **Comments** — threaded discussions on videos/meets/series
- **Q&A** — questions with answers, voting, accepted answer
- **Bookmarks** — save content to library
- **Watch history** — progress tracking, continue watching
- **View count** — incremented on video play

---

## 8. Team / Contributor Experience (TEAM Role)

Team members have all USER capabilities plus content creation tools.

### Routes

| Route | Feature |
|-------|---------|
| `/team/studio` | 6-step upload wizard (Details → Media → Resources → Visibility → Review → Publish) |
| `/team/upload` | Quick upload form + list of own uploads with status |
| `/team/series-upload` | Upload video to a pre-assigned episode slot in a knowledge series |

### Upload Studio (`/team/studio`)

Six-step wizard with draft autosave:

1. **Details** — title, description, competency, category
2. **Media** — video + thumbnail upload (presigned URL / multipart)
3. **Resources** — attach PDFs, slides, GitHub repos, links
4. **Visibility** — draft settings
5. **Review** — preview before submit
6. **Publish** — submit for admin approval

Draft state persisted via `GET/PUT /studio/drafts/:contentType`.

### Series Episode Upload (`/team/series-upload`)

Built for collaborative series production (e.g. DevOps series with 7 contributors):

1. Admin creates a series with N episode slots
2. Each contributor opens `/team/series-upload`
3. Selects the **Knowledge Series** they were assigned
4. Selects their **Episode Number** (slot)
5. Fills title, description, uploads video + thumbnail
6. Submits → video status set to **Pending Approval**

API endpoints (TEAM + ADMIN):

```
GET  /team/series
GET  /team/series/:seriesId/episodes
PUT  /team/series/:seriesId/episodes/:orderIndex
```

### Team Dashboard

Accessible from home when user has TEAM role. Shows:

- Upload stats (drafts, pending, published)
- Quick action cards (Upload Session, Series Episode Upload, etc.)
- Recent upload activity
- Latest published meets and feedback

---

## 9. Admin Experience (ADMIN Role)

### Navigation (Admin Section in Sidebar)

| Route | Hub / Page |
|-------|------------|
| `/admin` | CMS Dashboard — stats overview, quick actions |
| `/admin/content` | Content Hub — tabs: Knowledge Meets, Knowledge Series |
| `/admin/catalog` | Catalog Hub — tabs: Speakers, Competencies |
| `/admin/platform` | Platform Hub — tabs: Users, Approvals |
| `/admin/reports` | Reports & analytics highlights |
| `/admin/settings` | Platform settings |

### Dedicated CRUD Routes

| Entity | Routes |
|--------|--------|
| Knowledge Meets | `/admin/meets`, `/admin/meets/new`, `/admin/meets/[id]/edit` |
| Knowledge Series | `/admin/series/new`, `/admin/series/[id]/edit` |
| Episodes | `/admin/series/[id]/episodes`, `.../new`, `.../[episodeId]/edit` |
| Speakers | `/admin/speakers/new`, `/admin/speakers/[id]/edit` |
| Competencies | `/admin/competencies/new`, `/admin/competencies/[id]/edit` |
| Resources | `/admin/resources` (redirects to content hub if unused) |

### Additional Admin Pages

| Route | Feature |
|-------|---------|
| `/admin/approvals` | Card-based approval center — approve/reject pending videos |
| `/admin/analytics` | Charts: views, engagement, content stats (`@ant-design/plots`) |
| `/admin/announcements` | Create/manage platform announcements |
| `/admin/search-analytics` | Search query analytics and insights |
| `/admin/homepage-builder` | Curate featured homepage sections (localStorage, pending API) |
| `/admin/users` | User list, role assignment |

### Admin UI Patterns

- **Hub pages** with tabs (`AdminTabShell`) — Content, Catalog, Platform
- **"+ Add"** wording for create actions (not "Create")
- **Back arrow** inline left of page title on child form pages
- **Status tags** — DRAFT, PUBLISHED, ARCHIVED, PENDING
- **Data tables** with search, export to Excel, row actions
- **Aspire-styled forms** with Save / Publish actions

---

## 10. Admin CMS — Detailed Capabilities

**Backend module:** `apps/api/src/modules/admin-cms/`  
**API prefix:** `/admin/cms` (ADMIN role only)  
**Frontend hooks:** `apps/web/src/hooks/useAdminCms.ts`  
**Frontend pages:** `apps/web/src/features/admin-cms/`

### Knowledge Meets

| Operation | Endpoint | Notes |
|-----------|----------|-------|
| List | `GET /admin/cms/meets` | All meets including drafts |
| Get | `GET /admin/cms/meets/:id` | Single meet detail |
| Create | `POST /admin/cms/meets` | With CMS status |
| Update | `PATCH /admin/cms/meets/:id` | |
| Delete | `DELETE /admin/cms/meets/:id` | Soft delete |
| Duplicate | `POST /admin/cms/meets/:id/duplicate` | Clone as new draft |

**Fields:** title, subtitle, description, speaker, competency, scheduled date/time, duration, meeting link, recording URL, thumbnail/banner, attendance type (online/offline), mandatory flag, CMS status.

**Visibility mapping:** Draft meets use `RESTRICTED` visibility and are hidden from the public `/meets` API until published.

### Knowledge Series

| Operation | Endpoint | Notes |
|-----------|----------|-------|
| List | `GET /admin/cms/series` | |
| Get | `GET /admin/cms/series/:id` | |
| Create | `POST /admin/cms/series` | Can set episode slot count |
| Update | `PATCH /admin/cms/series/:id` | |
| Delete | `DELETE /admin/cms/series/:id` | Soft delete |

**Fields:** title, description, competency, thumbnail, CMS status, number of episodes (slot count).

### Episodes (Series Sessions)

| Operation | Endpoint | Notes |
|-----------|----------|-------|
| List | `GET /admin/cms/series/:seriesId/episodes` | Ordered by `orderIndex` |
| Create | `POST /admin/cms/series/:seriesId/episodes` | Append or fill specific slot |
| Update | `PATCH /admin/cms/series/:seriesId/episodes/:episodeId` | |
| Delete | `DELETE /admin/cms/series/:seriesId/episodes/:episodeId` | |
| Reorder | `PUT /admin/cms/series/:seriesId/episodes/reorder` | Body: `{ orderedIds: [] }` |

**Episode list UI** shows slot status: **Empty** or **Uploaded** per episode.

**Episode form** supports episode number selection, file upload for video/thumbnail, and manual URL fallback.

### Speakers

| Operation | Endpoint |
|-----------|----------|
| CRUD | `/admin/cms/speakers` |

**Fields:** name, slug, designation, competency, avatar URL, bio, LinkedIn URL, email.

Removed from UI: rating, department columns. Added: competency column and form dropdown.

### Competencies

| Operation | Endpoint |
|-----------|----------|
| CRUD | `/admin/cms/competencies` |

**Fields:** name, slug, icon, sort order. Description removed from admin form.

### CMS Status Layer

Unified statuses used across all CMS entities:

| CMS Status | DB Mapping | Meaning |
|------------|------------|---------|
| `DRAFT` | `ContentStatus.DRAFT` / `Visibility.RESTRICTED` | Not visible to learners |
| `PUBLISHED` | `ContentStatus.PUBLISHED` | Live on platform |
| `ARCHIVED` | `ContentStatus.ARCHIVED` | Removed/hidden |
| `PENDING` | `ContentStatus.PENDING_APPROVAL` | Awaiting admin review |

---

## 11. Knowledge Series & Episode Slot Workflow

This is a key collaborative feature built for multi-contributor series production.

### Problem Solved

A series like "DevOps Knowledge Series" may have 7 videos contributed by 7 different people. The admin needs to:

1. Create the series structure upfront
2. Assign each contributor an episode number
3. Let contributors upload independently without admin intervention

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN                                                         │
│  1. Add Knowledge Series → set "Number of Episodes" = 7       │
│  2. System creates 7 empty slots: Episode 1 … Episode 7      │
│  3. Tells each person: "Upload to DevOps Series, Episode N"    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CONTRIBUTORS (TEAM role)                                      │
│  1. Go to /team/series-upload                                  │
│  2. Select series → select episode number → upload video       │
│  3. Submit → status = Pending Approval                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ADMIN                                                         │
│  1. Review pending videos at /admin/approvals                  │
│  2. Approve → episode goes live on /series/[id]                │
└─────────────────────────────────────────────────────────────┘
```

### Data Model

```
KnowledgeSeries
  └── SeriesSession[] (episodes)
        ├── orderIndex (1, 2, 3 …)
        ├── title ("Episode 1" or custom)
        └── video? (optional Video record)
```

- `@@unique([seriesId, orderIndex])` ensures one slot per episode number
- Slots can exist without a video (empty placeholders)
- Video linked when contributor or admin uploads

### Implementation Notes

- Frontend creates slots via sequential episode POST calls after series save (compatible with all API versions)
- Backend `ensureEpisodeSlots()` pre-creates placeholder sessions on series create/update
- Team upload API sets video status to `PENDING_APPROVAL` for admin review
- Friendly validation error messages for form failures (non-technical English)

---

## 12. Content Approval Pipeline

```
TEAM creates draft
      │
      ▼
TEAM submits (POST /videos/:id/submit)
      │
      ▼
Status: PENDING_APPROVAL
      │
      ├── ADMIN approves → PUBLISHED (search index updated, uploader notified)
      └── ADMIN rejects  → back to DRAFT (uploader notified)
```

**Approval UI:** `/admin/approvals` — card-based layout with bulk actions (Phase 8).

**Notifications on approval/rejection:**
- In-app notification
- Email (if SMTP configured)
- Browser push (if subscribed)

---

## 13. Search, Explore & Recommendations

### Full-Text Search

- **Provider:** PostgreSQL FTS (default) with `search_vector` columns + GIN indexes
- **Optional:** Elasticsearch adapter for larger catalogs
- **Endpoints:**
  - `GET /search` — query with filters (type, competency, date) and pagination
  - `GET /search/suggestions` — autocomplete
  - `GET /search/recent`, `/popular`, `/trending` — discovery helpers
- **Migration:** `20260718131500_add_fts_search`
- **Admin:** `/admin/search-analytics` for query insights

### Explore Hub

- `GET /explore` — competency cards with content counts
- Frontend: `/explore` page + `/competencies/[slug]` landing pages

### Recommendations

- `GET /feed/recommendations` — personalized based on watch history + trending fallback
- `GET /feed/related/:contentType/:id` — related content on detail pages
- `GET /feed/home` — home page feed
- `GET /feed/dashboard` — dashboard-specific feed

---

## 14. Engagement Features

| Feature | API | UI Location |
|---------|-----|-------------|
| Comments | `GET/POST /comments` | Watch page, meet/series detail |
| Q&A | `GET/POST /questions`, `/answers`, votes, accept | Watch page |
| Bookmarks | `GET/POST /bookmarks` | Watch page, library |
| Watch history | `GET/PUT /history` | Library (continue watching) |
| View count | `POST /videos/:id/view` | Automatic on play |
| Speaker follow | Schema exists (`SpeakerFollow`) | API pending |
| Ratings / Likes | Schema exists (`Rating`, `Like`) | API pending |

### Q&A (Phase 7)

Separate from comments — structured learning Q&A:

- Ask questions on video content
- Answers with upvote/downvote
- Accepted answer marking
- Question voting

---

## 15. Notifications & Communication

### In-App Notifications

- Inbox at header bell icon
- `GET /notifications`, `GET /notifications/unread-count`
- Mark read individually or all at once

### Email

- Adapter: console (dev) or SMTP (production)
- Used for: approval results, meet reminders
- Config: `MAIL_PROVIDER`, `SMTP_*` env vars

### Browser Push

- Web Push API with VAPID keys
- `GET /push/vapid-public-key`, `POST /push/subscribe`
- Config: `PUSH_PROVIDER`, `VAPID_*` env vars

### Meet publish notifications

- Cron-based meet reminders are **disabled** (meets are recorded, not live events)
- Users receive `MEET_PUBLISHED` when a meet recording is first published (admin or approval flow)
- Legacy columns `reminder_day_sent_at` / `reminder_hour_sent_at` remain on `knowledge_meets` but are unused

---

## 16. Analytics & Reporting

### Admin Analytics (`/admin/analytics`)

- Total views, comments, bookmarks
- Content breakdown by type and status
- Engagement trends
- Charts via `@ant-design/plots`

### API Endpoints

- `GET /admin/overview` — dashboard stats
- `GET /admin/analytics` — detailed metrics with date range

### Reports (`/admin/reports`)

- Combined analytics view with highlights
- Export-friendly data presentation

### Progress Tracking (Phase 7)

- `GET /progress/summary` — user learning summary
- `GET /progress/weekly-activity` — activity heatmap data
- `GET/PUT /progress/playback-preferences` — speed, quality preferences

---

## 17. Database Model Reference

**Schema file:** `apps/api/prisma/schema.prisma`  
**Migrations:** 4 migrations from init through Phase 7

### Entity Groups

#### Identity & RBAC
`User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `RefreshToken`

#### Taxonomy
`Competency`, `Category` (tree), `Tag`, `Speaker`, `SpeakerFollow`

#### Content
`Video`, `VideoTag`, `KnowledgeMeet`, `KnowledgeSeries`, `SeriesSession`

Content status enum: `DRAFT`, `PENDING_APPROVAL`, `PUBLISHED`, `ARCHIVED`

#### Engagement
`Comment`, `Like`, `Rating`, `Feedback`, `Bookmark`, `History`

#### Q&A
`Question`, `Answer`, `QuestionVote`, `AnswerVote`

#### Platform
`Attachment`, `Repository`, `Announcement`, `Notification`, `PushSubscription`, `Draft`, `LearningPath`, `LearningPathItem`, `SearchQueryLog`, `UserPlaybackPreference`, `WatchActivity`, `HomepageSection`, `AuditLog`

### Key Relationships

```
User ──uploads──▶ Video
Speaker ──presents──▶ Video, KnowledgeMeet
Competency ──organizes──▶ Video, KnowledgeMeet, KnowledgeSeries, Speaker
KnowledgeSeries ──has──▶ SeriesSession ──links──▶ Video
Video ──has──▶ Attachment, Repository, Comment, Question
User ──has──▶ Bookmark, History, Notification, Draft, LearningPath
```

---

## 18. API Surface Reference

**Base URL:** `http://localhost:3001/api/v1`  
**Swagger:** `http://localhost:3001/api/v1/docs`

### Public Endpoints (no JWT required)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/google` | Google sign-in |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/competencies` | List competencies |
| GET | `/categories` | List categories |
| GET | `/health` | Health check |

### Content (authenticated)

| Controller | Base Path | Key Operations |
|------------|-----------|----------------|
| Videos | `/videos` | List, mine, CRUD, playback, stream, submit, view |
| Meets | `/knowledge-meets` | List (with status filter), detail |
| Series | `/knowledge-series` | List, detail |
| Speakers | `/speakers` | List, profile by slug/ID |
| Engagement | `/` | Comments, bookmarks, history |
| Feed | `/` | Home, dashboard, recommendations, explore, related |
| Search | `/search` | Query, suggestions, recent, popular, trending |
| Progress | `/progress` | Summary, weekly activity, playback prefs |
| Q&A | `/` | Questions, answers, votes, accept |
| Resources | `/` | Video attachments |
| Studio | `/studio` | Draft autosave, publish |
| Learning Paths | `/learning-paths` | CRUD, items, complete |
| Notifications | `/notifications` | Inbox, unread count, mark read |
| Push | `/push` | VAPID key, subscribe/unsubscribe |
| Storage | `/uploads` | Presign, file upload, complete |

### Admin

| Controller | Base Path | Access |
|------------|-----------|--------|
| Admin | `/admin` | Overview, analytics, approvals, announcements, reindex |
| Admin CMS | `/admin/cms` | Meets, series, episodes, speakers, competencies, resources CRUD |
| Users | `/users` | List, role assignment |

### Team

| Controller | Base Path | Access |
|------------|-----------|--------|
| Team Series | `/team/series` | List series, list episodes, upload to slot |

---

## 19. Frontend Routes Reference

### Public

| Route | Page |
|-------|------|
| `/login` | Google OAuth sign-in |

### Learner (all authenticated users)

| Route | Page |
|-------|------|
| `/` | Role-based home dashboard |
| `/explore` | Competency explore hub |
| `/search` | Full-text search |
| `/watch/[id]` | Video player + engagement |
| `/series` | Knowledge series listing |
| `/series/[id]` | Series detail with episodes |
| `/meets` | Knowledge meets listing |
| `/meets/[id]` | Meet detail |
| `/library` | Bookmarks, history, continue watching |
| `/speakers` | Speaker directory |
| `/speakers/[slug]` | Speaker profile (Sessions, Meets, Series tabs) |
| `/competencies/[slug]` | Competency landing page |

### Team (TEAM + ADMIN)

| Route | Page |
|-------|------|
| `/team/upload` | Quick upload + my uploads list |
| `/team/studio` | 6-step upload wizard |
| `/team/series-upload` | Series episode slot upload |

### Admin (ADMIN only)

| Route | Page |
|-------|------|
| `/admin` | CMS dashboard |
| `/admin/content` | Content hub (meets + series tabs) |
| `/admin/catalog` | Catalog hub (speakers + competencies tabs) |
| `/admin/platform` | Platform hub (users + approvals tabs) |
| `/admin/meets/new`, `/admin/meets/[id]/edit` | Meet form |
| `/admin/series/new`, `/admin/series/[id]/edit` | Series form |
| `/admin/series/[id]/episodes` | Episode list |
| `/admin/series/[id]/episodes/new` | Add episode |
| `/admin/series/[id]/episodes/[episodeId]/edit` | Edit episode |
| `/admin/speakers/new`, `/admin/speakers/[id]/edit` | Speaker form |
| `/admin/competencies/new`, `/admin/competencies/[id]/edit` | Competency form |
| `/admin/approvals` | Approval center |
| `/admin/analytics` | Analytics charts |
| `/admin/announcements` | Announcements management |
| `/admin/search-analytics` | Search analytics |
| `/admin/reports` | Reports |
| `/admin/homepage-builder` | Homepage curation |
| `/admin/settings` | Platform settings |
| `/admin/users` | User management |

---

## 20. UI & Design System

### Aspire Theme

Aligned with **nw-aspire-client** corporate design:

| Token | Value | Usage |
|-------|-------|-------|
| Primary pink | `#DE1186` | CTAs, accents, borders |
| Primary purple | `#2E1C41` | Headers, sidebar, dark surfaces |
| Font | Poppins | All text |
| Button style | Aspire flat buttons | `AspireButton` component |

### Key UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AspireButton` | `components/ui/` | Branded buttons (primary, secondary, h40) |
| `AspireModal` | `components/ui/` | Branded modals |
| `AspireTable` | `components/ui/` | Styled data tables |
| `AdminPageHeader` | `features/admin-cms/components/` | Page title + back arrow + action button |
| `AdminTabShell` | `features/admin-cms/components/` | Hub pages with tabs |
| `CmsDataTable` | `features/admin-cms/components/` | Searchable, exportable admin tables |
| `StatusTag` | `features/admin-cms/components/` | CMS status badges |
| `ProtectedRoute` | `components/layout/` | Role-based route guard |
| `MiniPlayer` | `components/video/` | Floating video player |
| Phase 8 widgets | `features/phase8/widgets/` | StatCard, ChartCard, ApprovalCard, etc. |

### Styling

- Global SCSS: `apps/web/src/styles/knowledgehub.scss`
- Ant Design theme overrides for Aspire alignment
- Tailwind v4 present but used minimally

---

## 21. Infrastructure & DevOps

### Docker Services

```yaml
# docker/docker-compose.yml
services:
  postgres:    # PostgreSQL 16, port 5432
  elasticsearch: # Elasticsearch 8.15, port 9200 (optional)
```

### Local File Storage

```
apps/api/storage/
├── videos/
├── thumbnails/
├── banners/
├── resources/
└── speakers/
```

Served at `/storage/*` (proxied through Next.js).

### Build & Deploy

| Command | Action |
|---------|--------|
| `pnpm dev` | Start both apps in watch mode |
| `pnpm build` | Generate Prisma client + build all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed roles, permissions, sample content |
| `pnpm db:studio` | Open Prisma Studio |

Web builds as Next.js `standalone` output for container deployment.

### Proxy Configuration

Next.js rewrites (`apps/web/next.config.ts`):

| Browser path | Proxied to |
|--------------|------------|
| `/api/*` | `http://localhost:3001/api/v1/*` |
| `/storage/*` | API static file server |
| `/uploads/*` | Legacy upload path |

**Both servers must be running for the app to work:**
- Web: port 3000
- API: port 3001

---

## 22. Environment Configuration

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_ENVIRONMENT=dev
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
NEXT_PUBLIC_ENCRYPTION_KEY=<32-char-key>
```

### API (`apps/api/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | Access token signing |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token signing |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth validation |
| `CORS_ORIGIN` | — | Default: `http://localhost:3000` |
| `ALLOWED_EMAIL_DOMAIN` | — | Default: `tothenew.com` |
| `STORAGE_PROVIDER` | — | `LOCAL` or `S3` |
| `SEARCH_PROVIDER` | — | `postgres` or `elasticsearch` |
| `MAIL_PROVIDER` | — | `console` or `smtp` |
| `PUSH_PROVIDER` | — | `console` or `webpush` |

### Quick Start

```bash
docker compose -f docker/docker-compose.yml up -d
pnpm install
pnpm db:migrate
pnpm db:seed

# Terminal 1
cd apps/api && npm run dev

# Terminal 2
cd apps/web && WATCHPACK_POLLING=true npm run dev
```

---

## 23. Known Gaps & Pending Work

| Area | Status | Notes |
|------|--------|-------|
| Learning paths UI | API ready, no frontend page | `/learning-paths` routes exist in API only |
| Homepage builder API | UI uses localStorage | `HomepageSection` model in schema, CMS API pending |
| Speaker `competencyId` migration | Schema updated | Needs `prisma db push` to apply |
| Ratings / Likes API | Schema only | Models exist, no dedicated controller |
| Speaker follow | Schema only | `SpeakerFollow` model, no API yet |
| S3 production storage | Adapter ready | Needs AWS credentials in production |
| Native push (FCM/APNs) | Not started | Web push only |
| Email digests | Not started | Individual emails work via SMTP |
| Dark mode | Removed | Deliberately removed during Aspire alignment |
| Learning Resources admin tab | Removed | Redirects to content hub |
| Root `.env.local` | Wrong API URL | Use `apps/web/.env.local` instead |

### Operational Notes

- If `/api/auth/google` returns **500**, the API server on port 3001 is likely not running
- If series save fails with validation errors, restart the API to pick up latest DTO changes
- On Linux, use `WATCHPACK_POLLING=true` for Next.js file watching
- Seed user `knowledgehub-seed@tothenew.com` is for sample data only — sign in with your real `@tothenew.com` Google account

---

## 24. Related Documentation

| Document | Description |
|----------|-------------|
| [`complete-go-through.md`](./complete-go-through.md) | Operational walkthrough, bug fixes, key files |
| [`roles-and-permissions.md`](./roles-and-permissions.md) | Full RBAC matrix and per-role workflows |
| [`architecture/phase-2.md`](./architecture/phase-2.md) | Monorepo, auth, RBAC foundation |
| [`architecture/phase-3.md`](./architecture/phase-3.md) | Frontend auth and app shell |
| [`architecture/phase-4.md`](./architecture/phase-4.md) | Content APIs and watch pages |
| [`architecture/phase-5.md`](./architecture/phase-5.md) | Upload workflow and admin approvals |
| [`architecture/phase-6.md`](./architecture/phase-6.md) | Search, explore, notifications, analytics |
| [`architecture/phase-7.md`](./architecture/phase-7.md) | Streaming, Q&A, studio, learning paths |
| [`architecture/phase-8.md`](./architecture/phase-8.md) | Dashboards, approval center, homepage builder |
| [`architecture/storage.md`](./architecture/storage.md) | Storage provider contract and S3 guide |

---

*This document reflects the state of the codebase as of July 19, 2026. For the latest operational runbook, see [`complete-go-through.md`](./complete-go-through.md).*

# KnowledgeHub — Live Demo Walkthrough

> How everything works **right now** — all pages, roles, uploads, and APIs.  
> Use this as a demo script or onboarding guide.

**Last updated:** July 19, 2026

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture at a Glance](#architecture-at-a-glance)
3. [Authentication Demo](#authentication-demo)
4. [Role Overview](#role-overview)
5. [Learner Pages (USER)](#learner-pages-user)
6. [Team Pages (TEAM)](#team-pages-team)
7. [Admin Pages (ADMIN)](#admin-pages-admin)
8. [Upload Workflows](#upload-workflows)
9. [API Reference (What Powers the UI)](#api-reference-what-powers-the-ui)
10. [Demo Script (30-Minute Walkthrough)](#demo-script-30-minute-walkthrough)
11. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Run locally

```bash
# Terminal 1 — API (port 3001)
cd apps/api && npm run dev

# Terminal 2 — Web (port 3000)
cd apps/web && WATCHPACK_POLLING=true npm run dev
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Swagger docs | http://localhost:3001/api/v1/docs |
| Health check | http://localhost:3001/api/v1/health |

### Sign in

1. Open http://localhost:3000
2. You are redirected to `/login`
3. Sign in with Google using a `@tothenew.com` email
4. New users get the **USER** role automatically
5. Admin must assign **TEAM** or **ADMIN** at `/admin/platform?tab=users`

> **Important:** Both servers must be running. If the API is down, `/api/*` calls (including Google auth) return 500.

---

## Architecture at a Glance

```
Browser (localhost:3000)
    │
    ├── Next.js pages & components
    │
    └── /api/*  ──rewrite──►  NestJS API (localhost:3001/api/v1)
                                    │
                                    └── PostgreSQL + Prisma
```

- **Frontend:** `apps/web` — Next.js 16, React 19, Ant Design 6, React Query
- **Backend:** `apps/api` — NestJS 11, Prisma, JWT auth
- **Storage:** Local disk (`./storage`) in dev; S3 in production (`STORAGE_PROVIDER=S3`)
- **Search:** PostgreSQL full-text search (default)

---

## Authentication Demo

| Step | What happens |
|------|----------------|
| 1 | User clicks Google Sign-In on `/login` |
| 2 | Frontend sends Google ID token to `POST /api/auth/google` |
| 3 | API validates domain (`@tothenew.com`), creates/fetches user, issues JWT |
| 4 | Access token stored in Zustand; refresh token in HTTP-only cookie |
| 5 | Protected routes check auth via `ProtectedRoute` component |

**API:** `auth/google`, `auth/refresh`, `auth/logout`, `auth/me`

---

## Role Overview

| Role | Who | Key access |
|------|-----|------------|
| **USER** | Every employee | Browse, watch, bookmark, search, learning paths |
| **TEAM** | Content creators | + Team Studio, series episode upload |
| **ADMIN** | Platform admins | + Full CMS, approvals, users, settings, reports |

Roles are assigned at **Admin → Platform → Users**. A user can hold multiple roles (e.g. ADMIN + TEAM).

---

## Learner Pages (USER)

All routes below require sign-in unless noted.

### `/` — Home

**What it shows:**
- Welcome message with user name
- Search bar
- Featured video hero
- Rows: Top videos, Continue watching, Recommended, Trending, Latest sessions, Knowledge series

**API:** `GET /feed/dashboard`, `GET /feed/recommendations`

**Role banners:**
- Admins see a link to Admin CMS
- Team members see a link to Team Studio

---

### `/explore` — Explore Hub

**What it does:**
- Browse competencies and categories
- Featured and trending content per competency
- Entry point for discovery

**API:** `GET /explore`

---

### `/search` — Search

**What it does:**
- Full-text search across videos, meets, series
- Suggestions, recent searches, popular/trending queries

**API:** `GET /search`, `GET /search/suggestions`, `GET /search/recent`, `GET /search/popular`, `GET /search/trending`

---

### `/meets` — Knowledge Meets Library

**What it shows:**
- Recorded monthly competency sessions (published library only)
- Filters: competency, speaker, difficulty, year, tag, search
- Sort: Newest, Oldest, Most Viewed
- Cards link to `/watch/[videoId]` when a recording is published

**API:** `GET /knowledge-meets?competencyId=&speakerId=&difficulty=&year=&tag=&search=&sort=`

---

### `/meets/[id]` — Knowledge Meet Detail

**What it does:**
- Redirects to **`/watch/[videoId]`** for published recordings (primary viewing experience)
- Unpublished drafts are not visible to learners

**API:** `GET /knowledge-meets/:id`

---

### `/series` — Knowledge Series (list)

**What it shows:**
- All published series with competency, instructor, episode count

**API:** `GET /knowledge-series`

---

### `/series/[id]` — Series Detail

**What it shows:**
- Series metadata, banner, description
- Episode list with progress per episode
- Click episode → watch page

**API:** `GET /knowledge-series/:id`

---

### `/watch/[id]` — Video Player

**What it does:**
- Stream video with resume position
- Playback speed preferences
- Bookmark button
- Comments section
- Q&A section
- Resource center (slides, PDFs, links)
- Related content row

**API:** `GET /videos/:id`, `GET /videos/:id/playback`, `POST /videos/:id/view`, comments/bookmarks/history/Q&A endpoints

---

### `/library` — Personal Library

**Tabs:**
| Tab | Content |
|-----|---------|
| Continue Watching | In-progress videos with % complete |
| Bookmarks | Saved sessions |
| History | Watch history |

**API:** Engagement endpoints (`bookmarks`, `history`, continue-watching)

---

### `/speakers` — Speaker Directory

**What it shows:**
- All speakers with avatar, designation, session count

**API:** `GET /speakers`

---

### `/speakers/[slug]` — Speaker Profile

**What it shows:**
- Bio, LinkedIn, competency
- Sessions and series by this speaker

**API:** `GET /speakers/:slugOrId`

---

### `/competencies/[slug]` — Competency Hub

**What it shows:**
- All content tagged to a competency (videos, meets, series)

**API:** Taxonomy + filtered content queries

---

### `/learning-paths` — Learning Paths (list)

**What it does:**
- Create personal learning paths
- View progress (% complete) per path
- Delete paths

**API:** `GET /learning-paths`, `POST /learning-paths`, `DELETE /learning-paths/:id`

> Hidden from sidebar when admin disables `featureLearningPaths` in Settings.

---

### `/learning-paths/[id]` — Learning Path Detail

**What it does:**
- View path items (VIDEO, SERIES, COMPETENCY, CUSTOM)
- Add new items
- Mark items complete

**API:** `GET /learning-paths/:id`, `POST /learning-paths/:id/items`, `POST /learning-paths/:id/items/:itemId/complete`

---

### `/login` — Sign In (public)

Google OAuth sign-in page. Redirects to `/` when already authenticated.

---

## Team Pages (TEAM)

Requires **TEAM** or **ADMIN** role.

### `/team/studio` — Upload Studio

**What it does:**
- Multi-step wizard: Details → Media → Resources → Visibility → Review → Publish
- Upload video + thumbnail
- Autosave drafts to API
- Submit for admin approval

**API:** `POST /videos`, `PUT /studio/drafts/VIDEO`, `POST /videos/:id/submit`, `POST /uploads/file`

---

### `/team/upload` — Simple Upload

**What it does:**
- Lightweight form: title, description, competency, category, video, thumbnail
- Save draft → submit for approval
- Table of "My Uploads" with status

**API:** `GET /videos/mine`, `POST /videos`, `POST /videos/:id/submit`

---

### `/team/series-upload` — Series Episode Upload

**What it does:**
- Select assigned knowledge series
- Pick **episode number** (slot created by admin)
- Upload video + thumbnail
- Submit for approval

**API:** `GET /team/series`, `GET /team/series/:id/episodes`, `PUT /team/series/:id/episodes/:orderIndex`

> You can upload Episode 4 without uploading 1–3 — admin must create at least 4 slots first.

---

### `/team/meet-upload` — Knowledge Meet Recording Upload

**What it does:**
- Select a published knowledge meet session (monthly competency meet)
- Upload session recording video + optional thumbnail
- Submit for admin approval (recording appears in video library when published)

**API:** `GET /team/meets`, `PUT /team/meets/:meetId/recording`

---

## Admin Pages (ADMIN)

Requires **ADMIN** role. Access via sidebar **Admin** menu.

### `/admin` — Admin Dashboard

**What it shows:**
- Stats: users, meets, series, speakers, drafts, pending, published
- Quick actions: Manage Users, Add Speaker, Add Meet, Homepage Builder, etc.
- Recent uploads, latest published meets
- Links to Content, Catalog, Platform, Reports, Settings

**API:** `GET /admin/overview`, `GET /admin/cms/meets`, `GET /admin/cms/series`

---

### `/admin/content` — Content Hub

**Tabs:** Meets | Series

| Action | Route |
|--------|-------|
| List meets/series | `/admin/content?tab=meets` or `?tab=series` |
| Add meet | `/admin/meets/new` |
| Edit meet | `/admin/meets/[id]/edit` |
| Add series | `/admin/series/new` |
| Edit series | `/admin/series/[id]/edit` |
| Manage episodes | `/admin/series/[id]/episodes` |

**Meet form fields:** title, subtitle, description, speaker, competency, session date, duration, difficulty, tags, banner, thumbnail, recording video, slides, GitHub, PDFs → **Publish to Library**

**Team upload:** `/team/meet-upload` for contributors (approval queue)

**API:** `admin/cms/meets/*`, `PUT admin/cms/meets/:id/recording`, `GET/PUT team/meets/*`, `admin/cms/series/*`

**Series form fields:** title, competency, instructor, level, episode count, banner, tags

---

### `/admin/catalog` — Catalog Hub

**Tabs:** Speakers | Competencies

| Action | Route |
|--------|-------|
| List speakers | `/admin/catalog?tab=speakers` |
| Add speaker | `/admin/speakers/new` |
| Edit speaker | `/admin/speakers/[id]/edit` |
| List competencies | `/admin/catalog?tab=competencies` |
| Add competency | `/admin/competencies/new` |
| Edit competency | `/admin/competencies/[id]/edit` |

**API:** `admin/cms/speakers/*`, `admin/cms/competencies/*`

---

### `/admin/platform` — Platform Hub

**Tabs:** Users | Approvals

| Tab | What it does |
|-----|--------------|
| **Users** | List users, assign/remove TEAM and ADMIN roles |
| **Approvals** | Approve or reject pending video uploads from team |

**API:** `GET /users`, `PATCH /users/:id/roles`, `GET /admin/approvals/pending`, `POST /admin/approvals/:id/approve|reject`

---

### `/admin/reports` — Reports

**What it shows:**
- Most viewed session, popular series, top competency, top speaker
- Monthly uploads, downloads, watch hours, active users

**API:** `GET /admin/reports`

---

### `/admin/analytics` — Analytics Dashboard

**What it shows:**
- Charts: views over time, content breakdown, engagement metrics

**API:** `GET /admin/analytics`

---

### `/admin/search-analytics` — Search Analytics

**What it shows:**
- Popular searches, trending queries, no-result queries

**API:** `GET /admin/search/analytics`

---

### `/admin/announcements` — Announcements

**What it does:**
- Create, edit, delete platform announcements
- Shown on learner dashboards

**API:** `GET/POST/PATCH/DELETE /admin/announcements`, `GET /announcements`

---

### `/admin/settings` — Platform Settings

**Sections:**
| Section | Settings |
|---------|----------|
| Homepage Banner | Title, subtitle, image URL |
| Theme & Defaults | Accent color, default competency |
| Email Templates | Welcome email template |
| Notifications | New session, approval alerts |
| Feature Flags | Learning Paths, Q&A, Bookmarks |

**API:** `GET/PATCH /admin/cms/settings`, `GET /platform/settings` (read-only for all users)

> Stored in database (`platform_settings` table). No longer uses localStorage.

---

### `/admin/homepage-builder` — Homepage Builder

**What it does:**
- Reorder home page sections (drag ↑↓)
- Toggle section visibility on/off
- Save layout to database

**Sections:** Welcome, Learning Progress, Featured, Continue Watching, Recommended, Latest Knowledge Meets, Trending, Knowledge Series, Latest Uploads

**API:** `GET/PUT /admin/cms/homepage`, `GET /homepage/layout` (learner read)

---

### `/admin/resources` — Resource Center (admin)

**What it does:**
- Manage downloadable resources (PDF, slides, GitHub, external links)
- Link resources to competencies

**API:** `admin/cms/resources/*`

---

### Episode management (admin)

**Route:** `/admin/series/[id]/episodes`

| Action | Route |
|--------|-------|
| Episode list | `/admin/series/[id]/episodes` |
| Add/upload episode | `/admin/series/[id]/episodes/new` |
| Edit episode | `/admin/series/[id]/episodes/[episodeId]/edit` |

**Episode form:** episode number picker, title, description, video upload, thumbnail, slides, GitHub, PDFs, publish

---

## Upload Workflows

### A. Publish a Knowledge Meet (recorded session)

Knowledge meets are **recorded learning sessions** published to the library.

**Admin workflow:**

1. **Admin → Content → Meets → Add Knowledge Meet**
2. Fill metadata: title, description, speaker, competency, session date, duration, difficulty, tags
3. Upload **banner**, **thumbnail**, and **recording video** (required to publish)
4. Optionally add slides, PDFs, GitHub link
5. Click **Publish to Library**
6. Session appears on Home, Explore, Search, Speaker/Competency pages, and `/meets`
7. Users receive notification: **New Knowledge Meet Available: {title}**

**Team contributor workflow:**

1. Admin creates draft meet (or team uses `/team/meet-upload`)
2. Team uploads recording → **Admin → Platform → Approvals** → Approve

**API:** `POST/PATCH admin/cms/meets`, `PUT admin/cms/meets/:id/recording`, `PUT team/meets/:meetId/recording`

---

### B. Upload Series Episode 4 only (skip 1–3)

1. **Admin → Content → Series** → create/edit DevOps series
2. Set **Number of Episodes** to at least **4** (e.g. 7) → Save
3. This creates empty slots: Episode 1, 2, 3, 4, …
4. **Option A (Admin):** Series → Manage Episodes → Add Episode → pick **Episode 4** → upload video → Publish
5. **Option B (Team):** Team → Series Episode Upload → select DevOps → pick **Episode 4** → upload → Submit

Episodes 1–3 remain empty until someone uploads to those slots.

---

### C. Team member uploads a standalone video

1. **Team → Studio** (wizard) or **Team → Upload** (simple form)
2. Fill title, description, competency
3. Upload video + thumbnail
4. Save draft → **Submit for Approval**
5. **Admin → Platform → Approvals** → Approve or Reject

---

### Upload limits

| Category | Max size |
|----------|----------|
| Videos | 200 MB |
| Thumbnails / Banners / Speakers | 5 MB |
| Resources (slides, PDFs) | 20 MB |

**API:** `POST /uploads/file?category=videos|thumbnails|banners|resources|speakers`

---

## API Reference (What Powers the UI)

### Auth & Users
| Endpoint | Purpose |
|----------|---------|
| `POST /auth/google` | Google sign-in |
| `POST /auth/refresh` | Refresh access token |
| `GET /auth/me` | Current user + roles |
| `GET /users` | List users (admin) |
| `PATCH /users/:id/roles` | Assign roles (admin) |

### Content
| Endpoint | Purpose |
|----------|---------|
| `GET /videos`, `GET /videos/:id` | Video list & detail |
| `GET /knowledge-meets`, `GET /knowledge-meets/:id` | Meets |
| `GET /knowledge-series`, `GET /knowledge-series/:id` | Series |
| `GET /speakers`, `GET /speakers/:slug` | Speakers |
| `GET /competencies`, `GET /categories` | Taxonomy |

### Feed & Discovery
| Endpoint | Purpose |
|----------|---------|
| `GET /feed/dashboard` | Home dashboard data |
| `GET /feed/home` | Aggregated home feed |
| `GET /feed/recommendations` | Personalized recommendations |
| `GET /explore` | Explore hub |
| `GET /search` | Full-text search |

### Engagement
| Endpoint | Purpose |
|----------|---------|
| `GET/POST /bookmarks` | Bookmarks |
| `GET/PUT /history` | Watch history & progress |
| `GET/POST /comments` | Comments |
| `GET/POST /videos/:id/questions` | Q&A |

### Progress
| Endpoint | Purpose |
|----------|---------|
| `GET /progress/summary` | Learning progress & streaks |
| `GET /progress/weekly-activity` | Weekly activity chart |
| `PUT /progress/playback-preferences` | Speed, autoplay |

### Learning Paths
| Endpoint | Purpose |
|----------|---------|
| `GET/POST /learning-paths` | List & create paths |
| `GET /learning-paths/:id` | Path detail + completion % |
| `POST /learning-paths/:id/items` | Add item |
| `POST /learning-paths/:id/items/:itemId/complete` | Mark complete |

### Admin CMS
| Endpoint | Purpose |
|----------|---------|
| `admin/cms/meets/*` | Meet CRUD |
| `PUT /admin/cms/meets/:id/recording` | Publish meet recording as video |
| `admin/cms/series/*` | Series CRUD |
| `admin/cms/series/:id/episodes/*` | Episode CRUD + reorder |
| `admin/cms/speakers/*` | Speaker CRUD |
| `admin/cms/competencies/*` | Competency CRUD |
| `admin/cms/resources/*` | Resource CRUD |
| `GET/PUT /admin/cms/homepage` | Homepage layout |
| `GET/PATCH /admin/cms/settings` | Platform settings |

### Team
| Endpoint | Purpose |
|----------|---------|
| `GET /team/series` | Series available for upload |
| `PUT /team/series/:id/episodes/:orderIndex` | Upload to episode slot |
| `GET /team/meets` | Meets available for recording upload |
| `PUT /team/meets/:meetId/recording` | Upload meet session recording |

### Storage
| Endpoint | Purpose |
|----------|---------|
| `POST /uploads/file` | Upload file (local or S3) |
| `POST /uploads/presign` | Presigned URL (S3) |

### Platform
| Endpoint | Purpose |
|----------|---------|
| `GET /homepage/layout` | Learner homepage sections |
| `GET /platform/settings` | Feature flags & banner config |
| `GET /health` | API health check |

---

## Demo Script (30-Minute Walkthrough)

Use this order for a live demo to stakeholders.

### Part 1 — Learner experience (10 min)

1. **Sign in** at `/login` with `@tothenew.com` Google account
2. **Home (`/`)** — show featured video, continue watching, recommendations
3. **Search** — search "devops" or a competency name
4. **Explore (`/explore`)** — browse competencies
5. **Watch a video (`/watch/[id]`)** — play, bookmark, scroll to comments/Q&A
6. **Library (`/library`)** — show bookmarks and history tabs
7. **Learning Paths (`/learning-paths`)** — create a path, add an item, mark complete
8. **Meets (`/meets`)** — browse recorded session library with filters
9. **Series (`/series`)** — open a series, show episode list

### Part 2 — Team workflow (5 min)

1. Ensure demo user has **TEAM** role (Admin → Platform → Users)
2. **Team Studio (`/team/studio`)** — walk through upload wizard
3. **Meet Recording Upload (`/team/meet-upload`)** — select session, upload recording
4. **Series Episode Upload (`/team/series-upload`)** — pick series + episode number, upload
5. Show submission goes to pending approval

### Part 3 — Admin CMS (10 min)

1. **Admin Dashboard (`/admin`)** — stats, quick actions
2. **Content → Meets** — create session with recording, difficulty, tags, publish to library
3. **Content → Series** — set episode count, manage episodes
4. **Catalog → Speakers** — add a speaker
5. **Platform → Approvals** — approve team upload
6. **Platform → Users** — assign TEAM/ADMIN role
7. **Settings** — toggle feature flags, save banner
8. **Homepage Builder** — reorder/hide sections, save
9. **Reports** — show analytics cards

### Part 4 — Technical highlights (5 min)

1. Open **Swagger** at http://localhost:3001/api/v1/docs
2. Show `GET /health` returns OK
3. Explain `/api/*` proxy from Next.js to NestJS
4. Mention S3 storage for production (`STORAGE_PROVIDER=S3`)
5. Mention E2E tests: `cd apps/web && npm run test:e2e`

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| `POST /api/auth/google` returns 500 | API not running on 3001 | Start `cd apps/api && npm run dev` |
| `GET /api/feed/dashboard` returns 500 | DB schema out of date | `cd apps/api && npx prisma migrate deploy` |
| Episode 4 not in dropdown | Not enough slots created | Edit series → increase **Number of Episodes** to ≥ 4 |
| Upload fails | File too large | Videos max 200 MB; check category limits |
| Learning Paths missing from sidebar | Feature flag off | Admin → Settings → enable Learning Paths |
| Google auth domain error | Wrong email domain | Must use `@tothenew.com` |

---

## Related Docs

| Doc | Contents |
|-----|----------|
| [`complete-go-through.md`](./complete-go-through.md) | Full development history & architecture |
| [`roles-and-permissions.md`](./roles-and-permissions.md) | RBAC matrix & role workflows |
| [`demo-ready-phase.md`](./demo-ready-phase.md) | Demo-ready integration checklist |
| [`project-build-summary.md`](./project-build-summary.md) | Build analysis & file map |

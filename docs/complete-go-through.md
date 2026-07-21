# KnowledgeHub — Complete Development Go-Through

> Internal corporate learning platform for `@tothenew.com` employees.  
> Monorepo: `/home/eram/Documents/TTNP/Learning_TTN`

**Last updated:** July 18, 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & URLs](#tech-stack--urls)
3. [How to Run Locally](#how-to-run-locally)
4. [Backend — Phases & Features](#backend--phases--features)
5. [Frontend — Pages & Features](#frontend--pages--features)
6. [Aspire Theme Adoption](#aspire-theme-adoption)
7. [Layout & Home Page Redesign](#layout--home-page-redesign)
8. [Bug Fixes & Infrastructure](#bug-fixes--infrastructure)
9. [Environment Configuration](#environment-configuration)
10. [Architecture Notes](#architecture-notes)
11. [Key Files Reference](#key-files-reference)
12. [Pending / Follow-Up](#pending--follow-up)

---

## Project Overview

**KnowledgeHub** is a monorepo learning platform with:

- **Web app** (`apps/web`) — Next.js 16, React 19, Ant Design 6
- **API** (`apps/api`) — NestJS, Prisma, PostgreSQL
- **Shared types** (`packages/types`)
- **Docker** — PostgreSQL, optional Elasticsearch (`docker/docker-compose.yml`)

Design is aligned with **nw-aspire-client** (`/home/eram/Documents/TTNP/nw-aspire-client`): purple/pink brand, Aspire SCSS globals, Ant Design with custom overrides.

---

## Tech Stack & URLs

| Layer | Technology |
|-------|------------|
| Web | Next.js 16 (App Router), React 19, TypeScript |
| API | NestJS 11, Prisma 6, PostgreSQL |
| UI | Ant Design 6, `@ant-design/icons`, SCSS, Tailwind v4 (minimal) |
| State | Zustand (auth, theme), React Query, Redux Toolkit |
| Auth | Google OAuth, JWT access + refresh cookies |
| Search | PostgreSQL FTS (default) or Elasticsearch (optional) |
| Notifications | In-app, email (console/SMTP), browser push (web-push) |
| Monorepo | pnpm workspace + Turbo |

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Swagger | http://localhost:3001/api/v1/docs |
| Elasticsearch (optional) | http://localhost:9200 |

---

## How to Run Locally

```bash
# 1. Start database (and optional Elasticsearch)
docker compose -f docker/docker-compose.yml up -d

# 2. Install & DB setup
npx pnpm@9.15.4 install
npx pnpm@9.15.4 db:generate
npx pnpm@9.15.4 db:migrate
npx pnpm@9.15.4 db:seed

# 3. API
npx pnpm@9.15.4 --filter @knowledgehub/api dev

# 4. Web (polling avoids ENOSPC file-watch limit on Linux)
cd apps/web && WATCHPACK_POLLING=true npx pnpm dev
```

---

## Backend — Phases & Features

### Core platform (Phases 2–5)

Documented in `docs/architecture/phase-2.md` through `phase-5.md`:

- Google sign-in, JWT auth, refresh tokens, RBAC (USER / TEAM / ADMIN)
- Videos, series, meets, taxonomy (competencies, categories)
- Engagement: comments, bookmarks, watch history, continue watching
- Team upload workflow + admin approvals
- Admin: users, roles, announcements, overview
- Local/S3 storage adapters
- Home feed, library, watch pages

### Phase 6 — Search, Explore, Recommendations, Notifications, Analytics

See `docs/architecture/phase-6.md`.

**Search (PostgreSQL FTS)**

- Migration: `20260718131500_add_fts_search`
- Generated `search_vector` columns + GIN indexes on videos, meets, series
- `GET /search` — full-text search with filters and pagination
- `GET /search/suggestions` — autocomplete

**Explore**

- `GET /explore` — competency hub with counts and featured content

**Recommendations**

- `GET /feed/recommendations` — personalized + trending fallback
- `GET /feed/related/:contentType/:id` — related content on detail pages

**Notifications**

- Inbox, unread count, mark read / mark all read
- Approval approve/reject sends uploader notifications
- Delivery via `NotificationDeliveryService` (in-app + email + push)

**Analytics**

- `GET /admin/analytics?days=30` — content, engagement, user metrics

### Phase 6.1 — Elasticsearch, Email, Push, Cron, Charts

**Elasticsearch**

- Docker service in `docker/docker-compose.yml`
- Adapter pattern: `SEARCH_PROVIDER=postgres|elasticsearch`
- `SearchIndexService` syncs on video approve/reject
- `POST /admin/search/reindex` for full reindex
- Falls back to Postgres FTS when ES is unavailable

**Email**

- `MAIL_PROVIDER=console|smtp`
- Module: `apps/api/src/modules/mail/`
- Nodemailer for SMTP (CJS-compatible import)

**Browser push**

- `PUSH_PROVIDER=console|webpush`
- Module: `apps/api/src/modules/push/`
- Service worker: `apps/web/public/sw.js`
- VAPID keys via env; enable from notification bell

**Meet publish notifications**

- `@nestjs/schedule` cron is registered but **no-op** (recorded-session model)
- `MEET_PUBLISHED` notifications when admin or approval flow publishes a meet recording
- Migration: `20260718143000_push_and_meet_reminders` (legacy reminder columns; cron disabled)

**Charts**

- `@ant-design/plots` on `/admin/analytics`
- Component: `apps/web/src/components/admin/AnalyticsCharts.tsx`

### Auth fix — Refresh token cookie

**Problem:** `POST /api/auth/refresh` returned `401 Refresh token missing`.

**Cause:** Cookie path was `/api/v1/auth` but the browser calls `/api/auth/*` via the Next.js proxy.

**Fix:** Cookie path set to `/api/auth` in `apps/api/src/modules/auth/auth.controller.ts` (`REFRESH_COOKIE_PATH`).

---

## Frontend — Pages & Features

### Auth

| Route | Description |
|-------|-------------|
| `/login` | Aspire-inspired split-pane login (gradient left, form right, Google CTA) |

Files: `apps/web/src/app/(auth)/login/page.tsx`, `login.scss`

### Main app routes

| Route | Description |
|-------|-------------|
| `/` | Home — welcome, featured series, content rows |
| `/explore` | Competency browse hub |
| `/search` | FTS search with filters (`?q=` from header) |
| `/watch/[id]` | Video player, comments, related sidebar |
| `/series`, `/series/[id]` | Series list and detail |
| `/meets`, `/meets/[id]` | Meets list and detail |
| `/library` | Continue watching, bookmarks, history |

### Team routes

| Route | Role | Description |
|-------|------|-------------|
| `/team/upload` | TEAM+ | Upload drafts, submit for approval |

### Admin routes

| Route | Role | Description |
|-------|------|-------------|
| `/admin` | ADMIN | Overview dashboard |
| `/admin/analytics` | ADMIN | Stats + charts |
| `/admin/approvals` | ADMIN | Pending video approvals |
| `/admin/announcements` | ADMIN | CRUD announcements |
| `/admin/users` | ADMIN | Role assignment |

### Shared hooks (examples)

- `useSearch`, `useNotifications`, `useRecommendations`
- `useHomeFeed`, `useContent`, `useAdmin`, `useTaxonomy`
- `usePushNotifications`

### Types

Shared in `packages/types/src/` — search, notifications, analytics, recommendations, content, auth, etc.

---

## Aspire Theme Adoption

KnowledgeHub was restyled to match **nw-aspire-client** base theme.

### Design tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2E1C41` | Headings, nav labels |
| Secondary | `#DE1186` | CTAs, active states, accents |
| Background | `#FAFAFA` | Main content area |
| Font | Poppins | Global via `next/font/google` |

Source: `apps/web/src/styles/common/_variables.scss`, `apps/web/src/app/globals.scss`

### ThemeProvider

- Ant Design `colorPrimary: #DE1186` (replaced earlier violet `#7c3aed`)
- Light Aspire shell — white header/sidebar, grey content background
- File: `apps/web/src/components/ThemeProvider.tsx`

### Global SCSS (from Aspire)

Loaded via `globals.scss` (~3000 lines):

- `.primaryButton` / `.secondaryButton` — pink gradient CTAs
- `.aspire-h40` / `.aspire-h45` — standard control heights
- `.aspire-custom-table` / `.aspire-custom-pagination` — table styling
- `.custom-sider-menu` — sidebar with pink left-border active state
- `.sidebar_footer` — TTN favicon + copyright
- `.ant-modal-*` — modals with pink title underline
- `.page_header`, `.inner_heading`, `.pink-border` — page title patterns
- Fixed header (66px), `layout_container`, `main_content`

### Shared UI components

| Component | Path | Purpose |
|-----------|------|---------|
| `AspireButton` | `components/ui/AspireButton.tsx` | Wraps Ant Button with `primaryButton`/`secondaryButton` |
| `AspireModal` | `components/ui/AspireModal.tsx` | Modal with Aspire OK/Cancel button classes |
| `LoadingOverlay` | `components/ui/LoadingOverlay.tsx` | Full-screen loading |

`AspireButton` uses `aspireVariant="primary"|"secondary"` (not `variant`, to avoid Ant Design prop conflict).

### Shell components

| Component | Path | Aspire classes |
|-----------|------|----------------|
| `Header` | `components/layout/Header.tsx` | `header-logo`, logo sprite, search, avatar |
| `AppSidebar` | `components/layout/AppSidebar.tsx` | `custom-sider-menu`, `sidebar_footer` |
| `NotificationBell` | `components/layout/NotificationBell.tsx` | In-header dropdown |

### Pages updated to Aspire patterns

- Admin: announcements, approvals, users, analytics
- Team upload
- Home, explore, search, meets, series, library
- Comments, bookmarks, featured CTA buttons
- Tables use `aspire-custom-table` class where applicable

### Assets copied from Aspire

`apps/web/assets/`:

- `svg/logo.svg`, `arrow_prev.svg`
- `images/favicon.ico`, `Loader.gif`, `login_logo.png`, `ttn_logo.png`

---

## Layout & Home Page Redesign

### Three-column app shell

```
┌─────────────────────────────────────────────────────────────┐
│  Header (fixed) — logo | search | notifications | avatar    │
├──────────┬────────────────────────────────────┬───────────────┤
│  Left    │  Main content                      │  Right panel  │
│  sidebar │  (page routes)                     │  (global)     │
│  ~18%    │  flex 1                            │  ~18%         │
│          │                                    │               │
│  Nav     │  Welcome, featured, content rows   │  Competencies │
│  menu    │                                    │  Announcements│
│          │                                    │               │
│  Footer  │                                    │               │
└──────────┴────────────────────────────────────┴───────────────┘
```

**Files:**

- `apps/web/src/app/(app)/layout.tsx` — `layout_container layout_container--three-col`
- `apps/web/src/components/layout/AppRightPanel.tsx` — new right partition
- `apps/web/src/styles/knowledgehub.scss` — `.right_panel`, layout overrides

Right panel hides below **1280px** width.

### Header profile

- **Header:** avatar image only (no name, no chevron)
- **Dropdown:** name + email at top, then Sign out

### Home page (`/`)

**Before → After:**

| Before | After |
|--------|-------|
| Small `page_header` welcome (1rem) | Large `kh-home__welcome-block` (~1.75–2.25rem) |
| Image hero banner (`HeroBanner`) | Text-only `FeaturedSection` card |
| Competencies + announcements at page bottom | Moved to global right panel |
| Violet/dark streaming-style accents | Aspire pink/purple on light background |

**`FeaturedSection`** (`components/home/FeaturedSection.tsx`):

- White card with tag, title, subtitle, progress bar, CTA
- No background image
- Uses mock data from `lib/mock/home-content.ts`

**Removed:** `components/home/HeroBanner.tsx`

### Right panel contents

- `CompetencyGrid` with `variant="panel"` — vertical chip list, “View all” link
- `AnnouncementsPanel` with `variant="panel"` — compact announcement cards

---

## Bug Fixes & Infrastructure

### Build failures (disk full)

- Root cause: disk ~99% full; build failed writing to `dist/`
- **Fixes:**
  - Root `build` runs `pnpm db:generate` first
  - API `build` runs `prisma generate && nest build`
  - CJS imports: `import * as nodemailer`, `import * as webpush`

### Disk cleanup (~28 GB freed)

- Emptied Trash (~27 GB)
- Cleared Docker unused volumes, puppeteer/prisma/playwright/TS caches
- npm/pnpm prune
- `/home` went from **2 GB free (99%)** → **~30 GB free (82%)**

### Dev server restart

- API and web restarted on ports 3001 / 3000
- Web required killing stale process on port 3000 (`EADDRINUSE`)
- API logs Elasticsearch warning when ES is not running (expected; Postgres fallback works)

### Database migration errors

If API logs mention missing columns (e.g. `reminder_day_sent_at`, `difficulty`, `video_id` on `knowledge_meets`):

**Fix:** `cd apps/api && npx prisma migrate deploy && npx prisma generate`

---

## Environment Configuration

### Web — `apps/web/.env.local` (correct)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### Root `.env.local` (incorrect for this project)

```env
NEXT_PUBLIC_API_URL=http://localhost:8090/api   # ← wrong
```

Use `apps/web/.env.local`, not the root file.

### API — `apps/api/.env`

```env
PORT=3001
DATABASE_URL=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...

# Optional
SEARCH_PROVIDER=postgres          # or elasticsearch
MAIL_PROVIDER=console             # or smtp
PUSH_PROVIDER=console             # or webpush
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

See `apps/api/.env.example` for full list.

### Browser → API proxy

- Browser calls `/api/*`
- Next.js proxies to `localhost:3001/api/v1` (`apps/web/next.config.ts`)
- Refresh cookie path: `/api/auth`

---

## Architecture Notes

### RBAC

- Google sign-in creates USER by default
- ADMIN / TEAM assigned at `/admin/users`
- Seed content user: `knowledgehub-seed@tothenew.com` (not for login)

### Search provider adapter

```
SearchService
  ├── PostgresSearchAdapter (default)
  └── ElasticsearchSearchAdapter (when SEARCH_PROVIDER=elasticsearch)
```

### Notification delivery flow

```
Event (e.g. approval) → NotificationsService.create()
  → NotificationDeliveryService
      ├── in-app (DB)
      ├── email (console/SMTP)
      └── push (console/web-push)
```

### Styling architecture

Hybrid — not pure Tailwind or pure Ant Design:

1. **SCSS globals** — Aspire theme, Ant overrides (`globals.scss`)
2. **BEM `kh-*`** — page-specific KnowledgeHub styles (`knowledgehub.scss`)
3. **Ant Design ConfigProvider** — runtime tokens (`ThemeProvider.tsx`)
4. **Tailwind v4** — minimal utility usage

---

## Key Files Reference

### Backend modules (Phase 6+)

| Area | Path |
|------|------|
| Search | `apps/api/src/modules/search/` |
| Notifications | `apps/api/src/modules/notifications/` |
| Mail | `apps/api/src/modules/mail/` |
| Push | `apps/api/src/modules/push/` |
| Jobs / cron | `apps/api/src/modules/jobs/` |
| Analytics | `apps/api/src/modules/admin/analytics.service.ts` |
| Recommendations | `apps/api/src/modules/feed/recommendations.service.ts` |
| Auth cookie fix | `apps/api/src/modules/auth/auth.controller.ts` |

### Migrations

| Migration | Purpose |
|-----------|---------|
| `20260717193517_init` | Initial schema |
| `20260718131500_add_fts_search` | FTS search vectors |
| `20260718143000_push_and_meet_reminders` | Push subscriptions + meet reminders |

### Frontend — layout & theme

| File | Purpose |
|------|---------|
| `apps/web/src/app/(app)/layout.tsx` | Three-column shell |
| `apps/web/src/components/layout/Header.tsx` | Aspire header |
| `apps/web/src/components/layout/AppSidebar.tsx` | Left nav |
| `apps/web/src/components/layout/AppRightPanel.tsx` | Right partition |
| `apps/web/src/components/ThemeProvider.tsx` | Ant Design tokens |
| `apps/web/src/app/globals.scss` | Aspire global styles |
| `apps/web/src/styles/knowledgehub.scss` | KH-specific + layout |
| `apps/web/src/styles/common/_variables.scss` | Color tokens |

### Frontend — home & UI

| File | Purpose |
|------|---------|
| `apps/web/src/app/(app)/page.tsx` | Home page |
| `apps/web/src/components/home/FeaturedSection.tsx` | Featured series card |
| `apps/web/src/components/home/CompetencyGrid.tsx` | Competencies (default + panel) |
| `apps/web/src/components/home/AnnouncementsPanel.tsx` | Announcements (default + panel) |
| `apps/web/src/components/ui/AspireButton.tsx` | Themed buttons |
| `apps/web/src/components/ui/AspireModal.tsx` | Themed modals |
| `apps/web/src/app/(auth)/login/page.tsx` | Aspire login |
| `apps/web/public/sw.js` | Push notification service worker |

---

## Pending / Follow-Up

| Item | Action |
|------|--------|
| DB migration | Run `cd apps/api && npx prisma migrate deploy` if API reports missing columns |
| Elasticsearch | `docker compose up -d elasticsearch`, set `SEARCH_PROVIDER=elasticsearch`, `POST /admin/search/reindex` |
| VAPID keys | `npx web-push generate-vapid-keys` for real browser push |
| Root `.env.local` | Remove or fix wrong `NEXT_PUBLIC_API_URL` |
| HomepageSection admin UI | Not built yet |
| FCM/APNs native push | Deferred |
| Email digests | Deferred |
| Shadcn migration | Deferred |
| S3 prod storage | Configure when deploying |
| Dark mode toggle | Removed in Aspire alignment; `useThemeStore` still exists but unused in header |

---

## Quick Command Reference

```bash
# Migrations
npx pnpm@9.15.4 db:migrate
npx pnpm@9.15.4 db:seed

# Typecheck
npx pnpm@9.15.4 --filter @knowledgehub/web exec tsc --noEmit
npx pnpm@9.15.4 --filter @knowledgehub/api exec tsc --noEmit

# Build
npx pnpm@9.15.4 build

# Kill stuck dev ports
fuser -k 3000/tcp 3001/tcp

# Elasticsearch (optional)
docker compose -f docker/docker-compose.yml up -d elasticsearch
```

---

## Related Docs

- `docs/architecture/phase-2.md` — Auth, users, RBAC
- `docs/architecture/phase-3.md` — Content, taxonomy, storage
- `docs/architecture/phase-4.md` — Engagement, feed
- `docs/architecture/phase-5.md` — Admin, team workflow
- `docs/architecture/phase-6.md` — Search, notifications, analytics, Phase 6.1

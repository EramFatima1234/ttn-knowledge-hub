# KnowledgeHub MVP Cleanup Report

**Date:** 2026-07-21  
**Branch:** `cursor/mvp-feature-trim` (commit `bac3dc5` + follow-up fixes)

## Objective

Trim KnowledgeHub to a **demo-ready MVP** for the AI Capability Exercise: keep auth, RBAC, learner flows, CMS, search, bookmarks, learning journey, and KnowledgeHub AI; remove analytics/reporting/notification-center and other non-essential admin surfaces.

---

## Features removed

| Area | Removed |
|------|---------|
| Reports | `/admin/reports`, `CmsReportsPage`, `GET /admin/reports` |
| Analytics dashboard | `/admin/analytics`, `AnalyticsCharts`, `GET /admin/analytics`, `AnalyticsService` |
| Search analytics (admin) | `/admin/search-analytics`, `GET /admin/search/analytics` |
| Homepage builder UI | `/admin/homepage-builder`, admin homepage layout hooks |
| Notification center | Header bell, `NotificationBell`, client notification/push hooks, REST ` /notifications/*` |
| Advanced settings UI | Email templates, feature flags, notification toggles on `/admin/settings` |
| Experimental dashboards | Unused `AdminDashboard`, `TeamDashboard`, `UserDashboard`, `usePhase8` mock layer |
| Admin session feedback API | `GET /admin/feedback/recent` (only consumed by removed team dashboard) |

**Kept (MVP):** Google OAuth, RBAC, home/explore/meets/series/library/watch/search/bookmarks/progress, AI, admin CMS CRUD, platform hub (users + approvals), basic settings, announcements admin, backend notification **delivery** (no inbox UI).

---

## Files deleted (32 in primary commit)

See `git show bac3dc5 --stat`. Notable paths:

- `apps/web/src/app/(app)/admin/{analytics,reports,search-analytics,homepage-builder}/`
- `apps/web/src/components/{admin/AnalyticsCharts,layout/NotificationBell}.tsx`
- `apps/web/src/hooks/{useNotifications,usePushNotifications,usePhase8}.ts`
- `apps/web/src/lib/mock/phase8.ts`
- `apps/web/src/features/admin-cms/reports/CmsReportsPage.tsx`
- `apps/web/src/features/phase8/dashboards/{Admin,Team,User}Dashboard.tsx`
- `apps/api/src/modules/admin/analytics.service.ts`
- `apps/api/src/modules/notifications/notifications.controller.ts`

---

## Routes removed (web)

| Route |
|-------|
| `/admin/analytics` |
| `/admin/reports` |
| `/admin/search-analytics` |
| `/admin/homepage-builder` |

---

## API endpoints removed

| Method | Route |
|--------|-------|
| GET | `/admin/analytics` |
| GET | `/admin/reports` |
| GET | `/admin/search/analytics` |
| GET | `/admin/feedback/recent` |
| GET | `/notifications` |
| GET | `/notifications/unread-count` |
| PATCH | `/notifications/:id/read` |
| POST | `/notifications/read-all` |

**Still available:** `GET /admin/overview`, search logging (`SearchAnalyticsRepository` for learner search), `GET/PUT /admin/cms/homepage`, push/mail adapters for server-side delivery.

---

## Components / hooks removed

- `NotificationBell`, `AnalyticsCharts`, `CmsReportsPage`
- `useNotifications`, `usePushNotifications`, `useAdminAnalytics`, `useCmsReports`, `usePhase8` (entire module)
- Phase 8 role dashboards (unused; home uses `HomeDashboard`)

---

## Navigation updates

- Admin sidebar: removed **Reports**; retained Dashboard, Content, Catalog, Platform, Settings.
- Header: removed notification bell.
- Admin quick actions: removed reports, homepage builder, announcements shortcuts (announcements page remains at `/admin/announcements`).

---

## Database changes

**None.** Tables (`Notification`, `SearchQueryLog`, `AuditLog`, `HomepageSection`, etc.) remain for backend/seed compatibility. No migrations run.

---

## Packages removed

| Package | App |
|---------|-----|
| `@ant-design/plots` | `apps/web` |

**Added:** `dayjs` as a direct `apps/web` dependency (previously hoisted via plots; required by Ant Design `DatePicker` in CMS/team meet forms).

---

## Documentation updated

- `README.md`, `api-contract.md`, `docs/api-contract.md`
- `implementation-plan.md`, `requirements-analysis.md`, `docs/acceptance-criteria.md`, `reflection.md`

---

## Lines of code (approximate)

| Metric | Value |
|--------|--------|
| Primary cleanup commit | **~1,979 lines deleted**, 11 inserted (`git show bac3dc5 --stat`) |
| Share of tracked app TS/TSX (~33.8k lines pre-trim) | **~6%** reduction in application source (excluding lockfile/docs) |

---

## Build / verification

- Run: `npx pnpm@9.15.4 install && npx pnpm@9.15.4 build`
- E2E: `cd apps/web && pnpm test:e2e` (with API + web dev servers)

---

## Remaining technical debt

1. **Prisma models without UI:** `AuditLog`, optional `LearningPath` / `Like` — consider future migration or formal deprecation.
2. **Homepage sections:** No admin UI; layout still served via API/seed (`GET /homepage/layout`).
3. **Push REST API:** Endpoints remain; no web client after notification center removal.
4. **In-app notifications:** Still created server-side; no learner inbox.
5. **Large docs tree:** `docs/project-build-summary.md` still describes removed features — trim in a follow-up or regenerate from code.
6. **Client-heavy app shell / RSC migration** — unchanged (see `docs/performance-report.md`).

---

## MVP feature checklist (retained)

Authentication, RBAC, Home, Explore, Knowledge Meets/Series, Library, Watch, Search, Bookmarks, Learning Journey, KnowledgeHub AI, Admin dashboard, CMS (meets/series/resources/catalog), user management, basic settings, validation, error handling, React Query, API integration, documentation, Playwright e2e scaffold.

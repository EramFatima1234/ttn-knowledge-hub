# Architecture & Implementation Decisions

Decision log for KnowledgeHub. Format: **context → decision → consequences**.

> **Canonical ADRs (ADR-001–010):** [`../adr/`](../adr/) — Next.js, NestJS, PostgreSQL, React Query, Ant Design, URL media, Content Manager, Learning Journey, Gemini, Homepage metadata.  
> **Index:** [`docs/README.md`](./README.md)

---

## ADR-001 — Monorepo with pnpm and Turbo

**Context:** Web and API share types and release cadence.  
**Decision:** Single repo with `apps/web`, `apps/api`, `packages/types`, orchestrated by Turbo.  
**Consequences:** Run `pnpm dev` at root; shared types must be built when changed manually.

---

## ADR-002 — Google OAuth + JWT for internal employees

**Context:** No password auth; restrict to company domain.  
**Decision:** Google sign-in, `ALLOWED_EMAIL_DOMAIN`, access JWT + refresh cookie flow.  
**Consequences:** `GOOGLE_CLIENT_ID` required on API and web; new users auto-assigned `USER` role.

---

## ADR-003 — RBAC with permissions table

**Context:** Admins need fine-grained capabilities beyond a single admin flag.  
**Decision:** `roles`, `permissions`, `user_roles`, `role_permissions` in Prisma; Nest `RolesGuard` + `PermissionsGuard`.  
**Consequences:** Seed defines slugs like `content:approve`; document matrix in `docs/roles-and-permissions.md`.

---

## ADR-004 — Provider adapters for infrastructure

**Context:** Local dev must work without AWS/ES/SMTP.  
**Decision:** Env switches: `STORAGE_PROVIDER`, `SEARCH_PROVIDER`, `MAIL_PROVIDER`, `PUSH_PROVIDER`, `AI_PROVIDER`.  
**Consequences:** Console/no-op providers for dev; production requires explicit credentials (never committed).

---

## ADR-005 — Phase 7 streaming and progress

**Context:** Basic video tag insufficient for resume and series autoplay.  
**Decision:** Dedicated playback + stream endpoints with HTTP Range; progress module for streaks, completion, continue watching.  
**Consequences:** `VideoPlayer`, `MiniPlayer`, progress APIs must stay in sync with watch UI.

---

## ADR-006 — Aspire theme and three-column layout

**Context:** Rebrand to pink/purple Aspire look; Netflix-style browsing.  
**Decision:** SCSS in `knowledgehub.scss`, three-column shell with optional right assistant panel.  
**Consequences:** Global CSS must not target bare `header`/`aside`; dark mode deliberately dropped.

---

## ADR-007 — Right sidebar as learning assistant

**Context:** Replace generic announcements with personalized widgets.  
**Decision:** `RightSidebar` with progress, meets, competencies, bookmarks; mix of API + mock fallbacks.  
**Consequences:** `useRightSidebar` hooks; lazy-load panel when open for performance.

---

## ADR-008 — URL-based CMS metadata (2026-07)

**Context:** Content often hosted on YouTube/Vimeo/external CDN.  
**Decision:** CMS fields for media URLs, previews, `homepageTags`, `displayPriority`; `HomepageFeedService` consumes tags.  
**Consequences:** Migration `20260720143000_cms_url_metadata` (and related); embed-aware `VideoPlayer`.

---

## ADR-009 — Recorded knowledge meets (not live events)

**Context:** Product pivot from scheduled events to library of recordings.  
**Decision:** Admin meet forms emphasize recording URL and publish workflow; learner meets library + watch flow.  
**Consequences:** Removed or de-emphasized event datetime fields in UX; API DTOs aligned in `admin-cms`.

---

## ADR-010 — Learning paths deprioritized

**Context:** Phase 7 shipped learning-path API/UI; later product decision to remove learner journey.  
**Decision:** Remove web routes and API surface from active `src/`; **retain** Prisma models until a migrate-or-drop decision.  
**Consequences:** Docs must not promise `/learning-paths`; grep schema before re-implementing.

---

## ADR-011 — Performance optimizations without UX change (2026-07-20)

**Context:** Measurable latency and bundle cost on authenticated pages.  
**Decision:** Defer notifications full fetch until open; dynamic imports for AI FAB, mini player, watch sections; reduce font weights.  
**Consequences:** Documented in `docs/performance-report.md`; larger wins (RSC, API merge) explicitly deferred.

---

## ADR-012 — Ant Design 6 upgrade path

**Context:** Ant Design 5 → 6 breaking prop renames.  
**Decision:** Standardize on `Alert` `title`, `Drawer` `size`; audit tables for invalid React components in columns.  
**Consequences:** Ongoing grep/fix pass; see `.cursor/rules/frontend.mdc`.

---

## ADR-013 — AI via Gemini

**Context:** In-app assistant for content Q&A and suggestions.  
**Decision:** `AI_PROVIDER=gemini` with `GEMINI_API_KEY` and model env; noop provider when unset.  
**Consequences:** `docs/gemini-setup.md`; distinguish API key from OAuth client ID (`gemini-key.util.ts`).

---

## ADR-014 — Next.js standalone output

**Context:** Container deployment for web.  
**Decision:** `output: "standalone"` in `next.config.ts` with API rewrites for `/api`, `/storage`, `/uploads`.  
**Consequences:** Deploy standalone Node bundle; set `NEXT_PUBLIC_API_URL` per environment.

---

## Rejected / deferred

| Idea | Reason |
|------|--------|
| Full Server Components for app shell | High risk, limited incremental win (perf report) |
| Merging dashboard + recommendations API | Needs product/API contract design |
| Native mobile push (FCM/APNs) | Web push only for now |
| Dark mode | Removed during Aspire alignment |

---

*When you make a significant architectural choice, append a new ADR section here and link from `AI_CONTEXT.md`.*

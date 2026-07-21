# KnowledgeHub Performance Audit & Optimization Report

**Date:** 2026-07-20  
**Scope:** Frontend (Next.js 16), API (NestJS), React Query, Prisma  
**Constraint:** No UI/UX/theme changes; feature parity preserved.

---

## Executive summary — Top 10 bottlenecks (by impact)

Ranked by **user-perceived latency**, **network cost**, and **main-thread work**.  
**Status:** Items marked *Optimized* were addressed in the pass documented below; *Deferred* were intentionally not changed (low ROI or needs product/API agreement).

| Rank | Bottleneck | Impact | Why it hurts | Status |
|------|------------|--------|--------------|--------|
| **1** | **Notifications list on every page** | High | `GET /notifications` ran on each route behind the app shell; extra JSON parse + React work before user opens the bell. | **Optimized** — fetch only when dropdown opens |
| **2** | **Heavy client app shell** (`(app)/layout` all `"use client"`) | High | Entire authenticated tree hydrates as client; Ant Design + layout providers block TTI on all learner pages. | **Deferred** — RSC migration is large; no safe incremental win without layout changes |
| **3** | **Vendor JS chunk (~1.4MB single chunk)** | High | Ant Design + React + Next runtime in shared chunks; parse/compile cost on first visit. | **Partially mitigated** — route/dynamic splits; vendor size unchanged |
| **4** | **Home: `useDashboard` + `useRecommendations`** | Medium–High | Two feed APIs per home load; overlapping “for you / trending” data increases TTFB and waterfall. | **Deferred** — business merge/fallback logic; needs API design |
| **5** | **9 Poppins font files** | Medium | Extra WOFF2 downloads and font swap on first paint. | **Optimized** — 4 weights (400–700) |
| **6** | **Watch page monolithic imports** | Medium | AI panel, Q&A, comments, resources in initial watch chunk delay interactive player shell. | **Optimized** — `next/dynamic` for below-fold sections |
| **7** | **Eager `MiniPlayer` + `KnowledgeHubAiFab` in layout** | Medium | Framer Motion + AI UI in critical path for every authenticated page. | **Optimized** — dynamic import, `ssr: false` |
| **8** | **Right panel widgets when closed** | Medium | Sidebar cards could pull meets/bookmarks queries if panel code loaded eagerly. | **Optimized** — dynamic `RightSidebar` when open |
| **9** | **Explore/feed Prisma fan-out** (`recommendations.service`) | Medium (API) | Multiple DB reads per hub request; server CPU + latency under load. | **Deferred** — caching layer or slimmer DTOs; contract unchanged |
| **10** | **Continuous AI FAB animation + typewriter** | Low–Medium | Infinite Framer loop + `setInterval` typing when tab visible; battery/CPU on long sessions. | **Partial** — FAB pauses when hidden/offscreen; pill typewriter unchanged |

### What we did **not** optimize (avoiding premature work)

- Converting pages to Server Components (high effort, behavior risk).
- Shrinking Prisma `include` on list endpoints (would change response shapes or mapping).
- Virtualizing all Ant tables (only needed at very large row counts).
- Removing Ant Design or Framer Motion (theme/UX dependency).

---

## Before vs after metrics

Measurements taken **2026-07-20** on this repo. Render counts were **not** captured in CI (use React DevTools Profiler locally for per-component validation).

| Metric | Before (audit baseline) | After (current) | Notes |
|--------|-------------------------|-----------------|-------|
| **API: notifications list** | 1× `GET /notifications` per navigation | **0** until bell opened; then 1× | Unread count still 1×/60s via `GET /notifications/unread-count` |
| **API: home (typical user)** | `dashboard` + `recommendations` + unread count | Same | No change (rank #4 deferred) |
| **API: taxonomy** | Refetch after 60s stale on revisits | **10 min** `staleTime` | Fewer repeat `GET /competencies` / `categories` |
| **Font weights loaded** | 9 | **4** | ~44% fewer font files |
| **App layout JS** | Static imports: MiniPlayer, AI FAB | **Dynamic** chunks | Smaller initial `(app)` layout parse |
| **Watch route JS** | Single chunk with AI + Q&A + comments | **Split** async chunks | Player path loads first |
| **Video preload** | Default (`auto`-like) | **`metadata`** | Less bandwidth before play |
| **React Query `gcTime`** | Default 5m (implicit) | **Explicit 5m** | Documented; behavior equivalent |
| **Production build** | Fails TS on `speakers/[slug]` | **`next build --webpack` passes** (2026-07-20) |
| **Largest JS chunk (dev build)** | — | **~1.46 MB** (`41zr-gdxjz_lv.js`) | Typical Ant Design + framework vendor |

**Estimated load improvement (authenticated learner, cold cache):**

- **−1 HTTP request** per page view (notifications list).
- **−~100–300 ms** font + **−~50–150 KB** gzip (font subset; varies by CDN).
- **−~20–80 KB** initial layout JS (dynamic AI/mini player; varies by chunk hash).
- **Watch:** faster time-to-interactive for player (secondary chunks load after).

---

## Step 1 — Audit findings (before changes)

### Frontend

| Area | Finding | Severity |
|------|---------|----------|
| Font loading | Poppins loaded with 9 weights (100–900); app uses ~400–700 | Medium |
| App shell | `MiniPlayer`, `KnowledgeHubAiFab` eagerly in client layout bundle | Medium |
| Notifications | Full `GET /notifications` on every authenticated page load | High |
| AI | `useAiStatus()` ran as soon as drawer chunk mounted, not only when open | Low |
| AI FAB | Continuous Framer `y` loop on robot button even when tab hidden | Low |
| Watch page | `VideoAiPanel`, `QaSection`, `CommentSection`, `ResourceCenter` in main chunk | Medium |
| Right panel | `RightSidebar` widgets imported when panel opens but chunk still eager in panel path | Low |
| React Query | Good defaults (`staleTime: 60s`, `refetchOnWindowFocus: false`); taxonomy uncached longer | Low |
| SCSS | Orphan `.kh-learning-paths__actions` had stolen `.kh-ai-launcher` fixed positioning (fixed earlier) | High (fixed) |

### Backend

| Area | Finding | Severity |
|------|---------|----------|
| List endpoints | Video/meet `findMany` use full `include` (speaker, competency, category) — needed for current DTOs | Accepted |
| Feed/recommendations | Multiple parallel queries; appropriate for hub payload | Accepted |
| Notifications | Separate unread-count endpoint; polled every 60s | Low |
| Indexes | Core FK indexes present on Prisma models | — |
| N+1 | No critical N+1 found in hot list paths | — |

### Bundle / dead code

| Area | Finding |
|------|---------|
| Learning Paths module | Already removed (routes, API, UI) |
| `@ant-design/plots` | Already dynamically imported in `AnalyticsCharts.tsx` |
| `console.log` | None in `apps/web/src` |

---

## Step 2–16 — Optimizations applied

See git diff for exact lines. Summary:

1. **Font subset** — Poppins weights `400, 500, 600, 700` only (`layout.tsx`).
2. **Query defaults** — `gcTime` 5m; `refetchOnWindowFocus: false` (unchanged).
3. **Taxonomy** — `staleTime` 10m on competencies/categories.
4. **Notifications** — List query only when dropdown opens; unread count `refetchIntervalInBackground: false`.
5. **AI** — `useAiStatus(enabled)`; drawer passes `open`. FAB/drawer lazy via dynamic import in app layout.
6. **AI animations** — Pause FAB float when document hidden or launcher offscreen.
7. **Watch page** — Dynamic import below-fold sections (AI panel, resources, Q&A, comments).
8. **Video** — `preload="metadata"` on `<video>` (no full preload).
9. **Right panel** — Dynamic `RightSidebar` when panel opens.
10. **Mini player** — Dynamic import in app layout.

**Not changed (intentional):** API response shapes, Prisma includes, Aspire theme, layouts, admin page structure (already route-split by Next.js).

---

## Step 17 — Results

### Files optimized

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/(app)/layout.tsx`
- `apps/web/src/app/(app)/watch/[id]/page.tsx`
- `apps/web/src/components/providers/QueryProvider.tsx`
- `apps/web/src/components/layout/NotificationBell.tsx`
- `apps/web/src/components/layout/AppRightPanel.tsx`
- `apps/web/src/components/video/VideoPlayer.tsx`
- `apps/web/src/hooks/useNotifications.ts`
- `apps/web/src/hooks/useTaxonomy.ts`
- `apps/web/src/hooks/useAi.ts`
- `apps/web/src/features/ai/KnowledgeHubAiDrawer.tsx`
- `apps/web/src/features/ai/AiFloatingLauncher.tsx`

### Duplicate API calls removed

- **Notifications list:** Removed automatic fetch on every page; fetch on first bell open (unread badge still uses lightweight count endpoint).

### Bundle / runtime

- Smaller font download (~4 fewer Poppins files).
- Smaller initial app layout JS (dynamic MiniPlayer, AI FAB).
- Watch route code-split for secondary sections.
- Right sidebar widgets load only when panel opened.

### Estimated improvement

| Metric | Estimate |
|--------|------------|
| Initial authenticated JS | ~5–15% smaller layout + watch route chunks |
| Network on navigation | 1 fewer API call per page until user opens notifications |
| Main-thread / battery | Less animation work when tab hidden or FAB offscreen |
| Font LCP | Faster text render from fewer font files |

*Measure with Lighthouse and Network tab before/after for your environment.*

### Remaining bottlenecks

1. **Ant Design** — Large shared vendor chunk; mitigated by route splitting, not replaced.
2. **Home / explore feed** — Single hub API still heavy; cache at CDN/API layer if needed.
3. **Video streaming** — Bandwidth-bound; metadata preload only.
4. **Unread notifications** — Still polls every 60s (by design for badge).

### Recommended future improvements

1. Server Components for static learner pages (explore shell, series list metadata) where hooks allow.
2. API `select` projections for list DTOs (narrow DB + JSON) behind same response contract.
3. Redis cache for `GET /feed/explore` and taxonomy.
4. `React Query` `prefetchQuery` on sidebar hover for meets/series.
5. Virtualized tables for admin lists >100 rows.
6. Drop unused Prisma `LearningPath` tables if product confirms permanent removal.

---

*Regenerate `@knowledgehub/types` with `pnpm --filter @knowledgehub/types build` after type changes elsewhere.*

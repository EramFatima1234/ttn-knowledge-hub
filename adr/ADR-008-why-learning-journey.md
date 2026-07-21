# ADR-008 — Why Learning Journey (Progress Experience)

**Status:** Accepted (evolved; formal Learning Paths removed)  
**Date:** 2026 (Phase 7, product update 2026-07)  
**Scope:** Learner progress

## Problem

Employees need continuity across sessions: resume playback, continue watching, weekly activity, bookmarks, and dashboard motivation — without maintaining a separate “learning path” product surface.

## Decision

Deliver **learning journey** through integrated progress features (not standalone `/learning-paths` routes):

- **API:** `progress` module — `GET /progress/summary`, `GET /progress/weekly-activity`, `GET/PUT /progress/playback-preferences`; engagement `GET/PUT /history`, `GET /history/continue-watching`.
- **Web:** Home dashboard widgets (`DashboardProgress`), library page, watch page resume, right sidebar `MyProgressCard`, mini player + autoplay preferences.
- **Data:** `History`, `WatchActivity`, `UserPlaybackPreference`, `Bookmark`.

**Explicitly removed:** Learning Path UI and API from active `src/`; Prisma models `LearningPath` / `LearningPathItem` retained until migrate-or-drop decision (`docs/AI_CONTEXT.md` ADR note).

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Full Learning Paths product | Deprioritized by product; schema kept for optional revival |
| SCORM/LMS import | Out of scope for internal hub MVP |
| Progress only in localStorage | Not cross-device |

## Tradeoffs

- **Pros:** Simpler UX; fewer routes; aligns with Netflix-style browse + watch.
- **Cons:** No curated multi-week paths in UI; docs must not promise `/learning-paths`.

## Future impact

- If product revives paths, reintroduce controllers and web routes with migration plan for existing schema.
- Speaker follow / ratings APIs still schema-only in places — see `PROJECT_HEALTH.md`.

## Traceability

| Layer | Location |
|-------|----------|
| API | `apps/api/src/modules/progress/`, `engagement/` |
| Web | `apps/web/src/app/(app)/library/page.tsx`, `components/home/DashboardProgress.tsx` |
| Docs | `architecture/learning-journey-flow.md` |

# Project Health Report

**Generated:** 2026-07-21  
**Scope:** `apps/web`, `apps/api`, `packages/*` (static analysis + codebase grep)

## Executive summary

KnowledgeHub is **feature-rich and production-shaped** with clear module boundaries. Main risks are **documentation drift** (legacy learning-path references), **large admin CMS service**, **client-heavy app shell**, and **schema features without public API** (likes, ratings, speaker follow).

## Unused components (heuristic)

Automated import-graph scan did not flag isolated components under `apps/web/src/components/` (all sampled components are referenced). **Manual review still recommended** when adding new UI.

## Unused hooks

**None detected** — all files in `apps/web/src/hooks/` appear imported elsewhere.

## Unused APIs

| Item | Notes |
|------|--------|
| Learning paths | Documented in older `project-build-summary.md` §18 but **no** `learning-paths` controller in `apps/api/src` |
| `Like` model | Prisma present; no dedicated engagement endpoint surfaced |
| `Rating` model | Prisma present; limited use (speaker avg may be computed without full CRUD API) |
| `SpeakerFollow` | Schema only; learner follow UI/API pending |

## Unused services

All Nest modules in `app.module.ts` are wired. **Dead code risk** inside `admin-cms.service.ts` (size) — split recommended, not removal.

## Unused assets

| Asset | Status |
|-------|--------|
| `apps/web/public/images/defaults/*.svg` | Used for CMS/thumbnail fallbacks |
| `apps/web/public/sw.js` | Service worker — verify push registration path in production |

No large unused `public/` media directories found.

## Unused dependencies

All major dependencies (`antd`, `@tanstack/react-query`, `framer-motion`, etc.) have imports in `apps/web/src`. Run `pnpm audit` periodically; no automated depcheck run in this report.

## Duplicate components

No duplicate **component names** across `apps/web/src` (same filename in different folders).

## Duplicate utilities

- API client centralized in `apps/web/src/lib/api.ts` — good.
- CMS table patterns shared via `features/admin-cms/components/` — avoid copying column defs into pages.

## Duplicate logic

- Feed endpoints (`/feed/home`, `/feed/dashboard`, `/feed/recommendations`) overlap in data — merge deferred per `docs/performance-report.md`.
- Homepage curation split between **localStorage builder** and **DB** `HomepageSection`.

## Circular dependencies

No circular dependency scan tool run; Nest module graph uses forwardRef only where existing code requires — **no new cycles introduced** in documentation pass.

## Deprecated APIs

| Area | Status |
|------|--------|
| Learning paths routes | **Removed** from web `src/`; E2E artifacts may still mention `/learning-paths` |
| Live meet reminders | Cron disabled; DB columns retained |
| `docs/project-build-summary.md` §18 | Lists `/learning-paths` — **stale** |

## Deprecated Ant Design / Next / React APIs

- Ant Design **6** migration ongoing — use `Alert` `title`, `Drawer` `size` (see `.cursor/rules/frontend.mdc`).
- Next.js: prefer App Router patterns; no Pages router in use.
- React 19 + React Compiler enabled in web package — follow existing component patterns.

## Large components / files

| Lines | File | Risk |
|------:|------|------|
| 1416 | `apps/api/src/modules/admin-cms/admin-cms.service.ts` | Maintainability |
| 575 | `apps/web/src/hooks/useAdminCms.ts` | Hook complexity |
| 360 | `apps/api/src/modules/videos/videos.repository.ts` | Query complexity |

## Performance risks

| Risk | Mitigation (existing or planned) |
|------|----------------------------------|
| Client-only `(app)/layout` | Documented; RSC deferred |
| ~1.4MB vendor chunk | Dynamic route splits applied |
| Dual home feed APIs | API merge TBD |
| Prisma heavy `include` on lists | Accepted for DTO parity |

## Security risks

| Risk | Mitigation |
|------|------------|
| Public `NEXT_PUBLIC_*` vars | No secrets in web env |
| JWT in memory | Refresh httpOnly cookie |
| Upload abuse | Storage limits + auth |
| Missing rate limits on auth | **Recommendation:** add gateway rate limiting |

## Technical debt

1. Homepage builder ↔ DB API alignment (ADR-010).
2. Stale docs referencing learning paths (`docs/roles-and-permissions.md`, `docs/project-build-summary.md` §18–19).
3. `LearningPath` Prisma models without product surface.
4. Speaker follow / likes / ratings APIs incomplete vs schema.
5. Playwright report artifacts committed under `apps/web/playwright-report/` (consider gitignore).

## Recommendations

1. **Docs:** Update `project-build-summary.md` API section to remove learning-path endpoints; point to `docs/api-contract.md`.
2. **Refactor:** Split `admin-cms.service.ts` by entity without behavior change.
3. **Product/API:** Implement or drop `Like`, `Rating`, `SpeakerFollow` models.
4. **CI:** Add `pnpm build` + Playwright smoke on PR.
5. **Perf:** Design merged home feed DTO when product agrees.
6. **Security:** Rate limit `POST /auth/google` and refresh.

## Suggested next engineering improvements

See `roadmap/technical-debt.md` and `docs/future-roadmap.md`.

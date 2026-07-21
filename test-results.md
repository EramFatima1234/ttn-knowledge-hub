# Test Results — KnowledgeHub

## Automated

| Suite | Location | Command | Notes |
|-------|----------|---------|-------|
| ESLint | Monorepo | `pnpm lint` | Per-package configs |
| Build | Monorepo | `pnpm build` | Includes `db:generate` |
| Playwright E2E | `apps/web/e2e/` | `pnpm test:e2e` | Requires web on :3000 and API on :3001 |

### Playwright scenarios (as implemented)

**`auth.spec.ts`**
- Login page shows “Welcome to KnowledgeHub” heading.
- `/` and `/meets` redirect unauthenticated users to `/login`.

**`navigation.spec.ts`**
- Public/login navigation and protected route behavior.

**`api.spec.ts`**
- API health and authenticated platform endpoints (see file for assertions).

## Last execution note

E2E is environment-dependent. Historical artifacts under `apps/web/playwright-report/` and `test-results/` may reflect local runs when the dev server was not up (`ERR_CONNECTION_REFUSED`). **Before submission:** run with both servers healthy and record pass/fail below.

## Manual smoke checklist (recommended)

| Step | Expected |
|------|----------|
| `GET /api/v1/health` | 200 `ok` |
| Google login | Redirect to `/` with session |
| Home load | Feed rows without console errors |
| Watch one video | Player loads, history updates |
| Admin CMS (if ADMIN) | List meets or series |

## Record your run

```
Date: 2026-07-21 (assessment doc pass)
Node version: (run `node -v` before submit)
pnpm lint result: Turbo ran; @knowledgehub/web (and types) OK; @knowledgehub/api failed — ESLint 9 expects eslint.config.js (see debugging-notes.md)
pnpm build result: (run before submit)
pnpm test:e2e result: (requires API :3001 + web :3000 — run before submit)
Tester notes: Update this block after a full local verification pass.
```

# AI Prompts — Implementation

## Objective

Fix operational bugs and dev workflow without changing product APIs or business rules.

## Prompt Summary

> "Restart servers; fix localhost loading and auth/google 500. Do not change UI/APIs unless necessary."

## AI Response Summary

- Diagnosed Prisma `P1001` and missing seed roles.
- Added `AuthProvider` hydration fallback.
- Updated `scripts/dev-restart.sh`, root `package.json` dev script.
- `users.repository.ts` — 503 when USER role missing.

## Accepted Suggestions

- Postgres-only Docker in restart script.
- `npm run dev` / `dev:webpack` fallback when pnpm unavailable.

## Rejected Suggestions

- Large refactors of `admin-cms.service.ts` during hotfix window.

## Reasoning

Minimal diffs reduce regression risk; assessment allows documenting implementation journey including fixes.

## Iteration History

1. Turbo dev thread exhaustion → split API/web processes.
2. Google login 500 → migrate + seed + API restart.
3. Explore page filter layout (search left, dropdowns right) — separate UX task, preserved.

# Testing Strategy

## Current coverage

| Layer | Tool | Location |
|-------|------|----------|
| Web E2E | Playwright | `apps/web/e2e/` |
| Lint | ESLint | per package `pnpm lint` |
| Typecheck | `tsc` / Next build | `pnpm build` |

## E2E scenarios

- Auth guard redirects (`e2e/auth.spec.ts`)
- Navigation / API health (`e2e/navigation.spec.ts`, `api.spec.ts`)

Run: `cd apps/web && pnpm test:e2e` (starts dev server unless `PLAYWRIGHT_SKIP_WEB_SERVER=1`).

## API testing

- Manual: Swagger `/api/v1/docs`
- Recommended: add Nest e2e tests per module for regressions (not yet comprehensive).

## React Query

Test hooks via component tests or E2E; invalidate keys on mutation in hook implementations.

## CI recommendation

Root `pnpm lint` + `pnpm build` + Playwright on PR.

See `.cursor/testing-guidelines.md`.

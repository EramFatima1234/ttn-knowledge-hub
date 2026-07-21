# Test Strategy — KnowledgeHub

## Test Scope

- **In scope:** Auth guards, public API health, critical learner navigation, build/lint gates, manual CMS smoke.
- **Out of scope (today):** Full Nest integration test suite, load testing, mobile browsers.

## Unit Tests

- Limited dedicated unit tests in repo; business logic primarily validated via TypeScript compile and manual flows.
- **Recommendation:** Unit test pure utilities (`encryption`, CMS status helpers) in follow-up.

## Component Tests

- Not extensively used; Ant Design + React Query components validated via E2E and manual QA.
- **Recommendation:** React Testing Library for `ProtectedRoute` and auth hydration edge cases.

## Integration Tests

- **Manual:** Swagger `/api/v1/docs` for contract checks.
- **E2E (Playwright):** `apps/web/e2e/` against running web (+ API via rewrite).

## API Tests

| Spec file | Coverage |
|-----------|----------|
| `e2e/api.spec.ts` | Health / platform endpoints behavior |
| `e2e/auth.spec.ts` | Login page, redirect to login when unauthenticated |
| `e2e/navigation.spec.ts` | Route reachability / auth |

Run: `cd apps/web && pnpm test:e2e` (set `PLAYWRIGHT_SKIP_WEB_SERVER=1` if servers already running).

## Edge Cases

- Unauthenticated access to `(app)` routes → redirect `/login`.
- Invalid Google token → 401 from API.
- DB down → 500 on login (operational).
- AI disabled → UI hides or degrades per `useAiStatus`.

## Tests Not Covered

- Full Google OAuth in CI (requires secrets and browser).
- Admin CMS CRUD automation.
- Video streaming Range requests.
- Elasticsearch adapter paths.
- Learning Path models (product removed).

**CI recommendation:** `pnpm lint`, `pnpm build`, Playwright smoke on PR.

See `test-results.md` for last known runs.

# Acceptance Criteria

## Core

- [ ] Google Login works for `@tothenew.com` via `POST /api/auth/google` (proxied as `/api/auth/google` from web).
- [ ] Role-based access: learners see app shell; TEAM sees `/team/*`; ADMIN sees `/admin/*`.
- [ ] Knowledge Meet listing and detail (`/meets`, `/meets/[id]`) load published content.
- [ ] Knowledge Series listing and episodes (`/series`, `/series/[id]`).
- [ ] Watch page plays video (`/watch/[id]`) and records history.
- [ ] Resources visible on watch page when API returns attachments.
- [ ] Homepage feed loads (`GET /feed/dashboard` or `/feed/home`).
- [ ] Learning Journey: library, continue watching, progress summary endpoints respond.
- [ ] KnowledgeHub AI drawer/FAB respects `GET /ai/status` when Gemini configured.
- [ ] Search returns results (`GET /search?q=`).
- [ ] Bookmarks create/list (`GET/POST /bookmarks`).

## Validation

- [ ] API DTOs reject invalid payloads (global `ValidationPipe`).
- [ ] Domain enforcement on Google email.
- [ ] CMS forms validate URLs and required fields per DTOs in `admin-cms`.

## Error Handling

- [ ] 401 for invalid/missing JWT on protected routes.
- [ ] 403 for wrong role/permission on admin routes.
- [ ] 401 for invalid Google token; clear message in response body.
- [ ] 503 with message when `USER` role missing from DB (post-seed expectation).
- [ ] Global exception filter returns `{ statusCode, message, path, timestamp }`.

## Testing

- [ ] `pnpm lint` passes.
- [ ] `pnpm build` passes at monorepo root.
- [ ] Playwright: login page visible; unauthenticated redirect to `/login` (`apps/web/e2e/auth.spec.ts`).
- [ ] Manual smoke: login → home → watch one video → one admin CMS path (if ADMIN).

## Documentation

- [ ] Root assessment artifacts populated (this file set).
- [ ] `api-contract.md` matches Nest controllers.
- [ ] `data-model.md` matches `apps/api/prisma/schema.prisma`.
- [ ] Traceability from requirement to API/module documented in `implementation-plan.md`.

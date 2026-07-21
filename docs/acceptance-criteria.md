# Acceptance Criteria

Testable criteria aligned with Playwright specs (`apps/web/e2e/`) and manual smoke flows in `README.md`.

## Auth
- [ ] `/login` renders KnowledgeHub sign-in.
- [ ] Unauthenticated access to `/` redirects to login.
- [ ] Valid Google `@tothenew.com` account receives JWT and enters app.
- [ ] `GET /health` returns OK without auth.

## Learner
- [ ] Home loads dashboard feed without console errors.
- [ ] `/watch/[id]` plays published video and records history on progress.
- [ ] Search returns results for seeded content query.
- [ ] Bookmark appears on `/library`.

## Team
- [ ] TEAM user can open `/team/studio` and save draft.
- [ ] Submit video moves to pending approval.

## Admin
- [ ] ADMIN can list pending approvals and approve/reject.
- [ ] CMS meet create/edit persists `recordingUrl` and tags.

## API contract
- [ ] Authenticated `GET /auth/me` returns user with roles.
- [ ] `GET /notifications/unread-count` works; list loads on bell open.

## Regression guards
- [ ] No `/learning-paths` route in web `src/` (product removed).
- [ ] `pnpm build` succeeds at monorepo root.

E2E: `cd apps/web && pnpm test:e2e`.

# Requirements Analysis

Derived from implemented routes, Prisma schema, and `docs/project-build-summary.md`.

## Functional requirements

### Authentication & identity
- FR-A1: Google OAuth sign-in restricted to configured email domain.
- FR-A2: JWT access token + refresh cookie rotation.
- FR-A3: Auto-provision users with `USER` role.

### Content consumption
- FR-C1: Browse home feed, series, meets, speakers, competencies.
- FR-C2: Watch videos with resume, speed, mini player, view counting.
- FR-C3: Full-text search with suggestions and discovery helpers.
- FR-C4: Comments, bookmarks, watch history, continue watching.
- FR-C5: Video Q&A with votes and accepted answers.

### Content production
- FR-P1: Team upload and multi-step studio with drafts.
- FR-P2: Admin CMS for meets, series/episodes, taxonomy, resources.
- FR-P3: Approval workflow for videos (`PENDING_APPROVAL` → `PUBLISHED`).
- FR-P4: URL-based media and homepage metadata on meets/series.

### Administration
- FR-M1: User role assignment (`users:manage`).
- FR-M2: Analytics, reports, search analytics, announcements.
- FR-M3: Homepage sections and platform settings (JSON).

### AI
- FR-AI1: Discover assistant (incl. streaming) when Gemini configured.
- FR-AI2: Per-video summary and quiz generation.

## Non-functional requirements

| ID | Requirement | Implementation |
|----|-------------|----------------|
| NFR-1 | HTTPS-ready API hardening | helmet, CORS, validation pipe |
| NFR-2 | Container deploy | Next standalone, Node API |
| NFR-3 | Env-based adapters | storage, search, mail, push, AI |
| NFR-4 | Type safety | TypeScript strict, `@knowledgehub/types` |
| NFR-5 | Auditability | `AuditLog` model, admin actions |

## Business rules

- Only `@tothenew.com` (configurable) may register.
- Published content visible per `ContentStatus` / meet status rules in services.
- ADMIN holds all seeded permissions; TEAM cannot approve content.

## User stories (sample)

- As a **learner**, I want to continue watching where I left off so that I can finish sessions across devices.
- As a **team member**, I want to upload to a pre-defined series slot so that episodes stay ordered.
- As an **admin**, I want to approve pending videos so that only reviewed content goes live.

## Assumptions

- Single-region deployment; PostgreSQL is system of record.
- Web Push sufficient for browser notifications (no native FCM in scope).

## Edge cases

- Missing `GEMINI_API_KEY` → AI UI disabled, API noop.
- External video URL failure → player error state (content ops fixes URL).
- Elasticsearch down when `SEARCH_PROVIDER=elasticsearch` → operational fallback required (configure health checks).

See `docs/acceptance-criteria.md` for testable criteria.

# Design Notes — KnowledgeHub

## Frontend Architecture

- **Framework:** Next.js 16 App Router (`apps/web/src/app/`).
- **Route groups:** `(auth)/login`, `(app)/` learner + team + admin pages.
- **Features:** `features/admin-cms`, `features/ai`, `features/explore`, `features/phase8`.
- **State:** TanStack React Query for server data; Zustand for auth and mini player.
- **UI:** Ant Design 6 + Aspire SCSS (`kh-*` classes).
- **API client:** `lib/api.ts` — browser uses `/api` rewrite to Nest.

## Backend Architecture

- **Framework:** NestJS 11, prefix `api/v1`.
- **Pattern:** module → controller → service → Prisma.
- **Guards:** `JwtAuthGuard` (global), `RolesGuard`, `PermissionsGuard`.
- **Response:** `TransformInterceptor` wraps `{ data }`; errors via `GlobalExceptionFilter`.

## Database

- **PostgreSQL 16**, Prisma schema `apps/api/prisma/schema.prisma`.
- Migrations under `database/schema-or-migrations/` (see README there).
- Seed: `apps/api/prisma/seed.ts` — roles, permissions, competencies, sample content.

## Authentication

- Google ID token verified server-side (`google-auth-library`).
- Access JWT in memory (Zustand); refresh in httpOnly cookie path `/api/auth`.
- `@Public()` on auth and taxonomy endpoints.

## Authorization

- Roles: `USER`, `TEAM`, `ADMIN` (`RoleName` in `@knowledgehub/types`).
- Permissions seeded (e.g. `content:approve`, `users:manage`).
- Matrix: `docs/roles-and-permissions.md`.

## Validation

- DTOs with `class-validator` on all write endpoints.
- Global `ValidationPipe` strips unknown properties per Nest bootstrap config.

## Error Handling

- `GlobalExceptionFilter` → JSON `{ statusCode, message, timestamp, path }`.
- 401/403 for auth; 503 when seed roles missing (`users.repository`).

## Storage

- `STORAGE_PROVIDER`: `LOCAL` or `S3`; uploads under `/uploads` module.
- URL-based media on meets/series for external recordings (ADR-006).

## Search

- Default Postgres FTS; optional Elasticsearch (`SEARCH_PROVIDER`).
- `SearchController`: query, suggestions, recent, popular, trending.

## Learning Journey

- Not standalone Learning Paths UI — use `History`, `Bookmark`, `progress` module, `/library`.
- Models `LearningPath` in schema are dormant.

## KnowledgeHub AI

- `AI_PROVIDER=gemini`, `GEMINI_API_KEY` on API only.
- Endpoints: status, discover (+ stream), video summary, quiz.
- UI lazy-loaded FAB/drawer (`features/ai`).

**Diagrams:** `architecture/*.md`, `adr/`.

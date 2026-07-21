# AI / Developer Context — KnowledgeHub

Canonical onboarding doc for humans and Cursor agents. **No secrets** — use `apps/api/.env.example` and `apps/web/.env.example`.

**Last updated:** July 2026

---

## What this project is

**KnowledgeHub** is an internal engineering learning platform for **TO THE NEW** employees. Learners discover and watch sessions (videos, knowledge meets, series), search and explore by competency, bookmark, track progress, and use AI assistance. **TEAM** contributors upload via studio workflows; **ADMIN** users run CMS, approvals, users, analytics, and platform settings.

---

## Architecture (short)

```
┌─────────────┐     HTTPS/JSON      ┌─────────────┐
│  apps/web   │ ──────────────────► │  apps/api   │
│  Next.js    │   Bearer + cookies  │  NestJS     │
│  :3000      │ ◄── rewrites ────── │  :3001      │
└─────────────┘                     └──────┬──────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              PostgreSQL            Elasticsearch (opt.)     Local/S3 storage
              (Docker)              SEARCH_PROVIDER           STORAGE_PROVIDER
```

- **Monorepo:** pnpm workspaces + Turbo (`package.json`, `turbo.json`).
- **Shared types:** `packages/types` (`RoleName`, content summaries, etc.).
- **Infra:** `docker/docker-compose.yml` (Postgres + Elasticsearch).

Deeper reference: [`docs/project-build-summary.md`](./project-build-summary.md), [`docs/roles-and-permissions.md`](./roles-and-permissions.md).

---

## Technology stack

| Layer | Choices |
|-------|---------|
| Web | Next.js 16, React 19, Ant Design 6, SCSS (Aspire), React Query, Zustand, RHF + Zod |
| API | NestJS 11, Prisma 6, Passport JWT, class-validator |
| DB | PostgreSQL 16 |
| Search | Postgres FTS or Elasticsearch 8 |
| AI | Google Gemini (`AI_PROVIDER=gemini`) |
| E2E | Playwright (`apps/web`) |

---

## Important design decisions

1. **URL-first CMS (MVP)** — Meets, series, and episodes can be managed with external media URLs and rich metadata (`homepageTags`, `displayPriority`, previews) rather than only file uploads.
2. **Recorded meets** — Knowledge meets are on-demand recordings; admin forms focus on recording URL/metadata, not live event scheduling.
3. **RBAC** — Three roles (`USER`, `TEAM`, `ADMIN`) with permission slugs in DB; new users get `USER` only.
4. **Adapter pattern** — Storage, search, mail, push, and AI use env-selected providers for local dev vs production.
5. **Professional playback** — Range requests, resume position, continue watching, mini player (Phase 7).
6. **Learning paths removed from product UI** — Prisma models `LearningPath` / `LearningPathItem` may remain; no current routes in `apps/web/src` or learning-path controllers in `apps/api/src`. Do not re-add without explicit product ask.
7. **Performance pass (2026-07-20)** — Lazy notifications list, dynamic layout chunks, font subset; see [`docs/performance-report.md`](./performance-report.md).
8. **Admin CMS split** — Learner/admin routes under `apps/web/src/app/(app)/admin/*` with feature code in `apps/web/src/features/admin-cms/`; API under `apps/api/src/modules/admin-cms/`.

See also [`DECISIONS.md`](./DECISIONS.md).

---

## Folder map (where to edit)

| Concern | Location |
|---------|----------|
| Learner pages | `apps/web/src/app/(app)/` |
| Admin CMS UI | `apps/web/src/features/admin-cms/` |
| Dashboards / 

---

Extended docs: `docs/project-overview.md`, `.cursor/project-context.md`.

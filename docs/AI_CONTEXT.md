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
| Dashboards / phase 8 | `apps/web/src/features/phase8/` |
| API modules | `apps/api/src/modules/<name>/` |
| Schema | `apps/api/prisma/schema.prisma` |
| Shared enums/types | `packages/types/src/` |
| Cursor rules | `.cursor/rules/*.mdc` |

---

## Coding standards

- Extend existing modules; smallest correct diff.
- Web: `fetchApi` / `fetchApiJson`, React Query hooks, Ant Design 6 APIs (see `.cursor/rules/frontend.mdc`).
- API: DTO validation, guards, Prisma in services/repositories (see `.cursor/rules/backend.mdc`).
- SCSS: `kh-*` classes; avoid global element selectors that break Ant layout.

---

## Common workflows

### First-time setup

```bash
docker compose -f docker/docker-compose.yml up -d
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit both files with your Google OAuth client ID and strong JWT secrets
npx pnpm@9.15.4 install
npx pnpm@9.15.4 db:migrate
npx pnpm@9.15.4 db:seed
npx pnpm@9.15.4 dev
```

### Daily dev

- API: `http://localhost:3001/api/v1`
- Web: `http://localhost:3000`
- Both must run for login and data.
- Linux: `WATCHPACK_POLLING=true` in `apps/web` if hot reload misses files.

### Schema change

1. Edit `schema.prisma`
2. `pnpm db:migrate` (creates migration)
3. Update seed if needed; update `@knowledgehub/types` if contracts change

### Production build

```bash
pnpm build   # runs db:generate + turbo build
```

Web uses `output: "standalone"`; deploy web + API containers with env from examples.

### Gemini / AI

See [`docs/gemini-setup.md`](./gemini-setup.md). API key must be a Gemini key (`AIza...`), not OAuth client ID.

---

## Known limitations

| Area | Notes |
|------|--------|
| Client-heavy app shell | Full RSC migration not done; large vendor JS chunk |
| Homepage builder | Some UI still uses localStorage; DB models exist for sections |
| Learning paths | DB schema only; product UI/API removed |
| Ratings / speaker follow | Models may exist; limited or no public API |
| Root `.env.local` | Prefer `apps/web/.env.local` — root file can confuse API URL |
| Stale docs | Older docs may mention learning paths or Content Manager routes not in current `src/` — trust code + this file |

### Troubleshooting

- `500` on `/api/auth/google` → API not running on 3001 or bad `GOOGLE_CLIENT_ID`
- Series/meet validation errors after DTO changes → restart API
- `next build` TS errors → try `next build --webpack`; fix types under `apps/web/src`

---

## Future roadmap (informal)

- Harden admin tables (Ant Design 6 migration cleanup, undefined icon imports).
- Server Components where safe for perf.
- Homepage curation API aligned with CMS `homepageTags` / feed service.
- Production S3, SMTP, web push, optional Elasticsearch.
- Revisit learning paths only if product revives the feature (migrate or drop schema).

---

## Related docs

| File | Purpose |
|------|---------|
| `README.md` | Setup, env tables, scripts |
| `DECISIONS.md` | ADR-style decision log |
| `docs/performance-report.md` | Perf audit |
| `docs/roles-and-permissions.md` | RBAC matrix |
| `docs/demo-walkthrough.md` | Demo script (may be partially outdated) |
| `.cursor/rules/` | Cursor agent rules |

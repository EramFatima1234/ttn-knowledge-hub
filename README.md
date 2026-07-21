# KnowledgeHub

Internal engineering learning platform for **TO THE NEW** (`@tothenew.com`). Monorepo: **Next.js** frontend + **NestJS** API + **PostgreSQL**.

For architecture, conventions, and agent context see [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md) and [`.cursor/rules/`](.cursor/rules/).

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** 9.15.4 (or `npx pnpm@9.15.4`)
- **Docker** (PostgreSQL + optional Elasticsearch)

---

## Quick start

```bash
# 1. Infrastructure
docker compose -f docker/docker-compose.yml up -d

# 2. Environment (do not commit the copied files)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Install & database
npx pnpm@9.15.4 install
npx pnpm@9.15.4 db:migrate
npx pnpm@9.15.4 db:seed

# 4. Run both apps (from repo root)
npx pnpm@9.15.4 dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Prisma Studio | `pnpm db:studio` |

Sign in with Google using a `@tothenew.com` account. Assign **TEAM** or **ADMIN** via `/admin/users` (admin only).

---

## Environment variables

### API (`apps/api/.env`)

Copy from [`apps/api/.env.example`](apps/api/.env.example). Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Access token signing (≥ 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing (≥ 32 chars) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID (server validation) |
| `CORS_ORIGIN` | No | Default `http://localhost:3000` |
| `ALLOWED_EMAIL_DOMAIN` | No | Default `tothenew.com` |
| `STORAGE_PROVIDER` | No | `LOCAL` or `S3` |
| `SEARCH_PROVIDER` | No | `postgres` or `elasticsearch` |
| `ELASTICSEARCH_URL` | If ES | Default `http://localhost:9200` |
| `MAIL_PROVIDER` | No | `console` or `smtp` |
| `PUSH_PROVIDER` | No | `console` or `webpush` |
| `AI_PROVIDER` | No | `gemini` (others not fully implemented) |
| `GEMINI_API_KEY` | For AI | Gemini API key — see [`docs/gemini-setup.md`](docs/gemini-setup.md) |

Local Postgres defaults match `docker/docker-compose.yml` (`knowledgehub` / `knowledgehub` on port 5432).

### Web (`apps/web/.env.local`)

Copy from [`apps/web/.env.example`](apps/web/.env.example):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base, e.g. `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same OAuth client as API (browser) |
| `NEXT_PUBLIC_ENVIRONMENT` | e.g. `dev` |
| `NEXT_PUBLIC_ENCRYPTION_KEY` | 32-character client-side key (generate your own; do not use production values from examples in git) |

Use **`apps/web/.env.local`**, not only a root `.env.local`, so `NEXT_PUBLIC_API_URL` is correct.

---

## Scripts

From repository root (`package.json`):

| Command | Action |
|---------|--------|
| `pnpm dev` | Start web + API via Turbo |
| `pnpm build` | `db:generate` + production build all packages |
| `pnpm lint` | ESLint across workspace |
| `pnpm db:generate` | Prisma client generate |
| `pnpm db:migrate` | Prisma migrate dev (API) |
| `pnpm db:seed` | Seed sample data |
| `pnpm db:studio` | Prisma Studio |

Per app:

```bash
pnpm --filter @knowledgehub/web dev
pnpm --filter @knowledgehub/api dev
```

### Web-only

```bash
cd apps/web
pnpm build          # production Next.js build
pnpm test:e2e       # Playwright (starts dev server unless PLAYWRIGHT_SKIP_WEB_SERVER=1)
```

On Linux, if file watching is unreliable:

```bash
cd apps/web && WATCHPACK_POLLING=true pnpm dev
```

If TypeScript fails on default bundler:

```bash
cd apps/web && npx next build --webpack
```

### API-only

```bash
cd apps/api
pnpm db:migrate:deploy   # production migrations
pnpm build && pnpm start:prod
```

---

## Project structure

```
Learning_TTN/
├── apps/web/           # Next.js 16 (port 3000)
├── apps/api/           # NestJS 11 (port 3001)
├── packages/types/     # Shared TypeScript types
├── packages/tsconfig/
├── docker/             # docker-compose.yml
├── docs/               # AI_CONTEXT, decisions, roles, performance
└── .cursor/rules/      # Cursor agent rules (*.mdc)
```

---

## Development workflow

1. Create a feature branch (`cursor/<topic>-<summary>` for agent work).
2. Change API schema → migrate → update types package if needed.
3. Run `pnpm lint` and `pnpm build` before opening a PR.
4. Manual smoke: login, home feed, watch a video, one admin CMS path if applicable.

**Roles:** [`docs/roles-and-permissions.md`](docs/roles-and-permissions.md)

---

## Deployment notes

- **Web:** Next `standalone` output (`apps/web/next.config.ts`). Set `NEXT_PUBLIC_API_URL` to the public API URL.
- **API:** Node process on `PORT` (default 3001), `API_PREFIX=api/v1`. Run `prisma migrate deploy` on deploy.
- **Database:** Managed PostgreSQL; point `DATABASE_URL`.
- **Files:** Set `STORAGE_PROVIDER=S3` and AWS variables for production; configure `CORS_ORIGIN` to the web origin.
- **Search:** Optional Elasticsearch (`SEARCH_PROVIDER=elasticsearch`).
- **Mail / push:** Configure SMTP and VAPID keys for real delivery.

Do not deploy committed `.env` files; inject secrets via your platform’s secret store.

---

## Documentation index

| Document | Contents |
|----------|----------|
| [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md) | Stack, workflows, limitations |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | ADR-style decision log |
| [`docs/project-build-summary.md`](docs/project-build-summary.md) | Detailed feature inventory |
| [`docs/performance-report.md`](docs/performance-report.md) | Performance audit |
| [`docs/gemini-setup.md`](docs/gemini-setup.md) | AI configuration |

---

## License

Private — TO THE NEW internal use.

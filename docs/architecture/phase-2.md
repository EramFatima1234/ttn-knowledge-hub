# Phase 2 — Backend Setup

## Delivered

- Monorepo structure (`pnpm` + `TurboRepo`)
- `apps/api` — NestJS REST API
- `apps/web` — existing Next.js frontend (moved)
- `packages/types` — shared enums and auth contracts
- `packages/tsconfig` — shared TypeScript configs

## Backend Modules

| Module | Status |
|--------|--------|
| Auth (Google OAuth, JWT, Refresh) | Done |
| RBAC (Roles + Permissions guards) | Done |
| Users (list, assign roles) | Done |
| Storage (Local + S3 adapter port) | Done |
| Taxonomy (competencies, categories) | Done |
| Prisma schema (full domain model) | Done |
| Swagger (`/api/v1/docs`) | Done |

## API Base URL

`http://localhost:3001/api/v1`

## Auth Flow

1. Frontend obtains Google ID token
2. `POST /api/v1/auth/google` with `{ idToken }`
3. API validates `@tothenew.com` domain
4. New users receive **USER** role automatically
5. Admin assigns **TEAM** via `POST /api/v1/users/:id/roles`

## Local Development

```bash
docker compose -f docker/docker-compose.yml up -d
cp apps/api/.env.example apps/api/.env
npx pnpm@9.15.4 install
npx pnpm@9.15.4 db:migrate
npx pnpm@9.15.4 db:seed
npx pnpm@9.15.4 dev
```

## Trade-offs

- **S3 adapter** uses presigned URL contract; full AWS SDK wiring deferred to production deploy
- **Frontend auth** still uses mock login — wired in Phase 3
- **Elasticsearch** not implemented; Postgres FTS columns ready in schema for Phase 6

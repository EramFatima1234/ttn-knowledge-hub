# Architecture

Monorepo: **pnpm 9.15.4** + **Turbo** (`turbo.json`).

```
apps/web          Next.js 16, port 3000
apps/api          NestJS 11, port 3001, prefix api/v1
packages/types    Shared contracts
packages/tsconfig Shared TS configs
docker/           PostgreSQL + Elasticsearch
```

## Request flow

Browser → Next.js → rewrite `/api/*` → Nest → Prisma → PostgreSQL.

Global API guards: JWT (default), roles, permissions. Responses wrapped by `TransformInterceptor`.

## Diagram

See `architecture/system-overview.md` and `docs/AI_CONTEXT.md`.

## Module documentation

| Area | Document |
|------|----------|
| Frontend | `docs/frontend-architecture.md` |
| Backend | `docs/backend-architecture.md` |
| Database | `docs/database-design.md` |
| Flows | `architecture/*.md` |
| Decisions | `adr/` |

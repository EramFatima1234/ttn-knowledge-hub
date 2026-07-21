# ADR-003 — Why PostgreSQL

**Status:** Accepted  
**Date:** 2026 (Phase 2)  
**Scope:** Data layer

## Problem

KnowledgeHub stores relational data: users/RBAC, content graph (videos, meets, series, sessions), engagement (comments, bookmarks, history), notifications, CMS settings, and optional full-text search vectors. The store must support ACID transactions, migrations, and local Docker dev matching production.

## Decision

Use **PostgreSQL 16** via **Prisma 6** (`apps/api/prisma/schema.prisma`). Local infra: `docker/docker-compose.yml` (service `postgres`, database `knowledgehub`).

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| MongoDB | Weak fit for RBAC joins and strict content relationships |
| MySQL | Team standard and Prisma tooling aligned on Postgres for FTS extensions |
| SQLite | Insufficient for concurrent production workloads |

## Tradeoffs

- **Pros:** FTS for default search (`SEARCH_PROVIDER=postgres`); mature indexing; Prisma migrations in `apps/api/prisma/migrations/`.
- **Cons:** Optional Elasticsearch adds operational surface when catalogs grow.

## Future impact

- Schema changes: edit Prisma → `pnpm db:migrate` → update `@knowledgehub/types` if contracts change.
- `LearningPath` / `LearningPathItem` models remain in schema but product UI/API removed — migrate or drop when product decides.

## Traceability

| Layer | Location |
|-------|----------|
| Schema | `apps/api/prisma/schema.prisma` |
| Docs | `docs/database-design.md`, `docs/data-model.md`, `architecture/database-flow.md` |

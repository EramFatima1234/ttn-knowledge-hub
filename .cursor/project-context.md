# KnowledgeHub — Cursor Project Context

**Do not regenerate the monorepo.** Extend `apps/web`, `apps/api`, `packages/types`.

## Stack

Next.js 16 (web :3000) · NestJS 11 (api :3001/api/v1) · PostgreSQL · Prisma · pnpm 9.15.4 · Turbo

## Auth

Google OAuth, `@tothenew.com`, JWT + refresh cookie. Guards on API by default.

## Where to edit

| Task | Path |
|------|------|
| Learner UI | `apps/web/src/app/(app)/` |
| Admin CMS | `apps/web/src/features/admin-cms/` |
| API feature | `apps/api/src/modules/<name>/` |
| Schema | `apps/api/prisma/schema.prisma` |
| Shared types | `packages/types/src/` |

## Product constraints

- Learning paths **removed** — no `/learning-paths` routes.
- Meets are **recorded**, not live scheduling UX.
- URL-based media + `homepageTags` on CMS entities.

## Docs

`docs/AI_CONTEXT.md`, `architecture/`, `adr/`, `docs/api-contract.md`, `PROJECT_HEALTH.md`

## Rules

Also load `.cursor/rules/*.mdc` for coding, security, architecture.

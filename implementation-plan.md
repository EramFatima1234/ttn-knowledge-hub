# Implementation Plan — KnowledgeHub

## Overview

Deliver and document an internal learning platform in a pnpm monorepo: **Next.js** web, **NestJS** API, **PostgreSQL** via Prisma. Work proceeded in phases (see `docs/architecture/phase-2.md` through `phase-8.md`) culminating in URL-based CMS, Gemini AI, Aspire UI, and admin Content Manager.

## Task Breakdown

| # | Task | Implementation location | Status |
|---|------|-------------------------|--------|
| 1 | Auth (Google + JWT + RBAC) | `apps/api/src/modules/auth`, `apps/web` login | Done |
| 2 | Videos + streaming | `modules/videos`, `VideoPlayer` | Done |
| 3 | Knowledge meets / series | `knowledge-meets`, `knowledge-series`, admin CMS | Done |
| 4 | Engagement (bookmark, history, comments) | `modules/engagement` | Done |
| 5 | Search + explore | `modules/search`, `features/explore` | Done |
| 6 | Admin approvals + dashboard overview | `modules/admin` | Done |
| 7 | Content Manager | `modules/admin-cms`, `features/admin-cms` | Done |
| 8 | Progress / Learning Journey | `modules/progress`, home continue watching | Done |
| 9 | KnowledgeHub AI | `modules/ai`, `features/ai` | Done |
| 10 | Assessment documentation | Root `*.md`, `ai-prompts/` | In progress |

## Milestones

1. **M1 — Foundation:** Monorepo, DB schema, OAuth, guards.
2. **M2 — Learner MVP:** Watch, home feed, library.
3. **M3 — CMS & TEAM:** Studio, approvals, meets/series CRUD.
4. **M4 — Discovery & AI:** Search, explore, Gemini.
5. **M5 — Engineering maturity:** ADRs, health report, assessment artifacts.

## AI Usage Plan

| Phase | AI role | Human validation |
|-------|---------|------------------|
| Requirements | Summarize codebase, draft FR/NFR | Compare to `src/` and schema |
| Design | ADRs, flow diagrams | Review against Nest modules |
| Implementation | Small diffs, hooks, DTOs | `pnpm build`, manual smoke |
| Debug | Trace 500 on auth, resource limits | Logs, curl, Prisma |
| Docs | Populate assessment MD from code | Spot-check endpoints in Swagger |
| Review | `PROJECT_HEALTH.md`, lint | PR checklist |

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| DB not running locally | Auth 500 | `docker compose up postgres`, `db:seed` |
| Google client ID mismatch | 401 on login | Match API + web env |
| Large vendor bundle | Slow dev | Dynamic imports (documented in perf report) |
| Doc drift vs code | Failed review | Regenerate `scripts/generate-api-contract.py` |

## Mitigation

- `scripts/dev-restart.sh` for consistent local startup.
- `.cursor/rules` to prevent regeneration.
- Traceability table in `tool-specific/cursor-workflow/tasks.md`.

## Traceability

Requirement → `requirements-analysis.md` → `design-notes.md` → `apps/api/src/modules/*` → `apps/api/prisma/schema.prisma` → `api-contract.md` → `apps/web/e2e/*` → this plan.

# Project Context — Cursor Workflow

**Product:** KnowledgeHub — internal learning platform for TO THE NEW (`@tothenew.com`).

**Not:** Support ticket / ITSM system.

## Monorepo

| Path | Role |
|------|------|
| `apps/web` | Next.js 16, port 3000 |
| `apps/api` | NestJS 11, `/api/v1` |
| `packages/types` | Shared contracts |
| `apps/api/prisma` | Database schema & migrations |

## Constraints for AI

- Do not regenerate the project.
- Do not change APIs or business logic without explicit ask.
- Minimal diffs; match `.cursor/rules/*.mdc`.
- Learning Paths UI removed; Learning Journey = progress + library.

## Key domains

Knowledge Meets, Knowledge Series, Content Manager (`admin/cms`), Resources, Search, Bookmarks, KnowledgeHub AI (Gemini), RBAC.

## Docs

- Assessment: repository root `*.md`
- Engineering: `docs/README.md`, `adr/`, `architecture/`

# Implementation Plan

Historical delivery followed **phased** increments (documented in `docs/architecture/phase-*.md`). This plan reflects **as-built** state and **next engineering** work — not a rewrite.

## Completed phases

| Phase | Outcome | Doc |
|-------|---------|-----|
| 2 | API, Prisma, OAuth, RBAC | `docs/architecture/phase-2.md` |
| 3 | Next shell, login, layout | `phase-3.md` |
| 4 | Watch, feeds, library | `phase-4.md` |
| 5 | Team upload, admin approvals | `phase-5.md` |
| 6 | Search, notifications, analytics | `phase-6.md` |
| 7 | Streaming, progress, Q&A, AI | `phase-7.md` |
| 8 | Admin CMS UX, Aspire tables | `phase-8.md` |

## Traceability template

For each new feature:

1. Requirement → `docs/requirements-analysis.md`
2. ADR if architectural → `adr/`
3. Schema → `apps/api/prisma/schema.prisma`
4. API → module + `docs/api-contract.md`
5. UI → `apps/web/src/app` + `features/`
6. Tests → Playwright or API tests
7. Docs → update flow in `architecture/` and `.cursor/project-context.md`

## Near-term engineering (no product change)

1. Unify homepage builder with `HomepageSection` API.
2. Split `admin-cms.service.ts` by domain.
3. Optional: speaker follow + ratings public API (schema exists).
4. RSC evaluation per `docs/performance-guide.md`.

## Out of scope unless requested

- Regenerating monorepo layout.
- Reintroducing learning paths UI without product sign-off.

# Tool Workflow — Cursor on KnowledgeHub

How AI was used across the software lifecycle for this repository (assessment traceability).

## Project context provided

- `.cursor/rules/*.mdc` (architecture, frontend, backend, security, testing)
- `.cursor/project-context.md`, `tool-specific/cursor-workflow/project-context.md`
- `docs/AI_CONTEXT.md`, `docs/project-build-summary.md`
- Prisma schema and Nest module map as source of truth

## Requirement analysis

- Prompts asked for inventory of routes, roles, and CMS flows without changing product scope.
- Output captured in `requirements-analysis.md`, `acceptance-criteria.md`, and `docs/requirements-analysis.md`.
- **Rejected:** Treating KnowledgeHub as a generic “ticket system” template.

## Planning

- Phased delivery documented in `docs/architecture/phase-*.md`.
- Assessment plan in `implementation-plan.md` and `ai-prompts/planning.md`.
- **Accepted:** Lighter `pnpm dev` (API + web only) to reduce local thread exhaustion.
- **Rejected:** Full monorepo regeneration.

## Architecture

- ADRs in `adr/ADR-001` … `ADR-010` (Next.js, NestJS, PostgreSQL, React Query, Ant Design, URL media, Content Manager, Learning Journey, Gemini, homepage metadata).
- Flow docs in `architecture/*.md`.
- **Accepted:** Adapter pattern for storage, search, mail, push, AI (env-driven).

## Implementation

- Extend existing modules under `apps/api/src/modules/` and `apps/web/src/features/`.
- Minimal diffs; shared types in `packages/types`.
- Documented in `ai-prompts/implementation.md` and `reflection.md`.

## Testing

- Playwright specs: `apps/web/e2e/auth.spec.ts`, `navigation.spec.ts`, `api.spec.ts`.
- Manual smoke: login, home, watch, admin CMS path.
- Recorded in `test-strategy.md`, `test-results.md`, `ai-prompts/testing.md`.

## Debugging

- Real issues: PostgreSQL down → `POST /api/auth/google` 500; port conflicts; `pnpm`/`EAGAIN` in agent shell; auth hydration spinner.
- Fixes documented in `debugging-notes.md`, `ai-prompts/debugging.md` (code: `AuthProvider` hydration fallback, `dev-restart.sh`, seed/migrate).

## Code review

- Checklist: `docs/code-review-guide.md`, `code-review-notes.md`, `review-fixes.md`.
- AI review via Cursor rules + `PROJECT_HEALTH.md`.

## Documentation

- Enterprise docs tree (`docs/`, `adr/`, `onboarding/`) plus **assessment artifacts at repository root** (this exercise).
- `ai-prompts/documentation.md` — prompt history for doc generation.

## Validation

- `pnpm lint`, `pnpm build` before merge.
- API health: `GET /api/v1/health`.
- Google client ID parity: API `GOOGLE_CLIENT_ID` vs web `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## Accept / reject pattern

| Suggestion | Decision | Reason |
|------------|----------|--------|
| Regenerate project | **Rejected** | Preserves implementation and git history |
| Learning Paths UI | **Rejected** | Product removed; schema retained only |
| Merge home feed APIs | **Deferred** | Needs API contract agreement |
| Auth hydration timeout | **Accepted** | Fixes infinite loading without UX redesign |
| Postgres-only Docker on dev restart | **Accepted** | Faster local setup |

## Reusing this workflow

1. Load `.cursor/rules` + `tool-specific/cursor-workflow/project-context.md`.
2. State constraints: no API breaks, minimal diff.
3. Trace: requirement → `acceptance-criteria.md` → code path → `api-contract.md` / `data-model.md` → test → doc update.
4. Record prompts in `ai-prompts/*.md` for reviewers.

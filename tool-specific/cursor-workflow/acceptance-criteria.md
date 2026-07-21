# Acceptance Criteria — Cursor Workflow

Mirror of root `acceptance-criteria.md` for Cursor session context.

## Core

Google login, RBAC, meets, series, watch, resources, homepage CMS, Learning Journey (library/progress), search, bookmarks, React Query data layer, KnowledgeHub AI status endpoint.

## Validation

DTO validation on API; domain check on Google email; CMS field validation.

## Error Handling

401/403/503 patterns documented in `api-contract.md` and `debugging-notes.md`.

## Testing

`pnpm lint`, `pnpm build`, Playwright auth/navigation/api specs, manual smoke.

## Documentation

Root assessment set complete; `ai-prompts/` prompt history; `tool-workflow.md` for process.

**Before submission:** complete `candidate-info.md` and `test-results.md` with real run data.

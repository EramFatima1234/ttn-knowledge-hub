# Code Review Notes — KnowledgeHub

## AI Review

Cursor Agent reviews guided by `.cursor/rules/` (security, architecture, minimal diff). `PROJECT_HEALTH.md` captures static findings:

- Large `admin-cms.service.ts` (~1400 lines) — maintainability risk, no behavior change suggested in review pass.
- Dormant schema: `LearningPath`, `Like`, `Rating`, `SpeakerFollow` without full public API.
- Stale doc references to removed learning-path routes.

## Manual Review

| Area | Finding | Severity |
|------|---------|----------|
| Auth | Refresh cookie path matches web proxy | OK |
| Secrets | No API keys in `NEXT_PUBLIC_*` | OK |
| Guards | Admin/CMS behind JWT + roles | OK |
| DTOs | class-validator on write endpoints | OK |
| Explore filters | Competency dropdown for scale | UX improvement (accepted) |

## Changes Made (from review / debug)

- `AuthProvider.tsx` — hydration fallback (2s) to prevent infinite loading.
- `package.json` — lighter `pnpm dev` (API + web, build types once).
- `scripts/dev-restart.sh` — postgres-only Docker, npm fallback.
- `users.repository.ts` — `503` when USER role missing after seed expectation.
- Assessment documentation at repository root (this exercise).

## Suggestions Rejected

| Suggestion | Reason |
|------------|--------|
| Regenerate entire monorepo | Breaks assessment “existing project” rule |
| Re-enable Learning Paths UI | Product removed; schema only |
| Merge home feed APIs without design | Deferred — contract impact |
| Full RSC migration | High risk, limited incremental win per perf audit |
| Commit `.env` files | Security policy |

## Reasoning

Reviews prioritized **preserve APIs and business logic**, **document real behavior**, and **fix operational blockers** (DB, auth 500, dev startup) over structural refactors.

See `review-fixes.md` for follow-up items.

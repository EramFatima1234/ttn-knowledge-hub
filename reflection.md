# Reflection — KnowledgeHub AI Capability Exercise

## What I Built

KnowledgeHub: a production-shaped internal learning platform — Google OAuth, RBAC, video/meet/series consumption, Content Manager, search, bookmarks, progress (Learning Journey), and Gemini AI — in a pnpm monorepo (`apps/web`, `apps/api`, `packages/types`).

## How AI Helped

- **Rapid codebase orientation** — module maps, endpoint indexes, ADRs from real `src/`.
- **Documentation at scale** — assessment artifacts, flow diagrams, traceability without regenerating code.
- **Debugging** — correlated 500 on `/api/auth/google` with Prisma `P1001` and missing seed roles.
- **Dev ergonomics** — lighter dev scripts and restart shell from log analysis.

## Where AI Failed

- **Shell reliability** — `EAGAIN` / fork limits in agent environment; could not always restart servers.
- **Over-broad refactors** — had to explicitly reject “regenerate project” prompts.
- **Generic templates** — ticket-system wording had to be rewritten for KnowledgeHub domain.
- **Test execution** — AI cannot replace running Playwright with live Google OAuth in CI without secrets.

## How I Validated

- `curl` health and auth error paths on API.
- Compared `GOOGLE_CLIENT_ID` parity API vs web.
- `pnpm db:migrate` + `db:seed` on Docker Postgres.
- Manual login smoke after API restart.
- Cross-check `api-contract.md` against Nest controllers.

## Lessons Learned

1. **Ops first:** DB and seed before testing auth.
2. **Constraints in prompts:** “no API/UI changes” keeps diffs reviewable.
3. **Traceability sells the exercise:** link requirements → design → code → tests.
4. **Persist prompt history** in `ai-prompts/` for reviewers.

## Future Improvements

- Nest integration tests for auth and CMS.
- CI Playwright with test Google account or mocked auth layer.
- Split admin CMS service; complete homepage builder ↔ DB API alignment.
- Implement or drop dormant Prisma models (`Like`, `LearningPath`).

## Reusable Workflow

1. Load `.cursor/rules` + `tool-specific/cursor-workflow/project-context.md`.
2. Analyze → plan in `ai-prompts/planning.md` → implement minimal diff.
3. Update root assessment docs + `scripts/generate-api-contract.py`.
4. Record accept/reject in `tool-workflow.md` and `reflection.md`.

See `final-ai-usage-summary.md` and `tool-workflow.md`.

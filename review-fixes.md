# Review Fixes — KnowledgeHub

Items identified in review; status for submission readiness.

| ID | Item | Status | Notes |
|----|------|--------|-------|
| RF-1 | Run `pnpm db:seed` after migrate on fresh DB | **Done** (documented) | `database/setup-notes.md` |
| RF-2 | Auth 500 when Postgres down | **Mitigated** | Ops: start postgres; clearer 503 for missing role |
| RF-3 | Dev startup script | **Done** | `scripts/dev-restart.sh` |
| RF-4 | Hydration spinner | **Done** | `AuthProvider` |
| RF-5 | Assessment artifact set at repo root | **Done** | This documentation pass |
| RF-6 | Regenerate API index | **Tooling** | `scripts/generate-api-contract.py` |
| RF-7 | Playwright green on CI | **Pending** | Record in `test-results.md` before submit |
| RF-8 | Split `admin-cms.service.ts` | **Deferred** | No API change in assessment window |
| RF-9 | Nest e2e for auth + CMS | **Deferred** | Recommended post-assessment |
| RF-10 | Fill `candidate-info.md` name/dates | **Pending** | Candidate action |

No API or business-logic changes required for assessment compliance beyond documented bugfixes above.

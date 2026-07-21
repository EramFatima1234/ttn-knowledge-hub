# AI Prompts — Planning

## Objective

Plan KnowledgeHub documentation and engineering work without regenerating the monorepo or changing APIs/UI.

## Prompt Summary

> "Align repository with AI Capability Exercise structure. Read entire project. Populate assessment markdown from real implementation. KnowledgeHub learning platform — not support tickets. Preserve business logic."

## AI Response Summary

- Inventoried `apps/web`, `apps/api`, Prisma schema, existing `docs/` and `adr/`.
- Proposed root-level assessment files plus `ai-prompts/` and `tool-specific/cursor-workflow/`.
- Proposed lighter `pnpm dev` and `dev-restart.sh` from operational debugging.

## Accepted Suggestions

- Root `requirements-analysis.md`, `implementation-plan.md`, `acceptance-criteria.md` with KnowledgeHub terminology.
- Traceability table requirement → design → code → API → tests.
- `database/` documentation pointers to Prisma (no duplicate migrations).

## Rejected Suggestions

- Regenerating project scaffold.
- Renaming modules or rewriting features as ticket workflows.

## Reasoning

Assessment requires lifecycle evidence; KnowledgeHub already implements the domain — planning focused on **documentation fidelity** and **reviewer traceability**.

## Iteration History

1. Enterprise `docs/` tree created (prior session).
2. Assessment root artifacts added (this session).
3. `candidate-info.md` left with placeholders for human fill before submit.

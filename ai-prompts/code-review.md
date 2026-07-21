# AI Prompts — Code Review

## Objective

Produce review notes and health findings without drive-by refactors.

## Prompt Summary

> "Project health: unused code, large files, security risks. Code review accept/reject list."

## AI Response Summary

- `PROJECT_HEALTH.md` — large `admin-cms.service.ts`, dormant models, doc drift.
- `code-review-notes.md` — AI vs manual findings.
- `review-fixes.md` — tracked follow-ups.

## Accepted Suggestions

- Document rejected regeneration and learning-path revival.
- Security checklist from `.cursor/rules/security.mdc`.

## Rejected Suggestions

- Mass deletion of `LearningPath` schema without migration plan.

## Reasoning

Review artifacts show critical thinking, not only AI-generated praise.

## Iteration History

1. Static analysis heuristics for hooks/components.
2. Mapped to assessment `code-review-notes.md` format.

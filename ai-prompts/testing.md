# AI Prompts — Testing

## Objective

Map KnowledgeHub test approach to assessment `test-strategy.md` and record Playwright scope.

## Prompt Summary

> "Document test strategy: Playwright e2e, lint, build; map to KnowledgeHub acceptance criteria."

## AI Response Summary

- Listed `apps/web/e2e/auth.spec.ts`, `navigation.spec.ts`, `api.spec.ts`.
- Created `test-results.md` template for submission run.
- Noted gaps: no full CMS automation, no OAuth in CI without secrets.

## Accepted Suggestions

- Manual smoke checklist in `test-results.md`.
- Link tests to acceptance criteria sections.

## Rejected Suggestions

- Generating fake pass/fail numbers without a run.

## Reasoning

Honest coverage reporting meets assessment integrity; reviewers can re-run `pnpm test:e2e`.

## Iteration History

1. Documented existing Playwright specs from codebase read.
2. Flagged stale `playwright-report/` artifacts when server was down.

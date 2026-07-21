# Contributing to KnowledgeHub

Internal TO THE NEW project. Thank you for improving the platform and its documentation.

## Before you start

1. Read `README.md` and `onboarding/getting-started.md`.
2. Follow `docs/coding-guidelines.md` and `.cursor/engineering-principles.md`.
3. Use pnpm **9.15.4** (`npx pnpm@9.15.4`).

## Branching

- Base branch: `main`
- Feature branches: `feature/<name>` or `cursor/<topic>-<summary>`
- Do not force-push `main`

## Making changes

1. **API schema** → `pnpm db:migrate` → update `packages/types` if contracts change.
2. **New endpoints** → update `docs/api-contract.md` and relevant `architecture/*-flow.md`.
3. **Architectural choices** → add or update `adr/ADR-*.md`.
4. Run `pnpm lint` and `pnpm build` before opening a PR.

## Pull requests

Use the checklist in `docs/code-review-guide.md`. Link requirements or ADRs when applicable.

## Secrets

Never commit `apps/api/.env`, `apps/web/.env.local`, or credentials. Use `.env.example` templates only.

## Documentation

Populate docs from the **actual implementation**—no placeholder pages. Update `PROJECT_HEALTH.md` when you remove dead code or large refactors.

## Questions

See `onboarding/faq.md` and `docs/roles-and-permissions.md`.

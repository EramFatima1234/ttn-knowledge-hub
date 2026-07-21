# Development Workflow

1. Branch: `cursor/<topic>-<summary>` or `feature/<name>`.
2. API schema change → `pnpm db:migrate` → update types package if needed.
3. `pnpm lint` && `pnpm build` before PR.
4. Smoke: login, home, watch, one admin path.

See `CONTRIBUTING.md`.

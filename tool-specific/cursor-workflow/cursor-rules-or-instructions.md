# Cursor Rules & Instructions

KnowledgeHub uses **Cursor Project Rules** as the authoritative instruction set for agents.

## Location

```
.cursor/rules/
├── architecture.mdc
├── backend.mdc
├── coding-style.mdc
├── frontend.mdc
├── performance.mdc
├── security.mdc
└── testing.mdc
```

## Knowledge base (markdown)

```
.cursor/
├── project-context.md
├── architecture.md
├── coding-rules.md
├── prompt-library.md
├── engineering-principles.md
└── feature-checklist.md
```

## Session instructions

1. Read `tool-specific/cursor-workflow/project-context.md` and root `requirements-analysis.md`.
2. Never regenerate monorepo; extend `apps/web` and `apps/api`.
3. Update assessment docs when changing behavior: `acceptance-criteria.md`, `api-contract.md`, `data-model.md`.
4. Log significant prompts in `ai-prompts/<phase>.md`.
5. Run `pnpm lint` and `pnpm build` before claiming green.

## Assessment alignment

Required reviewer artifacts live at **repository root** (see README “AI Capability Exercise”). Enterprise docs remain under `docs/` — do not delete; cross-link only.

## Tooling

- Package manager: pnpm 9.15.4
- Dev: `bash scripts/dev-restart.sh` or `pnpm dev`
- API contract sync: `python3 scripts/generate-api-contract.py`

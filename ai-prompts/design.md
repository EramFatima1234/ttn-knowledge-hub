# AI Prompts — Design

## Objective

Document architecture and design for assessment reviewers using actual KnowledgeHub modules.

## Prompt Summary

> "Create design-notes, ui-flow, data-model, api-contract for real Nest/Next/Prisma stack. Include auth, CMS, Learning Journey, Gemini AI."

## AI Response Summary

- `design-notes.md` — frontend/backend, validation, storage, search, AI.
- `data-model.md` — User, Meet, Series, Episode, Speaker, Competency, Bookmark, Comment, Learning Journey tables.
- `ui-flow.md` — learner and admin journeys per assessment diagram.
- Cross-links to `adr/` and `architecture/*.md`.

## Accepted Suggestions

- Mermaid diagrams in `ui-flow.md`.
- Distinguish Learning Journey (history/progress) vs removed Learning Paths UI.

## Rejected Suggestions

- Ticket status/state machine diagrams (wrong domain).

## Reasoning

Design docs must match `schema.prisma` and route map in `apps/web/src/app/`.

## Iteration History

1. Phase docs (`docs/architecture/phase-*`) retained as historical design record.
2. ADR-001–010 for stack and CMS decisions.
3. Assessment `design-notes.md` consolidates reviewer-facing summary.

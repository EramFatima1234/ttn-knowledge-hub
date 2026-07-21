# ADR-009 — Why Gemini AI

**Status:** Accepted  
**Date:** 2026 (Phase 7–8)  
**Scope:** `apps/api/src/modules/ai/`, `apps/web/src/features/ai/`

## Problem

Learners need in-app discovery and video assistance (summaries, quizzes) without sending data to unapproved third parties. Ops need a provider that can be disabled in dev.

## Decision

Use **Google Gemini** behind an env-selected adapter:

- `AI_PROVIDER=gemini` (default path); `GEMINI_API_KEY` on API only — **not** `GOOGLE_CLIENT_ID`.
- Endpoints: `GET /ai/status`, `POST /ai/discover`, `POST /ai/discover/stream`, `POST /ai/videos/:videoId/summary`, `POST /ai/videos/:videoId/quiz`.
- Web: `KnowledgeHubAiFab`, AI drawer (lazy-loaded), `VideoAiPanel` on watch page.
- Noop provider when key missing — UI shows unavailable state via `useAiStatus`.

Setup: `docs/gemini-setup.md`.

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| OpenAI only | Google stack already used for OAuth; Gemini key separation documented |
| On-prem LLM | Operational cost for internal MVP |
| Client-side API keys | Security violation |

## Tradeoffs

- **Pros:** Streaming discover endpoint; centralized guardrails in `ai.service.ts`.
- **Cons:** Token cost and rate limits; streaming error handling must stay robust.

## Future impact

- Keep prompts and model name in env (`GEMINI_MODEL` if configured).
- Log redaction: never log API keys or full user prompts in production.

## Traceability

| Layer | Location |
|-------|----------|
| API | `apps/api/src/modules/ai/` |
| Web | `apps/web/src/features/ai/` |
| Docs | `architecture/knowledgehub-ai-flow.md`, `ai/project-context.md` |

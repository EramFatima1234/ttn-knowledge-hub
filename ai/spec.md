# AI Module Spec (as implemented)

## API (`apps/api/src/modules/ai/`)

| Endpoint | Behavior |
|----------|----------|
| `GET /ai/status` | Provider configured? |
| `POST /ai/discover` | Non-streaming discover |
| `POST /ai/discover/stream` | Streaming discover |
| `POST /ai/videos/:videoId/summary` | Summary for published video |
| `POST /ai/videos/:videoId/quiz` | Quiz generation |

Env: `AI_PROVIDER=gemini`, `GEMINI_API_KEY`. Noop when unset.

## Web (`apps/web/src/features/ai/`)

- `KnowledgeHubAiFab` / drawer (lazy)
- `VideoAiPanel` on watch page
- `useAiStatus(enabled)` when drawer opens

## Constraints

- Never expose API key to client.
- Distinguish Gemini key from `GOOGLE_CLIENT_ID` (`docs/gemini-setup.md`).

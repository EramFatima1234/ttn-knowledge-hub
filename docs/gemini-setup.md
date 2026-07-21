# Google Gemini setup (KnowledgeHub AI)

KnowledgeHub AI uses a provider abstraction:

```
AIProvider → GeminiProvider (today)
           → OpenAIProvider (future)
           → OllamaProvider (future)
```

## 1. Create a Gemini API key

1. Open [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Click **Create API key**.
4. Copy the key — it should start with **`AIza`**.  
   Keys starting with other prefixes (e.g. `AQ.`) are **not** valid for the Gemini Developer API.

Free tier quotas apply. For production, review [Gemini API pricing](https://ai.google.dev/pricing) and rate limits.

## 2. Configure the API

Add to `apps/api/.env` (or your deployment secrets):

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.0-flash
```

| Variable | Description |
|----------|-------------|
| `AI_PROVIDER` | `gemini` (default). `openai` / `ollama` reserved for future adapters. |
| `GEMINI_API_KEY` | Required for AI summary, quiz, roadmap, and enriched discover answers. |
| `GEMINI_MODEL` | Optional. Default `gemini-2.0-flash`. |

Restart the API after changing env vars:

```bash
cd apps/api && npx pnpm@9.15.4 dev
```

## 3. Verify

```bash
curl -s -H "Authorization: Bearer <access_token>" \
  http://localhost:3001/api/v1/ai/status
```

Expected when configured:

```json
{ "data": { "enabled": true, "provider": "gemini", "streaming": true } }
```

## 4. Features in the UI

| Feature | Where |
|---------|--------|
| **KnowledgeHub AI** (discover content) | Floating robot button → drawer with suggested prompts |
| **AI Summary** | Watch page → ✨ AI Summary |
| **AI Quiz** | Watch page → AI Quiz (5 MCQs) |

Without `GEMINI_API_KEY`, discover still returns catalog matches; summary/quiz show a setup notice.

## 5. Security notes

- Never commit `GEMINI_API_KEY` to git.
- Keys are server-side only (`apps/api`); the web app calls `/api/v1/ai/*` with the user JWT.
- Rotate keys in Google AI Studio if exposed.

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| `AI is not configured` on summary/quiz | Set `GEMINI_API_KEY` and restart API |
| `Gemini request failed` | Check key validity, model name, and network egress to `generativelanguage.googleapis.com` |
| Empty discover answer | Catalog may have no matches; try broader prompts or seed content |
| Streaming stalls | Proxy buffering: ensure SSE route is not buffered (Nest `discover/stream` uses `text/event-stream`) |

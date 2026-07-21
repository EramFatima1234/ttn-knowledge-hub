# AI Prompt Library

Human- and agent-facing prompts for KnowledgeHub AI work. Full catalog: [`.cursor/prompt-library.md`](../.cursor/prompt-library.md).

## Extend AI safely

```
Read ai/spec.md, adr/ADR-009-why-gemini-ai.md, and apps/api/src/modules/ai/.
Implement [CHANGE] server-side only with GEMINI_API_KEY. Update docs/api-contract.md and architecture/knowledgehub-ai-flow.md.
Lazy-load any new web UI. No secrets in NEXT_PUBLIC_*.
```

## Debug AI unavailable

```
Check GET /ai/status, API env GEMINI_API_KEY (AIza prefix), AI_PROVIDER=gemini.
Verify useAiStatus(enabled) only when drawer opens. See docs/gemini-setup.md.
```

## Category prompts

| File | Use |
|------|-----|
| [planning-prompts.md](./planning-prompts.md) | Scope and ADR |
| [design-prompts.md](./design-prompts.md) | Aspire / Ant Design |
| [implementation-prompts.md](./implementation-prompts.md) | API + web hooks |
| [testing-prompts.md](./testing-prompts.md) | Status and E2E |
| [debugging-prompts.md](./debugging-prompts.md) | Incidents |
| [performance-prompts.md](./performance-prompts.md) | Bundle and lazy load |
| [review-prompts.md](./review-prompts.md) | PR review |
| [documentation-prompts.md](./documentation-prompts.md) | Doc updates |

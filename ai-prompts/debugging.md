# AI Prompts — Debugging

## Objective

Capture real debugging sessions for assessment `debugging-notes.md`.

## Prompt Summary

> "localhost:3000 loading forever; POST /api/auth/google 500; restart servers until working."

## AI Response Summary

- Traced 500 to database unreachable and API crash on boot.
- Port 3000 conflicts (`EADDRINUSE`).
- Agent shell `EAGAIN` / `pthread_create` under heavy Turbo+Turbopack.
- Documented fixes in `debugging-notes.md`.

## Accepted Suggestions

- Verify API health before blaming Google OAuth config.
- Compare API vs web Google client IDs.

## Rejected Suggestions

- Disabling auth for local dev (security violation).

## Reasoning

Debug narrative demonstrates AI-assisted ops troubleshooting aligned with real logs.

## Iteration History

1. Health poll showed API 200 while web curl failed intermittently.
2. Seed + restart resolved auth 500 for valid tokens.

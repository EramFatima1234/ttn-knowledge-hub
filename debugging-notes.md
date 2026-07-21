# Debugging Notes — KnowledgeHub

Real issues encountered during development and AI-assisted troubleshooting (not hypothetical).

## Google OAuth — `POST /api/auth/google` returns 500

| Symptom | Cause | Fix |
|---------|-------|-----|
| 500 from `/api/auth/google` | PostgreSQL not running (`P1001`) | `docker compose up -d postgres`, `pnpm db:migrate`, `pnpm db:seed` |
| 500 on first login | Missing `USER` role in DB | Run `pnpm db:seed` |
| 401 | Invalid token or `GOOGLE_CLIENT_ID` mismatch vs web | Align `apps/api/.env` and `apps/web/.env.local` |

**Code hardening:** `users.repository.ts` throws `503` with seed hint when role missing.

## React Query

- Notifications list fetched only when bell opens (perf fix — see `docs/performance-report.md`).
- Taxonomy `staleTime` 10 minutes to reduce refetch noise.

## Next.js

- `EADDRINUSE` on port 3000 — kill stale `next dev` (`fuser -k 3000/tcp`).
- Turbopack + low thread limit → `pthread_create` errors; use `npm run dev:webpack` in `apps/web`.
- Auth infinite spinner — fixed `AuthProvider` hydration fallback when Zustand persist stalls.

## NestJS

- API must restart after DB comes online (Prisma init on boot).
- Refresh cookie path `/api/auth` (not `/api/v1/auth`) — see `auth.controller.ts`.

## Ant Design

- Ant Design 6 prop migrations (`Alert` `title`, `Drawer` `size`) — see `.cursor/rules/frontend.mdc`.

## API integration

- Web uses `getApiBase()` → `/api` in browser for cookies on refresh.
- Next rewrites require `NEXT_PUBLIC_API_URL` in `apps/web/.env.local`.

## Video URLs

- External URLs vs `GET /videos/:id/stream` — player handles embed vs stored file (`VideoPlayer.tsx`).

## Performance / dev environment

- Turbo `pnpm dev` with types watch + Turbopack stressed thread limits → split API/web start via `scripts/dev-restart.sh`.
- `npx pnpm` ENOTEMPTY in sandbox — use local `npm run dev` in app folders when pnpm not on PATH.

## Build issues

- `next build` may need `--webpack` on some TS edge cases (documented in README).
- Monorepo build runs `db:generate` first.

Log references: API terminal output, `PROJECT_HEALTH.md`, `docs/performance-report.md`.

# Debugging Guide

## Common issues

| Symptom | Check |
|---------|--------|
| 500 on `/api/auth/google` | API running on 3001; valid `GOOGLE_CLIENT_ID` |
| CORS errors | `CORS_ORIGIN` matches web URL |
| Empty home feed | Seed data; user authenticated |
| AI unavailable | `GEMINI_API_KEY` on API; `GET /ai/status` |
| Wrong API URL | Use `apps/web/.env.local` not only root `.env.local` |

## Tools

- Prisma Studio: `pnpm db:studio`
- Swagger: http://localhost:3001/api/v1/docs
- React Query Devtools (if enabled in QueryProvider)
- Playwright trace on E2E failure

## API logs

Nest logger in terminal running `pnpm --filter @knowledgehub/api dev`.

## Next build TS errors

Try `cd apps/web && npx next build --webpack`.

See `onboarding/troubleshooting.md`.

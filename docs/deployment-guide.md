# Deployment Guide

## Web (`apps/web`)

1. Set `NEXT_PUBLIC_API_URL` to public API base (includes `/api/v1`).
2. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
3. Build: `pnpm --filter @knowledgehub/web build` (or root `pnpm build`).
4. Run standalone Node server from `.next/standalone`.

## API (`apps/api`)

1. Set `DATABASE_URL`, JWT secrets, `GOOGLE_CLIENT_ID`, `CORS_ORIGIN`.
2. `pnpm --filter @knowledgehub/api db:migrate:deploy`
3. `pnpm --filter @knowledgehub/api build && pnpm start:prod`
4. `PORT` default 3001; `API_PREFIX=api/v1`.

## Database

Managed PostgreSQL 16; run migrations on deploy.

## Files

`STORAGE_PROVIDER=S3` + AWS credentials for production uploads.

## Search

Optional: Elasticsearch + `SEARCH_PROVIDER=elasticsearch`.

## Mail / push

`MAIL_PROVIDER=smtp`, `PUSH_PROVIDER=webpush` + VAPID keys.

## Secrets

Inject via platform secret store — never commit `.env` files.

See `README.md` deployment section.

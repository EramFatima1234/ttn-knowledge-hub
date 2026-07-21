# Setup Guide

Detailed steps from `README.md`.

## 1. Prerequisites

Node ≥ 20, pnpm 9.15.4, Docker.

## 2. Infrastructure

```bash
docker compose -f docker/docker-compose.yml up -d
```

## 3. Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edit: `DATABASE_URL`, JWT secrets, `GOOGLE_CLIENT_ID`, matching web `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## 4. Install & DB

```bash
npx pnpm@9.15.4 install
npx pnpm@9.15.4 db:migrate
npx pnpm@9.15.4 db:seed
```

## 5. Run

```bash
npx pnpm@9.15.4 dev
```

Web: http://localhost:3000 · API: http://localhost:3001/api/v1

## 6. Admin access

Sign in with Google; existing admin assigns roles at `/admin/users`.

Gemini: `docs/gemini-setup.md`.

Linux HMR: `WATCHPACK_POLLING=true` in `apps/web`.

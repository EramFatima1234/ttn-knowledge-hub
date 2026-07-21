# Database — Setup Notes

## Schema

- **Prisma schema:** `apps/api/prisma/schema.prisma`
- **ER narrative:** root `data-model.md`, `docs/database-design.md`

## Migrations

- **Location:** `apps/api/prisma/migrations/`
- **Index:** `database/schema-or-migrations/README.md`
- **Dev:** `pnpm db:migrate` (from repo root)
- **Deploy:** `pnpm --filter @knowledgehub/api db:migrate:deploy`

## Seed data

- **Script:** `apps/api/prisma/seed.ts`
- **Command:** `pnpm db:seed`
- **Contents:** Roles, permissions, competencies (18+), categories, sample videos/meets/series, notifications
- **Details:** `database/seed-data/README.md`
- **Note:** Login is always Google OAuth — seed does not create password users.

## Docker (local)

```bash
docker compose -f docker/docker-compose.yml up -d postgres
```

Default connection (see `apps/api/.env.example`):

`postgresql://knowledgehub:knowledgehub@localhost:5432/knowledgehub`

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (API) |

## Troubleshooting

- `P1001` — start Postgres container or fix `DATABASE_URL`.
- Auth 500 on login — run `pnpm db:seed` after migrate.
- Elasticsearch optional — not required for core flows (`SEARCH_PROVIDER=postgres`).

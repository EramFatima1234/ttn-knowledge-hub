# Schema & Migrations

KnowledgeHub uses **Prisma migrate**. Migration SQL files live in the canonical path:

```
apps/api/prisma/migrations/
```

Each folder is timestamped, e.g. `20260720143000_cms_url_metadata/`.

## Apply

| Environment | Command |
|-------------|---------|
| Local dev | `pnpm db:migrate` |
| Production | `pnpm --filter @knowledgehub/api db:migrate:deploy` |

## Generate client

`pnpm db:generate` (runs from root via Turbo before build).

Do not duplicate migration files in this folder — this directory exists for **assessment structure** and points to the implementation above.

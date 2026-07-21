# Backend Architecture

**App:** `apps/api` — NestJS 11, Express.

## Structure

```
src/
  main.ts, app.module.ts
  config/configuration.ts
  common/guards, filters, interceptors
  modules/<feature>/
    *.module.ts
    *.controller.ts
    *.service.ts
    dto/
```

## Domain modules

Listed in `architecture/backend-flow.md`. Largest surface: `admin-cms` (CRUD + homepage + settings).

## Validation

DTOs use `class-validator`. Global `ValidationPipe` strips unknown properties per config.

## Prisma

Single schema `prisma/schema.prisma`. Services inject `PrismaService`.

## Integrations

Env-selected adapters for storage, search, mail, push, AI — see `apps/api/.env.example`.

## Swagger

Enabled in development: `/api/v1/docs`.

Cursor: `.cursor/rules/backend.mdc`, `.cursor/backend-guidelines.md`.

# ADR-002 — Why NestJS

**Status:** Accepted  
**Date:** 2026 (Phase 2)  
**Scope:** `apps/api`

## Problem

The platform requires a structured REST API with Google OAuth, JWT, RBAC, file uploads, streaming (HTTP Range), scheduled jobs, and many domain modules (videos, meets, series, CMS, search, AI). Ad-hoc Express routing would not scale for team onboarding or consistent guards/DTO validation.

## Decision

Use **NestJS 11** on Express with modular boundaries under `apps/api/src/modules/`, global **`JwtAuthGuard`**, **`RolesGuard`**, **`PermissionsGuard`**, **`ValidationPipe`**, **`TransformInterceptor`**, and **Swagger** at `/api/v1/docs` in development.

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Fastify-only custom stack | Less convention for guards, modules, and DI |
| tRPC end-to-end | Web and mobile clients expect REST; admin CMS uses fetch patterns already |
| Serverless functions per route | Poor fit for streaming, websockets (AI stream), and long-lived DB connections |

## Tradeoffs

- **Pros:** Clear module map mirrors product domains; Prisma integrates cleanly in services; schedule module for jobs.
- **Cons:** Boilerplate per module; large services (e.g. `admin-cms.service.ts` ~1400 lines) need careful splitting over time.

## Future impact

- New features → new or extended Nest module + DTOs + Prisma migration.
- Preserve `API_PREFIX` and response envelope from `TransformInterceptor` to avoid breaking the web client.

## Traceability

| Layer | Location |
|-------|----------|
| Bootstrap | `apps/api/src/main.ts`, `apps/api/src/app.module.ts` |
| Docs | `docs/backend-architecture.md`, `architecture/backend-flow.md` |

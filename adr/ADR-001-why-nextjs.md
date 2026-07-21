# ADR-001 — Why Next.js

**Status:** Accepted  
**Date:** 2026 (Phase 3)  
**Scope:** `apps/web`

## Problem

KnowledgeHub needs a modern web client for `@tothenew.com` employees: authenticated app shell, SEO-friendly public login, fast local dev, and container-friendly production builds. The frontend must proxy API traffic, share types with the API monorepo, and support a large feature set (watch, admin CMS, search, AI drawer) without maintaining a separate bundler toolchain.

## Decision

Use **Next.js 16** with the **App Router** (`apps/web/src/app/`), `output: "standalone"` for deployment, and **rewrites** in `apps/web/next.config.ts` so browser calls `/api/*`, `/storage/*`, and `/uploads/*` reach the Nest API (`NEXT_PUBLIC_API_URL`).

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Vite + React SPA only | No built-in routing/layout conventions; more custom proxy and SSR story |
| Remix | Smaller ecosystem fit with existing Ant Design + Aspire SCSS investment |
| Separate static site + CDN | Harder to unify auth cookies, rewrites, and incremental adoption of RSC later |

## Tradeoffs

- **Pros:** File-based routing matches admin/learner areas; standalone output suits Docker; mature ecosystem with React 19.
- **Cons:** Authenticated `(app)/layout.tsx` is fully client-side today — large hydration cost (see `docs/performance-report.md`). Full RSC migration deferred.

## Future impact

- Prefer Server Components for read-mostly pages when safe (explore, static marketing).
- Keep rewrites aligned with `API_PREFIX` (`api/v1`) on deploy.
- Document env in `apps/web/.env.example`; never commit `.env.local`.

## Traceability

| Layer | Location |
|-------|----------|
| Implementation | `apps/web/next.config.ts`, `apps/web/src/app/` |
| Docs | `docs/frontend-architecture.md`, `architecture/frontend-flow.md` |

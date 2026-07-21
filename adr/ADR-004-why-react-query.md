# ADR-004 — Why React Query (TanStack Query)

**Status:** Accepted  
**Date:** 2026 (Phase 3–4)  
**Scope:** `apps/web`

## Problem

The client loads feeds, taxonomy, notifications, watch metadata, and admin CMS tables from many REST endpoints. Manual `useEffect` + `useState` causes duplicated loading/error logic, cache inconsistency, and over-fetching on navigation.

## Decision

Use **@tanstack/react-query v5** with a shared **`QueryProvider`** (`apps/web/src/components/providers/QueryProvider.tsx`). Domain hooks wrap `useQuery` / `useMutation` (e.g. `useDashboard`, `useVideos`, `useAdminCms`).

Defaults (from performance pass): `staleTime` ~60s global; taxonomy **10m**; notifications list **only when bell opens**; unread count polled ~60s.

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Redux for all server state | RTK already used sparingly; server cache fits React Query |
| SWR | Team standardized on TanStack Query patterns in hooks |
| Apollo GraphQL | No GraphQL API; REST + OpenAPI/Swagger on API |

## Tradeoffs

- **Pros:** Declarative cache, mutations with invalidation, devtools-friendly.
- **Cons:** Home still calls `feed/dashboard` + `feed/recommendations` in parallel (merge deferred per perf report).

## Future impact

- New read APIs → add hook + query key convention under `apps/web/src/hooks/`.
- Align invalidation with CMS publish flows (meets/series/videos).

## Traceability

| Layer | Location |
|-------|----------|
| Provider | `apps/web/src/components/providers/QueryProvider.tsx` |
| Docs | `docs/performance-guide.md`, `docs/testing-strategy.md` |

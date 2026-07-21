# Performance Guide

Source audit: `docs/performance-report.md` (2026-07-20).

## React optimization

- Prefer `next/dynamic` for heavy below-fold UI (watch page sections, AI, mini player).
- Memoize expensive lists where profiling shows rerenders.
- `VideoPlayer`: `preload="metadata"` to reduce bandwidth.

## Next.js optimization

- `output: "standalone"` for production images.
- Rewrites avoid CORS preflight on API from browser.
- Full RSC for app shell **deferred** (high risk).

## React Query strategy

- Global `staleTime` ~60s; taxonomy 10m.
- Notifications list: fetch on bell open only.
- Unread count: interval ~60s, not in background tab aggressively.

## Bundle splitting

- Dynamic imports reduced layout chunk; vendor ~1.4MB (Ant Design) remains.

## Lazy loading

- Right sidebar chunk when panel opens.
- `@ant-design/plots` dynamic in analytics.

## Database optimization

- Prisma indexes on FKs and hot filters (`status`, `publishedAt`, history `lastWatchedAt`).
- List endpoints use includes required for DTOs — slimming needs API contract agreement.

## Caching strategy

- Client: React Query cache (`gcTime` 5m).
- Server: no Redis layer today; optional ES cache for search.

## Future improvements

- Merge `feed/dashboard` + `feed/recommendations` payloads.
- Server Components for read-only pages.
- API response DTO slimming for list views.

# Phase 6 — Search, Recommendations, Analytics & Notifications

## Delivered

### Search (PostgreSQL FTS)
- Migration adds generated `search_vector` columns + GIN indexes on `videos`, `knowledge_meets`, `knowledge_series`
- `GET /search` — full-text search with filters (`q`, `types`, `competencyId`, `categoryId`, `sort`, pagination)
- `GET /search/suggestions` — autocomplete titles
- Frontend `/search` page with filters and header query passthrough (`?q=`)

### Explore
- `GET /explore` — competency browse hub with counts + featured content
- Frontend `/explore` page with competency cards and filtered video rows

### Recommendations
- `GET /feed/recommendations` — personalized rows from history/bookmarks + trending fallback
- `GET /feed/related/:contentType/:id` — related content on detail pages
- Home page “Recommended for you” row
- Watch page related videos sidebar

### Notifications
- `GET /notifications` — paginated inbox
- `GET /notifications/unread-count` — header badge
- `PATCH /notifications/:id/read` — mark one read
- `POST /notifications/read-all` — mark all read
- Approval approve/reject triggers uploader notifications
- Header notification bell dropdown

### Analytics
- `GET /admin/analytics?days=30` — content, engagement, and user metrics
- Frontend `/admin/analytics` dashboard (stats, role breakdown, top videos)

## API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/search` | JWT | Unified FTS search |
| GET | `/search/suggestions` | JWT | Autocomplete |
| GET | `/explore` | JWT | Explore hub |
| GET | `/feed/recommendations` | JWT | Personalized recommendations |
| GET | `/feed/related/:type/:id` | JWT | Related content |
| GET | `/notifications` | JWT | Notification list |
| GET | `/notifications/unread-count` | JWT | Unread badge count |
| PATCH | `/notifications/:id/read` | JWT | Mark read |
| POST | `/notifications/read-all` | JWT | Mark all read |
| POST | `/admin/search/reindex` | Admin + `analytics:view` | Reindex Elasticsearch |
| GET | `/push/vapid-public-key` | JWT | Browser push public key |
| POST | `/push/subscribe` | JWT | Register push subscription |

## Setup

```bash
npx pnpm@9.15.4 db:migrate
npx pnpm@9.15.4 db:seed
docker compose -f docker/docker-compose.yml up -d elasticsearch
```

## Phase 6.1 — Elasticsearch, email/push, charts, cron

### Elasticsearch
- Docker service in `docker/docker-compose.yml`
- Set `SEARCH_PROVIDER=elasticsearch` in `apps/api/.env`
- Postgres FTS fallback when ES is unavailable
- Sync on video approve/reject; `POST /admin/search/reindex`

### Email (`MAIL_PROVIDER=console|smtp`)
- Console logs in dev; SMTP for production
- Sent on every notification delivery

### Browser push (`PUSH_PROVIDER=console|webpush`)
- VAPID keys in env; service worker at `apps/web/public/sw.js`
- Enable from notification bell → “Enable push”

### Meet publish notifications
- Cron job registered but **disabled** (no live meet reminders)
- `MEET_PUBLISHED` on first recording publish

### Chart visualizations
- `@ant-design/plots` line charts on `/admin/analytics`

## Still deferred
- HomepageSection admin curation UI
- Mobile native push (FCM/APNs)
- Email digest batching

# Phase 4 — Content & Engagement

## Backend APIs

| Module | Endpoints |
|--------|-----------|
| Videos | `GET /videos`, `GET /videos/:id`, `POST /videos/:id/view` |
| Knowledge Meets | `GET /knowledge-meets`, `GET /knowledge-meets/:id` |
| Knowledge Series | `GET /knowledge-series`, `GET /knowledge-series/:id` |
| Engagement | `GET/POST /comments`, `GET/POST /bookmarks`, `GET/PUT /history` |
| Feed | `GET /feed/home` |

## Frontend Routes

| Route | Feature |
|-------|---------|
| `/watch/[id]` | Video player, progress sync, comments, bookmarks |
| `/meets` | Recorded meets library (filters: competency, speaker, year, difficulty, tag) |
| `/meets/[id]` | Redirects to watch page when recording is published |
| `/series` | Series list with progress |
| `/series/[id]` | Sessions with continue watching |
| `/library` | Continue watching, bookmarks, history |

## Seed Content

Run `pnpm db:seed` to load sample videos, series, meets, and announcements.

## Next Phase

Phase 5: Admin panel, upload flow, approval workflow, announcements management.

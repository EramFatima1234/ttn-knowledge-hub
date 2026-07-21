# API Contract — KnowledgeHub

**Base URL:** `http://localhost:3001/api/v1`  
**Web proxy:** `http://localhost:3000/api/*` → API (see `apps/web/next.config.ts`)  
**Swagger:** `/api/v1/docs`  
**Envelope:** Success responses wrapped as `{ "data": ... }` via `TransformInterceptor`.  
**Errors:** `{ "statusCode", "message", "timestamp", "path" }` via `GlobalExceptionFilter`.

Regenerate index: `python3 scripts/generate-api-contract.py` (also updates `docs/api-contract.md`).

---

## Contract pattern (all endpoints)

| Field | Description |
|-------|-------------|
| **Authentication** | `Authorization: Bearer <accessToken>` unless `@Public()` |
| **Authorization** | `RolesGuard` / `PermissionsGuard` on admin, team, CMS routes |
| **Validation** | DTOs in `apps/api/src/modules/*/dto/` |
| **Error responses** | 400 validation, 401 auth, 403 forbidden, 404 not found, 500 unhandled |

---

## Auth (`/auth`)

| Method | Route | Purpose | Auth | Request | Response | Errors |
|--------|-------|---------|------|---------|----------|--------|
| POST | `/auth/google` | Google ID token login | Public | `{ "idToken": string }` | `{ data: { accessToken, user } }` + Set-Cookie refresh | 401 invalid token, 403 domain, 500 DB |
| POST | `/auth/refresh` | Rotate access token | Public (cookie) | Cookie `kh_refresh_token` | `{ data: { accessToken, user } }` | 401 missing/invalid refresh |
| POST | `/auth/logout` | Revoke refresh | Public (cookie) | Cookie | `{ data: { success: true } }` | — |
| GET | `/auth/me` | Current user | JWT | — | `{ data: AuthUser }` | 401 |

---

## Videos (`/videos`)

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/videos` | List published videos | JWT |
| GET | `/videos/:id` | Detail | JWT |
| GET | `/videos/:id/playback` | Playback metadata | JWT |
| GET | `/videos/:id/stream` | Binary stream (Range) | JWT |
| POST | `/videos/:id/view` | Increment view | JWT |
| PUT | `/history` | Save progress (engagement module) | JWT |

---

## Content Manager (`/admin/cms`)

CRUD for meets, series, episodes, speakers, competencies, resources; `PUT /admin/cms/homepage`; `PATCH /admin/cms/settings`. Requires **ADMIN** (and permissions per route).

---

## KnowledgeHub AI (`/ai`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/ai/status` | Provider availability |
| POST | `/ai/discover` | Discovery chat |
| POST | `/ai/discover/stream` | Streaming discovery |
| POST | `/ai/videos/:videoId/summary` | Video summary |
| POST | `/ai/videos/:videoId/quiz` | Quiz generation |

---

## Full endpoint index

## Endpoint index

128 routes indexed from Nest `@Controller` / HTTP method decorators (July 2026). For request/response bodies use **Swagger** at `/api/v1/docs`.

| Method | Route | Module file |
|--------|-------|-------------|
| GET | `/health` | `apps/api/src/health.controller.ts` |
| GET | `/admin/overview` | `apps/api/src/modules/admin/admin.controller.ts` |
| POST | `/admin/search/reindex` | `apps/api/src/modules/admin/admin.controller.ts` |
| GET | `/admin/approvals/pending` | `apps/api/src/modules/admin/admin.controller.ts` |
| POST | `/admin/approvals/:id/approve` | `apps/api/src/modules/admin/admin.controller.ts` |
| POST | `/admin/approvals/:id/reject` | `apps/api/src/modules/admin/admin.controller.ts` |
| GET | `/admin/announcements` | `apps/api/src/modules/admin/admin.controller.ts` |
| POST | `/admin/announcements` | `apps/api/src/modules/admin/admin.controller.ts` |
| PATCH | `/admin/announcements/:id` | `apps/api/src/modules/admin/admin.controller.ts` |
| DELETE | `/admin/announcements/:id` | `apps/api/src/modules/admin/admin.controller.ts` |
| GET | `/announcements` | `apps/api/src/modules/admin/admin.controller.ts` |
| GET | `/admin/cms/meets` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/meets/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| POST | `/admin/cms/meets` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PATCH | `/admin/cms/meets/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PUT | `/admin/cms/meets/:id/recording` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| DELETE | `/admin/cms/meets/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| POST | `/admin/cms/meets/:id/duplicate` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/series` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/series/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| POST | `/admin/cms/series` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PATCH | `/admin/cms/series/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| DELETE | `/admin/cms/series/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/series/:seriesId/episodes` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| POST | `/admin/cms/series/:seriesId/episodes` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PATCH | `/admin/cms/series/:seriesId/episodes/:episodeId` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| DELETE | `/admin/cms/series/:seriesId/episodes/:episodeId` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PUT | `/admin/cms/series/:seriesId/episodes/reorder` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/resources` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| POST | `/admin/cms/resources` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PATCH | `/admin/cms/resources/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| DELETE | `/admin/cms/resources/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/speakers` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/speakers/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| POST | `/admin/cms/speakers` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PATCH | `/admin/cms/speakers/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| DELETE | `/admin/cms/speakers/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/competencies` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| POST | `/admin/cms/competencies` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PATCH | `/admin/cms/competencies/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| DELETE | `/admin/cms/competencies/:id` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/homepage` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PUT | `/admin/cms/homepage` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/admin/cms/settings` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| PATCH | `/admin/cms/settings` | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| GET | `/homepage/layout` | `apps/api/src/modules/admin-cms/platform.controller.ts` |
| GET | `/platform/settings` | `apps/api/src/modules/admin-cms/platform.controller.ts` |
| GET | `/team/meets` | `apps/api/src/modules/admin-cms/team-meets.controller.ts` |
| PUT | `/team/meets/:meetId/recording` | `apps/api/src/modules/admin-cms/team-meets.controller.ts` |
| GET | `/team/series` | `apps/api/src/modules/admin-cms/team-series.controller.ts` |
| GET | `/team/series/:seriesId/episodes` | `apps/api/src/modules/admin-cms/team-series.controller.ts` |
| PUT | `/team/series/:seriesId/episodes/:orderIndex` | `apps/api/src/modules/admin-cms/team-series.controller.ts` |
| GET | `/ai/status` | `apps/api/src/modules/ai/ai.controller.ts` |
| POST | `/ai/discover` | `apps/api/src/modules/ai/ai.controller.ts` |
| POST | `/ai/discover/stream` | `apps/api/src/modules/ai/ai.controller.ts` |
| POST | `/ai/videos/:videoId/summary` | `apps/api/src/modules/ai/ai.controller.ts` |
| POST | `/ai/videos/:videoId/quiz` | `apps/api/src/modules/ai/ai.controller.ts` |
| POST | `/auth/google` | `apps/api/src/modules/auth/auth.controller.ts` |
| POST | `/auth/refresh` | `apps/api/src/modules/auth/auth.controller.ts` |
| POST | `/auth/logout` | `apps/api/src/modules/auth/auth.controller.ts` |
| GET | `/auth/me` | `apps/api/src/modules/auth/auth.controller.ts` |
| GET | `/comments` | `apps/api/src/modules/engagement/engagement.controller.ts` |
| POST | `/comments` | `apps/api/src/modules/engagement/engagement.controller.ts` |
| GET | `/bookmarks` | `apps/api/src/modules/engagement/engagement.controller.ts` |
| POST | `/bookmarks` | `apps/api/src/modules/engagement/engagement.controller.ts` |
| GET | `/history/continue-watching` | `apps/api/src/modules/engagement/engagement.controller.ts` |
| GET | `/history` | `apps/api/src/modules/engagement/engagement.controller.ts` |
| PUT | `/history` | `apps/api/src/modules/engagement/engagement.controller.ts` |
| GET | `/feed/home` | `apps/api/src/modules/feed/feed.controller.ts` |
| GET | `/feed/dashboard` | `apps/api/src/modules/feed/feed.controller.ts` |
| GET | `/feed/recommendations` | `apps/api/src/modules/feed/feed.controller.ts` |
| GET | `/explore` | `apps/api/src/modules/feed/feed.controller.ts` |
| GET | `/feed/related/:contentType/:id` | `apps/api/src/modules/feed/feed.controller.ts` |
| GET | `/knowledge-meets` | `apps/api/src/modules/knowledge-meets/meets.controller.ts` |
| GET | `/knowledge-meets/:id` | `apps/api/src/modules/knowledge-meets/meets.controller.ts` |
| GET | `/knowledge-series` | `apps/api/src/modules/knowledge-series/series.controller.ts` |
| GET | `/knowledge-series/:id` | `apps/api/src/modules/knowledge-series/series.controller.ts` |
| GET | `/progress/summary` | `apps/api/src/modules/progress/progress.controller.ts` |
| GET | `/progress/weekly-activity` | `apps/api/src/modules/progress/progress.controller.ts` |
| GET | `/progress/playback-preferences` | `apps/api/src/modules/progress/progress.controller.ts` |
| PUT | `/progress/playback-preferences` | `apps/api/src/modules/progress/progress.controller.ts` |
| GET | `/push/vapid-public-key` | `apps/api/src/modules/push/push.controller.ts` |
| POST | `/push/subscribe` | `apps/api/src/modules/push/push.controller.ts` |
| DELETE | `/push/subscribe` | `apps/api/src/modules/push/push.controller.ts` |
| GET | `/videos/:videoId/questions` | `apps/api/src/modules/qa/qa.controller.ts` |
| POST | `/videos/:videoId/questions` | `apps/api/src/modules/qa/qa.controller.ts` |
| POST | `/questions/:questionId/answers` | `apps/api/src/modules/qa/qa.controller.ts` |
| POST | `/questions/:questionId/vote` | `apps/api/src/modules/qa/qa.controller.ts` |
| POST | `/answers/:answerId/vote` | `apps/api/src/modules/qa/qa.controller.ts` |
| POST | `/answers/:answerId/accept` | `apps/api/src/modules/qa/qa.controller.ts` |
| GET | `/videos/:videoId/resources` | `apps/api/src/modules/resources/resources.controller.ts` |
| POST | `/videos/:videoId/resources` | `apps/api/src/modules/resources/resources.controller.ts` |
| GET | `/search` | `apps/api/src/modules/search/search.controller.ts` |
| GET | `/search/suggestions` | `apps/api/src/modules/search/search.controller.ts` |
| GET | `/search/recent` | `apps/api/src/modules/search/search.controller.ts` |
| GET | `/search/popular` | `apps/api/src/modules/search/search.controller.ts` |
| GET | `/search/trending` | `apps/api/src/modules/search/search.controller.ts` |
| GET | `/speakers` | `apps/api/src/modules/speakers/speakers.controller.ts` |
| GET | `/speakers/:slugOrId` | `apps/api/src/modules/speakers/speakers.controller.ts` |
| POST | `/uploads/presign` | `apps/api/src/modules/storage/storage.controller.ts` |
| POST | `/uploads/file` | `apps/api/src/modules/storage/storage.controller.ts` |
| POST | `/uploads/complete` | `apps/api/src/modules/storage/storage.controller.ts` |
| GET | `/studio/drafts/:contentType` | `apps/api/src/modules/studio/studio.controller.ts` |
| PUT | `/studio/drafts/:contentType` | `apps/api/src/modules/studio/studio.controller.ts` |
| POST | `/studio/videos/:id/publish` | `apps/api/src/modules/studio/studio.controller.ts` |
| GET | `/competencies` | `apps/api/src/modules/taxonomy/taxonomy.controller.ts` |
| GET | `/categories` | `apps/api/src/modules/taxonomy/taxonomy.controller.ts` |
| GET | `/users/me` | `apps/api/src/modules/users/users.controller.ts` |
| GET | `/users` | `apps/api/src/modules/users/users.controller.ts` |
| POST | `/users/:id/roles` | `apps/api/src/modules/users/users.controller.ts` |
| DELETE | `/users/:id/roles/:role` | `apps/api/src/modules/users/users.controller.ts` |
| GET | `/videos` | `apps/api/src/modules/videos/videos.controller.ts` |
| GET | `/videos/mine` | `apps/api/src/modules/videos/videos.controller.ts` |
| POST | `/videos` | `apps/api/src/modules/videos/videos.controller.ts` |
| GET | `/videos/:id/playback` | `apps/api/src/modules/videos/videos.controller.ts` |
| GET | `/videos/:id/stream` | `apps/api/src/modules/videos/videos.controller.ts` |
| GET | `/videos/:id` | `apps/api/src/modules/videos/videos.controller.ts` |
| PATCH | `/videos/:id` | `apps/api/src/modules/videos/videos.controller.ts` |
| POST | `/videos/:id/submit` | `apps/api/src/modules/videos/videos.controller.ts` |
| POST | `/videos/:id/view` | `apps/api/src/modules/videos/videos.controller.ts` |

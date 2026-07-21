# Phase 7 — Engineering Knowledge Platform

Transforms KnowledgeHub from a basic LMS into a modern engineering knowledge platform.

## 1. Professional Streaming

### API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/videos/:id/playback` | Playback manifest (stream URL, resume, speed, next episode) |
| GET | `/videos/:id/stream` | HTTP Range Request streaming for local files |

### Features
- Resume from `progressSeconds` in history
- Playback speed preference (`UserPlaybackPreference`)
- Auto-play next series episode
- Watch activity logging for streaks

### Frontend
- `VideoPlayer` — speed control, resume, autoplay next, mini player trigger
- `MiniPlayer` — floating PiP-style player (`useMiniPlayerStore`)

## 2. Learning Progress

| Method | Path | Description |
|--------|------|-------------|
| GET | `/progress/summary` | Completed, in-progress, hours watched, streak, series % |
| GET | `/progress/weekly-activity` | Last 7 days watch minutes |
| GET | `/progress/playback-preferences` | Speed + autoplay settings |
| PUT | `/progress/playback-preferences` | Update preferences |

Models: `WatchActivity`, `UserPlaybackPreference`

## 3. Speaker Profiles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/speakers` | List speakers |
| GET | `/speakers/:slugOrId` | Profile with sessions, competencies, ratings |

Frontend: `/speakers/[slug]`

Model extensions: `Speaker.slug`, `Speaker.linkedinUrl`, `SpeakerFollow` (future)

## 4. Learning Paths

| Method | Path | Description |
|--------|------|-------------|
| GET | `/learning-paths` | User paths |
| POST | `/learning-paths` | Create path |
| GET | `/learning-paths/:id` | Path with completion % |
| POST | `/learning-paths/:id/items` | Add step |
| POST | `/learning-paths/:id/items/:itemId/complete` | Mark complete |
| DELETE | `/learning-paths/:id` | Delete path |

Frontend: `/learning-paths`

## 5. Enhanced Search

Extended filters on `GET /search`:
- `speakerId`, `seriesId`, `minDuration`, `maxDuration`

New endpoints:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/search/recent` | User recent searches |
| GET | `/search/popular` | Popular (30 days) |
| GET | `/search/trending` | Trending (7 days) |

Search queries logged in `SearchQueryLog` for analytics and ES ranking later.

## 6. Q&A Module

Separate from comments (`/comments`).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/videos/:videoId/questions` | List questions + answers |
| POST | `/videos/:videoId/questions` | Ask question |
| POST | `/questions/:id/answers` | Answer |
| POST | `/questions/:id/vote` | Up/down vote |
| POST | `/answers/:id/vote` | Up/down vote |
| POST | `/answers/:id/accept` | Accept answer (video owner) |

Features: votes, accepted answer, pinned answers, markdown body support.

Frontend: `QaSection` on watch page.

## 7. Resource Center

| Method | Path | Description |
|--------|------|-------------|
| GET | `/videos/:videoId/resources` | List resources |
| POST | `/videos/:videoId/resources` | Add resource (team) |

Resource kinds: `GITHUB_REPO`, `SLIDES`, `PDF`, `DEMO`, `DOCUMENTATION`, `LINK`

Frontend: `ResourceCenter` on watch page.

## 8. Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/feed/dashboard` | Full dashboard payload |

Sections: continue watching, recommended, latest-meets, progress, bookmarks, history, weekly activity, announcements, popular this week.

Frontend: redesigned home page with `DashboardProgress`.

## 9. Team Upload Studio

| Method | Path | Description |
|--------|------|-------------|
| GET | `/studio/drafts/:contentType` | Get autosaved draft |
| PUT | `/studio/drafts/:contentType` | Autosave draft |
| POST | `/studio/videos/:id/publish` | Publish from studio |

Frontend: `/team/studio` — 6-step wizard (Details → Media → Resources → Visibility → Review → Publish)

Uses `Draft` model with step + JSON payload.

## 10. Extension Points (future integrations)

Ports in `apps/api/src/common/ports/`:
- `MediaProcessingPort` — FFmpeg, Whisper, OpenAI (noop adapter)
- `QueuePort` — BullMQ (in-memory adapter)
- `CachePort` — Redis (in-memory adapter)

`MediaModule` exports all ports for injection.

## Migration

```bash
npx pnpm@9.15.4 db:migrate
```

Migration: `20260718150000_phase7_platform`

## Key Files

### Backend
- `apps/api/prisma/schema.prisma` — Phase 7 models
- `apps/api/src/modules/videos/streaming.service.ts`
- `apps/api/src/modules/progress/`
- `apps/api/src/modules/speakers/`
- `apps/api/src/modules/learning-paths/`
- `apps/api/src/modules/qa/`
- `apps/api/src/modules/resources/`
- `apps/api/src/modules/studio/`
- `apps/api/src/modules/media/` — extension adapters
- `apps/api/src/modules/search/search-analytics.repository.ts`

### Frontend
- `apps/web/src/hooks/usePhase7.ts`
- `apps/web/src/hooks/usePhase7Features.ts`
- `apps/web/src/components/video/VideoPlayer.tsx`
- `apps/web/src/components/video/MiniPlayer.tsx`
- `apps/web/src/components/video/QaSection.tsx`
- `apps/web/src/components/video/ResourceCenter.tsx`
- `apps/web/src/components/home/DashboardProgress.tsx`
- `packages/types/src/phase7.ts`

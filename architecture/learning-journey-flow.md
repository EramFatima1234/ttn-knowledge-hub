# Learning Journey Flow

The learning journey is the **progress + library** experience (not the removed Learning Paths product).

```mermaid
flowchart TD
  Watch[/watch/id] --> Hist[PUT /history]
  Hist --> CW[GET /history/continue-watching]
  CW --> Lib[/library]
  Watch --> Prog[GET /progress/summary]
  Prog --> Home[Dashboard widgets]
  Book[POST /bookmarks] --> Lib
```

## APIs

| Endpoint | Purpose |
|----------|---------|
| `PUT /history` | Save position, completion |
| `GET /history/continue-watching` | Resume row on home/library |
| `GET /progress/summary` | Streaks, totals for sidebar/dashboard |
| `GET /progress/weekly-activity` | Activity chart data |
| `PUT /progress/playback-preferences` | Speed, autoplay next |

## UI

- `apps/web/src/app/(app)/library/page.tsx`
- `components/home/DashboardProgress.tsx`
- `components/right-sidebar/MyProgressCard.tsx`
- `VideoPlayer` + `MiniPlayer` for continuity

ADR: `adr/ADR-008-why-learning-journey.md`.

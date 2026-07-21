# Content Management Flow

Admin and team users manage catalog content through the **Admin CMS** and **Team** upload surfaces.

```mermaid
flowchart TB
  Admin[ADMIN /admin/content] --> CMS_API[admin/cms/*]
  Team[TEAM /team/studio] --> Studio[studio/*]
  Team --> TeamSlots[team/series + team/meets]
  CMS_API --> DB[(PostgreSQL)]
  Studio --> DB
  Approve[/admin/approvals] --> DB
```

## Admin CMS (`/admin/cms`)

| Entity | Web routes | API |
|--------|------------|-----|
| Meets | `/admin/meets/*` | `GET/POST/PATCH/DELETE admin/cms/meets` |
| Series | `/admin/series/*` | `admin/cms/series`, episodes CRUD + reorder |
| Speakers | `/admin/speakers/*` | `admin/cms/speakers` |
| Competencies | `/admin/competencies/*` | `admin/cms/competencies` |
| Resources | `/admin/resources/*` | `admin/cms/resources` |
| Homepage | `/admin/homepage-builder` | `GET/PUT admin/cms/homepage` |
| Settings | `/admin/settings` | `GET/PATCH admin/cms/settings` |

Implementation: `apps/web/src/features/admin-cms/`, `apps/api/src/modules/admin-cms/`.

## Team contributor flow

1. **Studio wizard** — `/team/studio` → drafts `PUT /studio/drafts/:contentType`, publish `POST /studio/videos/:id/publish`.
2. **Quick upload** — `/team/upload` → `POST /videos`, submit for approval.
3. **Series slots** — Admin creates episode rows; team fills slot via `PUT /team/series/:seriesId/episodes/:orderIndex`.
4. **Meet recording** — `PUT /team/meets/:meetId/recording` or admin `PUT admin/cms/meets/:id/recording`.

## Metadata

URL fields, `homepageTags`, `displayPriority` — see ADR-006 and ADR-010.

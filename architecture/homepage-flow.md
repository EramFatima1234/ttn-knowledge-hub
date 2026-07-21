# Homepage Flow

## Data sources

| Source | Endpoint | Consumer |
|--------|----------|----------|
| Dashboard feed | `GET /feed/dashboard` | Role-based home `/` |
| Home feed | `GET /feed/home` | Featured rows |
| Recommendations | `GET /feed/recommendations` | Personalization |
| Layout config | `GET /homepage/layout` | Section ordering |
| Platform settings | `GET /platform/settings` | Branding copy, feature flags in JSON |

## Curation

Editors set on meets/series:

- `homepageTags` — which rows include the item (`HomepageFeedService` filters).
- `displayPriority` — lower number = higher prominence within a row.

Admin: `PUT /admin/cms/homepage` persists `HomepageSection` records.

```mermaid
flowchart LR
  CMS[CMS metadata] --> HFS[HomepageFeedService]
  HFS --> F1[/feed/home]
  HFS --> F2[/feed/dashboard]
  F1 --> UI[Home page components]
  F2 --> UI
```

## Web components

- `ContentRow`, `FeaturedSection`, `CompetencyGrid`, `VideoGrid` under `components/home/`.
- Hooks: `useDashboard`, `useRecommendations`, `useHomeFeed` (see `apps/web/src/hooks/`).

Known debt: `/admin/homepage-builder` may still persist some state in localStorage — align with CMS API (ADR-010).

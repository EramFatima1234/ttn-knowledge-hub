# Frontend Architecture

**App:** `apps/web` — Next.js 16 App Router, React 19.

## Directory layout

| Path | Purpose |
|------|---------|
| `src/app/(auth)/` | Login |
| `src/app/(app)/` | Authenticated learner, team, admin pages |
| `src/features/admin-cms/` | Admin CMS feature module |
| `src/features/ai/` | AI drawer, FAB, hooks |
| `src/features/explore/` | Explore page content |
| `src/features/phase8/` | Dashboard widgets |
| `src/components/` | Shared UI (layout, video, home, search) |
| `src/hooks/` | React Query data hooks |
| `src/lib/` | API client, utils |
| `src/styles/` | `knowledgehub.scss`, globals |

## State

- **Server data:** TanStack React Query.
- **Auth / mini player:** Zustand stores.
- **Redux:** `ReduxProvider` for limited global state.

## API access

`fetchApi` / `fetchApiJson` in `src/lib/api.ts` — attaches Bearer token.

## Styling rules

- Aspire theme; prefix layout classes with `kh-`.
- Avoid global `header`/`aside` selectors (Ant Design conflict).

## Performance patterns

Dynamic imports for AI FAB, mini player, right sidebar, watch page sections — see `docs/performance-guide.md`.

Cursor rules: `.cursor/rules/frontend.mdc`, `.cursor/ui-guidelines.md`.

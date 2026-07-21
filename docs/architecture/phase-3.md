# Phase 3 — Frontend Setup

## Delivered

- Google OAuth login wired to `POST /api/auth/google`
- JWT session with encrypted Zustand persist + httpOnly refresh cookies
- TanStack Query for taxonomy APIs
- App shell: header, sidebar, dark/light theme toggle
- Home page with hero, content rows, live competencies, announcements
- Protected routes with RBAC (`ADMIN`, `TEAM`, `USER`)
- Placeholder routes: Explore, Meets, Series, Library, Search, Admin

## Routes

| Path | Description |
|------|-------------|
| `/login` | Google sign-in |
| `/` | Home feed |
| `/explore` | Placeholder (Phase 4) |
| `/meets` | Placeholder (Phase 4) |
| `/series` | Placeholder (Phase 4) |
| `/library` | Placeholder (Phase 4) |
| `/search` | Placeholder (Phase 6) |
| `/admin` | Admin overview (ADMIN only) |

## Run

```bash
npx pnpm@9.15.4 dev
```

Web: http://localhost:3000  
API: http://localhost:3001/api/v1

## Notes

- Home content rows use mock data until Phase 4 content APIs exist
- Competencies load from live API via TanStack Query
- API calls use `/api` proxy in browser for cookie-based refresh

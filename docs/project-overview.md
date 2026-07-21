# Project Overview

**Product:** KnowledgeHub — internal engineering learning platform for TO THE NEW (`@tothenew.com`).

## Business problem

Engineering knowledge is spread across recordings, ad-hoc drives, and tribal memory. Employees need one trusted place to discover sessions, watch with resume/progress, and engage with content aligned to competencies.

## Business goals

- Centralize learning content (videos, knowledge meets, series).
- Enable team contributors and admins to publish with approval workflow.
- Measure engagement (views, progress, search analytics).
- Assist discovery with search, recommendations, and Gemini-powered AI.

## Vision

Enterprise-grade internal Netflix-style learning hub with Aspire branding, RBAC, and CMS — maintainable monorepo with clear documentation and adapter-based infrastructure.

## Target users

| Persona | Role | Primary surfaces |
|---------|------|------------------|
| Learner | `USER` | Home, watch, library, explore, AI |
| Contributor | `TEAM` | Studio, upload, team series/meet slots |
| Platform admin | `ADMIN` | CMS, approvals, users, analytics |

## Modules (implementation)

| Module | API path | Web |
|--------|----------|-----|
| Auth | `auth` | `/login` |
| Videos & streaming | `videos` | `/watch/[id]` |
| Knowledge meets | `knowledge-meets` | `/meets` |
| Knowledge series | `knowledge-series` | `/series` |
| Feed & explore | `feed`, `explore` | `/`, `/explore` |
| Search | `search` | `/search` |
| Engagement | comments, bookmarks, history | watch, library |
| Progress | `progress` | dashboard, library |
| Q&A | `qa` | watch page |
| Admin | `admin` | `/admin/*` |
| Admin CMS | `admin/cms` | `features/admin-cms` |
| AI | `ai` | AI FAB + watch panel |
| Notifications | `notifications` | header bell |

## Current features

See `docs/project-build-summary.md` (feature inventory) and `roadmap/completed-features.md`.

## Future vision

`docs/future-roadmap.md`, `roadmap/future-features.md`. Learning paths remain schema-only until product revival.

# Spec — Cursor Workflow (KnowledgeHub)

## Problem

Engineering knowledge is fragmented; employees need curated video/meet/series content with progress and admin CMS.

## Users

| Role | Capabilities |
|------|----------------|
| USER | Browse, watch, search, bookmark, AI assist |
| TEAM | Upload, studio, team meet/series slots |
| ADMIN | Content Manager, approvals, users, homepage, analytics |

## In scope (implemented)

- Google OAuth + JWT
- Video playback + streaming (Range)
- Knowledge meets & series (learner + CMS)
- Engagement: comments, bookmarks, history, Q&A
- Search (Postgres FTS / optional ES)
- Admin CMS + approvals
- Progress / Learning Journey
- Gemini AI (optional)

## Out of scope (current)

- Learning Paths product UI
- Public internet / non-`@tothenew.com` access
- Native mobile apps

## Success criteria

See root `acceptance-criteria.md`.

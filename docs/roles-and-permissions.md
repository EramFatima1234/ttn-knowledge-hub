# KnowledgeHub — Roles & Permissions Guide

> Who can do what, how roles are defined in code, and step-by-step workflows for each role.

**Last updated:** July 18, 2026

---

## Table of Contents

1. [What We Built So Far](#what-we-built-so-far)
2. [Role Model Overview](#role-model-overview)
3. [Permissions Matrix](#permissions-matrix)
4. [Role: USER (Learner)](#role-user-learner)
5. [Role: TEAM (Content Creator)](#role-team-content-creator)
6. [Role: ADMIN (Platform Admin)](#role-admin-platform-admin)
7. [How Roles Are Assigned](#how-roles-are-assigned)
8. [Technical Implementation](#technical-implementation)
9. [Route & API Access Summary](#route--api-access-summary)

---

## What We Built So Far

KnowledgeHub is an internal engineering learning platform (monorepo: `apps/web`, `apps/api`, `packages/types`).

| Phase | Highlights |
|-------|------------|
| **Core (Phases 2–5)** | Google OAuth (`@tothenew.com` only), JWT + refresh cookies, RBAC (USER / TEAM / ADMIN), videos/series/meets, comments, bookmarks, history, team upload + admin approvals |
| **Phase 6** | Full-text search, explore hub, recommendations, notifications (in-app/email/push), admin analytics, Elasticsearch adapter |
| **Phase 6.1** | Email SMTP, browser push, meet reminder cron, analytics charts |
| **Phase 7** | Professional streaming, learning progress, speaker profiles, learning paths, Q&A, resource center, upload studio, enhanced search, dashboard feed |
| **UI / Theme** | Aspire design system (pink/purple), three-column layout, redesigned home dashboard |
| **Right sidebar** | Personalized assistant: Latest Knowledge Meets, Trending Technologies, Competencies, Recently Bookmarked |

Full platform walkthrough: [`docs/complete-go-through.md`](./complete-go-through.md)  
Phase 7 architecture: [`docs/architecture/phase-7.md`](./architecture/phase-7.md)

---

## Role Model Overview

KnowledgeHub uses **Role-Based Access Control (RBAC)** with three roles:

| Role | Enum | Default on signup | Purpose |
|------|------|-------------------|---------|
| **USER** | `RoleName.USER` | ✅ Yes | Learner — browse, watch, engage |
| **TEAM** | `RoleName.TEAM` | ❌ Assigned by Admin | Content creator — upload & publish drafts |
| **ADMIN** | `RoleName.ADMIN` | ❌ Assigned by Admin | Platform admin — approvals, users, analytics |

### Database tables

```
users ──< user_roles >── roles ──< role_permissions >── permissions
```

- **Source of truth:** `apps/api/prisma/schema.prisma` (`RoleName` enum, `Role`, `Permission`, `UserRole`, `RolePermission`)
- **Seed data:** `apps/api/prisma/seed.ts` — creates roles, permissions, and mappings
- **Shared types:** `packages/types/src/auth.ts` (`RoleName`, `AuthUser`)

### Auth rules

- Sign in with **Google** using a `@tothenew.com` email
- New users automatically receive the **USER** role
- **TEAM** and **ADMIN** must be assigned by an existing admin at `/admin/users`
- A user can hold **multiple roles** (e.g. ADMIN + TEAM)

---

## Permissions Matrix

Permissions are fine-grained slugs stored in the `permissions` table and linked to roles via `role_permissions`.

| Permission slug | Description |
|-----------------|-------------|
| `users:manage` | List users, assign/remove roles |
| `teams:manage` | Team management (reserved) |
| `content:create` | Create video drafts |
| `content:publish` | Submit content for approval / publish workflow |
| `content:approve` | Approve or reject pending videos |
| `content:delete` | Delete content (reserved) |
| `homepage:manage` | Homepage curation (reserved) |
| `analytics:view` | View admin analytics & overview |
| `announcements:manage` | CRUD platform announcements |
| `comments:moderate` | Moderate comments (reserved) |

### Role → permission mapping (from seed)

| Permission | USER | TEAM | ADMIN |
|------------|:----:|:----:|:-----:|
| `content:create` | — | ✅ | ✅ |
| `content:publish` | — | ✅ | ✅ |
| `analytics:view` | — | ✅ | ✅ |
| `users:manage` | — | — | ✅ |
| `content:approve` | — | — | ✅ |
| `announcements:manage` | — | — | ✅ |
| All other permissions | — | — | ✅ |

> **Note:** ADMIN receives **all** permissions from seed. TEAM can view analytics but cannot approve content or manage users.

---

## Role: USER (Learner)

**Who:** Every employee who signs in with `@tothenew.com`.

### What USER can do

| Area | Capabilities |
|------|--------------|
| **Browse** | Home dashboard, Explore, Search, Series, Meets, Library |
| **Learn** | Watch videos (resume, speed, mini player), track progress & streaks |
| **Engage** | Comments, Q&A, bookmarks, ratings, watch history |
| **Personalize** | Learning paths, playback preferences, notifications |
| **Discover** | Speaker profiles, recommendations, related content |

### What USER cannot do

- Upload videos or access Team Studio
- Approve/reject content
- Access `/admin/*` routes
- Assign roles to other users

### Step-by-step: USER learning flow

```
1. Go to http://localhost:3000/login
2. Sign in with Google (@tothenew.com)
3. Land on Home (/)
   ├── Continue Watching
   ├── Recommended for you
   ├── Latest Knowledge Meets
   └── Latest Uploads
4. Use right sidebar
   ├── Latest Knowledge Meets
   ├── Trending Technologies → Explore
   ├── Competencies → filtered Explore
   └── Recently Bookmarked → resume sessions
5. Watch a session (/watch/[id])
   ├── Video player (resume, speed, autoplay next)
   ├── Q&A and Resource Center
   └── Bookmark / comment
6. Track progress (dashboard stats on home)
7. Build a learning path (/learning-paths)
8. Search & filter (/search)
```

### Key routes (USER)

| Route | Description |
|-------|-------------|
| `/` | Home dashboard |
| `/explore` | Competency hub |
| `/search` | Search with filters |
| `/watch/[id]` | Video player |
| `/series`, `/series/[id]` | Knowledge series |
| `/meets`, `/meets/[id]` | Knowledge meets |
| `/library` | Continue watching, bookmarks, history |
| `/learning-paths` | Personal learning journeys |
| `/speakers/[slug]` | Speaker profile |

---

## Role: TEAM (Content Creator)

**Who:** Engineers or SMEs approved to upload internal learning content.

**How to get this role:** An ADMIN assigns `TEAM` at `/admin/users`.

### What TEAM can do (in addition to USER)

| Area | Capabilities |
|------|--------------|
| **Upload** | Create video drafts, upload media, attach resources |
| **Studio** | 6-step Upload Studio with draft autosave |
| **Manage drafts** | List own uploads (`GET /videos/mine`), edit own drafts |
| **Submit** | Submit videos for admin approval (`PENDING_APPROVAL`) |
| **Analytics** | View analytics endpoints (permission `analytics:view`) |
| **Storage** | Presigned uploads, file upload APIs |

### What TEAM cannot do

- Approve or reject other users' content
- Manage users or assign roles
- Manage announcements (admin only)
- Access `/admin/*` UI (unless also ADMIN)

### Step-by-step: TEAM content upload flow

```
1. Sign in (must have TEAM role assigned)
2. Sidebar shows Team section:
   ├── Upload      → /team/upload
   └── Studio      → /team/studio
3. Open Upload Studio (/team/studio)
   Step 1 — Details: title, description, competency
   Step 2 — Media: upload video + thumbnail (progress shown)
   Step 3 — Resources: GitHub, slides, PDFs (post-publish or API)
   Step 4 — Visibility: internal review workflow
   Step 5 — Review: preview draft metadata
   Step 6 — Publish: save draft & submit for review
4. Draft autosaves via PUT /studio/drafts/VIDEO
5. Submit sets status → PENDING_APPROVAL
6. Wait for ADMIN approval
7. On approval → video becomes PUBLISHED and searchable
8. Track own uploads at /team/upload or GET /videos/mine
```

### Key API endpoints (TEAM)

| Method | Path | Guard |
|--------|------|-------|
| `POST` | `/videos` | `@Roles(ADMIN, TEAM)` + `content:create` |
| `GET` | `/videos/mine` | `@Roles(ADMIN, TEAM)` |
| `PATCH` | `/videos/:id` | `@Roles(ADMIN, TEAM)` — own draft only |
| `POST` | `/videos/:id/submit` | `@Roles(ADMIN, TEAM)` |
| `PUT` | `/studio/drafts/:contentType` | `@Roles(ADMIN, TEAM)` |
| `POST` | `/studio/videos/:id/publish` | `@Roles(ADMIN, TEAM)` |
| `POST` | `/uploads/*` | `@Roles(ADMIN, TEAM)` |
| `POST` | `/videos/:id/resources` | `@Roles(ADMIN, TEAM)` |

### Key routes (TEAM)

| Route | Guard |
|-------|-------|
| `/team/upload` | `ProtectedRoute` → `[ADMIN, TEAM]` |
| `/team/studio` | `ProtectedRoute` → `[ADMIN, TEAM]` |

---

## Role: ADMIN (Platform Admin)

**Who:** Platform owners / L&D admins.

**How to get this role:** Another ADMIN assigns `ADMIN` at `/admin/users`, or seed user for dev.

### What ADMIN can do (everything TEAM + USER can, plus)

| Area | Capabilities |
|------|--------------|
| **Approvals** | Approve/reject pending videos |
| **Users** | List users, assign/remove USER, TEAM, ADMIN roles |
| **Announcements** | Create, update, delete platform announcements |
| **Analytics** | Overview dashboard, detailed charts, engagement metrics |
| **Search admin** | Trigger Elasticsearch reindex |
| **Content override** | Edit any video (not just own drafts) |

### Step-by-step: ADMIN daily workflow

```
1. Sign in (ADMIN role)
2. Sidebar shows Admin section:
   ├── Overview       → /admin
   ├── Analytics      → /admin/analytics
   ├── Approvals      → /admin/approvals
   ├── Announcements  → /admin/announcements
   └── Users          → /admin/users
3. Review pending uploads (/admin/approvals)
   ├── Approve → video PUBLISHED, uploader notified, search indexed
   └── Reject  → back to DRAFT, uploader notified
4. Manage users (/admin/users)
   ├── Assign TEAM to a content creator
   ├── Assign ADMIN to another platform admin
   └── Remove roles when needed
5. Post announcements (/admin/announcements)
6. Monitor platform health (/admin/analytics)
   ├── Content metrics
   ├── Engagement (views, bookmarks)
   └── User activity charts
7. (Optional) Reindex search: POST /admin/search/reindex
```

### Step-by-step: ADMIN assigns TEAM role

```
1. Go to /admin/users
2. Find the user by name/email
3. Select role: TEAM (or ADMIN)
4. Click Assign
   → API: POST /users/:id/roles  { "role": "TEAM" }
5. User signs out and back in (or refreshes session)
6. User now sees Team menu in sidebar
```

### Key API endpoints (ADMIN)

| Method | Path | Guard |
|--------|------|-------|
| `GET` | `/admin/overview` | `@Roles(ADMIN)` + `analytics:view` |
| `GET` | `/admin/analytics` | `@Roles(ADMIN)` + `analytics:view` |
| `GET` | `/admin/approvals/pending` | `@Roles(ADMIN)` + `content:approve` |
| `POST` | `/admin/approvals/:id/approve` | `@Roles(ADMIN)` + `content:approve` |
| `POST` | `/admin/approvals/:id/reject` | `@Roles(ADMIN)` + `content:approve` |
| `GET/POST/PATCH/DELETE` | `/admin/announcements` | `@Roles(ADMIN)` + `announcements:manage` |
| `GET` | `/users` | `users:manage` |
| `POST` | `/users/:id/roles` | `users:manage` |
| `DELETE` | `/users/:id/roles/:role` | `users:manage` |
| `POST` | `/admin/search/reindex` | `@Roles(ADMIN)` + `analytics:view` |

### Key routes (ADMIN)

| Route | Guard |
|-------|-------|
| `/admin` | `ProtectedRoute` → `[ADMIN]` |
| `/admin/analytics` | `[ADMIN]` |
| `/admin/approvals` | `[ADMIN]` |
| `/admin/announcements` | `[ADMIN]` |
| `/admin/users` | `[ADMIN]` |

---

## How Roles Are Assigned

### Automatic (first login)

```
Google OAuth sign-in
  → users.repository.createFromGoogle()
  → assigns RoleName.USER by default
```

### Manual (admin action)

```
/admin/users UI
  → POST /api/v1/users/:userId/roles  { "role": "TEAM" | "ADMIN" | "USER" }
  → Requires permission: users:manage (ADMIN only)
```

### Remove a role

```
DELETE /api/v1/users/:userId/roles/:role
```

### Dev seed admin

Seed creates `knowledgehub-seed@tothenew.com` with ADMIN for sample content — **not for login**.  
To test ADMIN locally, assign ADMIN to your Google account via DB or `/admin/users` after first login by a seeded admin.

---

## Technical Implementation

### Backend guards (NestJS)

| Guard | File | Purpose |
|-------|------|---------|
| `JwtAuthGuard` | `common/guards/jwt-auth.guard.ts` | Validates access token |
| `RolesGuard` | `common/guards/roles.guard.ts` | Checks `@Roles(...)` decorator |
| `PermissionsGuard` | `common/guards/permissions.guard.ts` | Checks `@Permissions(...)` decorator |

`RolesGuard` is registered globally in `app.module.ts`.

### Decorators

```typescript
@Roles(RoleName.ADMIN, RoleName.TEAM)   // role check
@Permissions('content:approve')          // permission check
```

### Frontend guards

| Layer | File | Behavior |
|-------|------|----------|
| Auth store | `store/useAuthStore.ts` | `hasRole()`, `isAdmin()`, `isTeam()` |
| Route guard | `components/layout/ProtectedRoute.tsx` | Redirects to `/login` or `/` |
| Layout guards | `admin/layout.tsx`, `team/layout.tsx` | Role-restricted route groups |
| Sidebar | `components/layout/AppSidebar.tsx` | Shows Team/Admin menus based on role |

**Frontend hierarchy:**

- `isAdmin()` → has `ADMIN` role
- `isTeam()` → has `TEAM` **or** `ADMIN` role

---

## Route & API Access Summary

### Frontend routes by role

| Route group | USER | TEAM | ADMIN |
|-------------|:----:|:----:|:-----:|
| Home, Explore, Search, Watch, Series, Meets, Library, Learning Paths, Speakers | ✅ | ✅ | ✅ |
| `/team/upload`, `/team/studio` | — | ✅ | ✅ |
| `/admin/*` | — | — | ✅ |

### Content status workflow

```
DRAFT  →  PENDING_APPROVAL  →  PUBLISHED
  ↑            (reject)              ↓
  └──────────────────────────  ARCHIVED
```

| Action | Who |
|--------|-----|
| Create draft | TEAM, ADMIN |
| Edit own draft | TEAM (owner), ADMIN (any) |
| Submit for approval | TEAM, ADMIN |
| Approve / reject | ADMIN only |
| Watch published content | USER, TEAM, ADMIN |

---

## Quick Reference

```bash
# Run locally
npx pnpm@9.15.4 db:seed          # seeds roles & permissions
npx pnpm@9.15.4 --filter @knowledgehub/api dev
cd apps/web && npx next dev -p 3000 --webpack

# Assign role via API (as admin)
curl -X POST http://localhost:3001/api/v1/users/{userId}/roles \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"role":"TEAM"}'
```

**Related docs**

- [`docs/complete-go-through.md`](./complete-go-through.md) — full platform walkthrough
- [`docs/architecture/phase-7.md`](./architecture/phase-7.md) — Phase 7 features
- [`apps/api/prisma/seed.ts`](../apps/api/prisma/seed.ts) — role/permission seed source

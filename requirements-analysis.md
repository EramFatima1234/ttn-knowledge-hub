# Requirements Analysis — KnowledgeHub

## Selected Project Option

**Option:** Build and document an **internal engineering learning platform** (KnowledgeHub) for TO THE NEW — content discovery, playback, CMS, RBAC, search, and AI assistance. This is **not** a support ticket or ITSM system.

## My Understanding

Employees need one place to watch recorded **Knowledge Meets**, follow **Knowledge Series**, browse by **Competency**, bookmark content, resume playback, and (for admins) manage catalog via **Content Manager**. Authentication is **Google OAuth** restricted to `@tothenew.com`. **Learning Journey** is delivered via progress, library, and continue watching (standalone Learning Paths product removed from UI/API).

## Functional Requirements

### Identity & access
- FR-1: Google sign-in with domain restriction.
- FR-2: JWT access token + httpOnly refresh cookie.
- FR-3: Roles `USER`, `TEAM`, `ADMIN` with permission slugs.

### Learner
- FR-10: Home feed and explore hub.
- FR-11: Watch videos with resume, mini player, view count.
- FR-12: Knowledge Meets and Knowledge Series detail pages.
- FR-13: Search (Postgres FTS or Elasticsearch).
- FR-14: Bookmarks, comments, Q&A on videos.
- FR-15: Learning Journey: history, continue watching, progress summary.
- FR-16: KnowledgeHub AI when `GEMINI_API_KEY` configured.

### Contributor (TEAM)
- FR-20: Upload videos, Studio drafts, series slot upload, meet recording upload.

### Admin
- FR-30: Content Manager — meets, series/episodes, speakers, competencies, resources.
- FR-31: Video approval workflow.
- FR-32: Basic platform settings (banner, theme defaults).
- FR-33: User role assignment and announcements.

## Non Functional Requirements

- NFR-1: Monorepo maintainability (pnpm + Turbo).
- NFR-2: Container-friendly web (`standalone`) and Nest API.
- NFR-3: Env-based adapters (storage, search, mail, push, AI).
- NFR-4: TypeScript strict; shared `@knowledgehub/types`.
- NFR-5: Internal-only; secrets not in `NEXT_PUBLIC_*`.

## Assumptions

- PostgreSQL is system of record.
- Media may be external URLs (YouTube/CDN) or uploaded (local/S3).
- Elasticsearch optional for search at scale.
- Reviewers use dev Google OAuth client for `@tothenew.com`.

## Clarifications

- **Learning Paths:** Prisma models may exist; no `/learning-paths` routes in current `src/`.
- **Meets:** Recorded library focus; live-event reminders de-emphasized in product.
- **Homepage sections:** Learner layout uses `GET /homepage/layout` and feed APIs; admin section builder UI removed from MVP (API `GET/PUT /admin/cms/homepage` remains for seed/ops).

## Edge Cases

- API up but DB down → auth and data endpoints fail (500/503).
- Missing `pnpm db:seed` → first Google login may fail until `USER` role exists.
- Invalid/expired Google ID token → 401.
- AI disabled when Gemini key missing → `GET /ai/status` reflects unavailable.
- 100+ competencies → explore uses searchable competency dropdown (UI already shipped).

**Traceability:** `acceptance-criteria.md` → `implementation-plan.md` → `design-notes.md` → code under `apps/`.

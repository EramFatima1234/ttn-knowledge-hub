# ADR-007 — Why Content Manager (Admin CMS)

**Status:** Accepted  
**Date:** 2026 (Phase 5, expanded Phase 8)  
**Scope:** Admin content operations

## Problem

Admins and team contributors need one place to manage meets, series/episodes, speakers, competencies, resources, homepage curation, and platform settings — without SQL or scattered legacy forms.

## Decision

Implement **Admin CMS** as:

- **API:** `admin-cms` module — `@Controller('admin/cms')` plus team upload controllers `team/meets`, `team/series`, and public layout `homepage/layout`, `platform/settings`.
- **Web:** Feature folder `apps/web/src/features/admin-cms/` with routes under `apps/web/src/app/(app)/admin/*` (content hub, meets, series, speakers, competencies, resources, platform, settings).
- **Access:** `ADMIN` role + permission slugs (see `docs/roles-and-permissions.md`).

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Headless CMS (Contentful, etc.) | Internal RBAC, approval workflow, and video graph are custom |
| Only Team Studio | Insufficient for admin CRUD on meets/series metadata |
| Strapi self-hosted | Extra service to operate |

## Tradeoffs

- **Pros:** Single codepath with Prisma; URL metadata and homepage tags in same forms.
- **Cons:** Large `admin-cms.service.ts`; homepage builder still partially localStorage vs DB `HomepageSection`.

## Future impact

- Align `/admin/homepage-builder` with `PUT /admin/cms/homepage` and `HomepageSection` model.
- Split service by subdomain (meets, series, taxonomy) when refactoring.

## Traceability

| Layer | Location |
|-------|----------|
| API | `apps/api/src/modules/admin-cms/admin-cms.controller.ts` |
| Web | `apps/web/src/features/admin-cms/` |
| Docs | `architecture/content-management-flow.md`, `docs/ui-flow.md` |

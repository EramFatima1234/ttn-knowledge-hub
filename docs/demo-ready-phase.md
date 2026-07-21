# KnowledgeHub — Demo-Ready Integration Phase

> **Objective:** Remove mock implementations and make the platform fully functional end-to-end for stakeholder demos.  
> **Last updated:** July 19, 2026

---

## Completed Tasks

### Task 1 — Backend Integration (Frontend)

| Area | Status | Notes |
|------|--------|-------|
| Homepage / dashboards | ✅ | User dashboard uses `useDashboard()` API; featured video + speaker from real data |
| Knowledge Meets | ✅ | List/detail via API; admin CMS CRUD |
| Knowledge Series | ✅ | List/detail + episode slot workflow |
| Speakers | ✅ | `/speakers` from API; spotlight from top speaker by session count |
| Competencies | ✅ | Explore hub + competency pages from API |
| Search | ✅ | FTS backend; autocomplete, filters, pagination |
| Bookmarks / Library | ✅ | Engagement API |
| Continue Watching | ✅ | History API |
| Watch Page | ✅ | Already wired (video, comments, Q&A, resources, related) |
| Admin Dashboard | ✅ | Stats from `admin/overview` + CMS data; quick actions |
| Reports | ✅ | New `GET /admin/reports` endpoint |
| Notifications | ✅ | In-app notification API |
| Right sidebar | ✅ | Removed mock fallbacks; trending from search/competencies API |

**Mock data removed from:**
- `useRightSidebar.ts` — trending technologies, speaker spotlight, competency fallbacks
- `usePhase8.ts` — search analytics, reports highlights, team feedback
- `UserDashboard.tsx` — mock speaker spotlight

**Loading / error / empty states added to:**
- User dashboard, admin reports, search analytics, right sidebar widgets

### Task 2 — Upload System

| Item | Status |
|------|--------|
| StorageProvider → LocalStorageProvider → StorageService | ✅ Already in place |
| Multer via `FileInterceptor` | ✅ `POST /uploads/file` |
| Local folders: videos, thumbnails, banners, resources, speakers | ✅ |
| URLs stored in PostgreSQL (not files) | ✅ |
| File size limits | ✅ **Added** — videos 200MB, images 5MB, PDF/resources 20MB |
| S3 swappable without business logic changes | ✅ Port/adapter pattern preserved |

**New file:** `apps/api/src/modules/storage/constants/storage-limits.ts`

### Task 3 — Admin CMS

| Section | Status |
|---------|--------|
| Dashboard cards (Users, Meets, Series, Resources, Published, Pending, Drafts) | ✅ |
| Quick Actions grid | ✅ |
| Recent Uploads panel | ✅ |
| Content hub (Meets + Series) | ✅ |
| Catalog hub (Speakers + Competencies) | ✅ |
| Platform hub (Users + Approvals) | ✅ |
| Reports | ✅ Real API data |
| Settings | ⚠️ Still localStorage (see Remaining Issues) |

### Task 4 — Knowledge Meet CRUD

| Field | Status |
|-------|--------|
| Title, subtitle, description, speaker, competency | ✅ |
| Date, time, duration | ✅ |
| Meeting link, location, online/offline | ✅ |
| Banner / thumbnail / recording upload | ✅ **Added** `CmsFileUploadField` |
| Slides upload, GitHub, PDF URLs | ✅ |
| Mandatory, draft/publish | ✅ |
| Publish → visible on `/meets` | ✅ (non-RESTRICTED visibility) |

### Task 5 — Knowledge Series

| Feature | Status |
|---------|--------|
| Series CRUD | ✅ |
| Episode CRUD + ordering | ✅ |
| Episode file upload (admin + team) | ✅ |
| Cover/banner upload | ✅ Via episode/series forms |
| Contributor slot workflow | ✅ `/team/series-upload` |
| Publishing | ✅ |

### Task 6 — Watch Page

Verified existing integration:
- Video playback with HTTP Range streaming
- Comments, bookmarks, Q&A, resources
- Continue watching / progress saving via history API
- Related content feed

### Task 7 — Search

| Feature | Status |
|---------|--------|
| Autocomplete | ✅ `GET /search/suggestions` |
| Filters + pagination | ✅ |
| Backend FTS | ✅ PostgreSQL (default) |
| Search analytics | ✅ `GET /admin/search/analytics` |
| Result count logging | ✅ `result_count` on `search_query_logs` |

### Task 8 — Code Quality

| Item | Status |
|------|--------|
| API TypeScript | ✅ Compiles after `prisma generate` |
| Prisma migration for search `result_count` | ✅ Added |
| Friendly upload error messages | ✅ |
| Frontend lint on changed files | ✅ Clean |

---

## Remaining Issues

| Issue | Priority | Notes |
|-------|----------|-------|
| **Homepage builder** | Medium | Still uses `localStorage`; `HomepageSection` DB model exists but no API yet |
| **Platform settings** | Low | `cms-store` localStorage for admin settings |
| **Speaker `competencyId`** | Medium | Schema updated; run `prisma db push` if not applied |
| **Learning paths UI** | Low | API exists, no frontend page |
| **Ratings / Likes API** | Low | Schema only |
| **Homepage builder → API** | Medium | Needed for full CMS parity |
| **Both servers must run** | High | Web :3000 + API :3001 or auth/upload fails with 500 |
| **Search no-results analytics** | Low | Populates after users search; empty until then |

---

## Manual Setup Instructions

### 1. Start infrastructure

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Database migrate + seed

```bash
cd apps/api
npx prisma migrate deploy   # includes search result_count migration
npx prisma generate
cd ../..
pnpm db:seed
```

If `competencyId` on speakers fails:

```bash
cd apps/api && npx prisma db push
```

### 4. Environment files

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>
NEXT_PUBLIC_ENCRYPTION_KEY=<32-char-key>
```

**`apps/api/.env`** — copy from `.env.example`, set `DATABASE_URL`, `GOOGLE_CLIENT_ID`, JWT secrets.

### 5. Run both apps (required)

```bash
# Terminal 1 — API
cd apps/api && npm run dev

# Terminal 2 — Web
cd apps/web && WATCHPACK_POLLING=true npm run dev
```

### 6. Demo checklist

1. Sign in with `@tothenew.com` Google account
2. Browse Home, Explore, Meets, Series, Speakers, Library
3. Search for content (generates analytics data)
4. Watch a video — bookmark, comment, check progress
5. **Admin:** Create Knowledge Meet with file uploads → Publish → verify on `/meets`
6. **Admin:** Create Knowledge Series with 7 episodes → verify slots
7. **Team:** Upload to episode slot at `/team/series-upload`
8. **Admin:** Approve pending videos at `/admin/platform?tab=approvals`
9. Check Reports and Search Analytics under Admin

---

## Suggested Next Phase

1. **Homepage CMS API** — Wire `HomepageSection` model to admin homepage builder (replace localStorage)
2. **Platform settings API** — Persist admin settings in PostgreSQL
3. **Learning paths UI** — Build `/learning-paths` pages against existing API
4. **Production storage** — Switch `STORAGE_PROVIDER=S3` with AWS credentials
5. **Email/push in production** — Configure SMTP + VAPID for real notifications
6. **E2E test suite** — Playwright tests for auth, CMS CRUD, upload, watch flows
7. **AI features** — Deferred per requirements (do not start yet)

---

## Files Modified (This Phase)

### API
- `apps/api/src/modules/storage/constants/storage-limits.ts` (new)
- `apps/api/src/modules/storage/storage.service.ts`
- `apps/api/src/modules/search/search-analytics.repository.ts`
- `apps/api/src/modules/search/search.service.ts`
- `apps/api/src/modules/admin/admin.controller.ts`
- `apps/api/src/modules/admin/admin.service.ts`
- `apps/api/src/modules/admin/analytics.service.ts`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260719140000_search_result_count/migration.sql` (new)

### Web
- `apps/web/src/hooks/useRightSidebar.ts`
- `apps/web/src/hooks/usePhase8.ts`
- `apps/web/src/hooks/useAdminCms.ts`
- `apps/web/src/features/phase8/dashboards/UserDashboard.tsx`
- `apps/web/src/features/admin-cms/dashboard/CmsDashboard.tsx`
- `apps/web/src/features/admin-cms/reports/CmsReportsPage.tsx`
- `apps/web/src/features/admin-cms/meets/MeetFormPage.tsx`
- `apps/web/src/features/admin-cms/components/CmsFileUploadField.tsx` (new)
- `apps/web/src/app/(app)/admin/search-analytics/page.tsx`
- `apps/web/src/lib/upload.ts`

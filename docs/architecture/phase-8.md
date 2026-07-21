# Phase 8 — Platform Experience

Transforms KnowledgeHub into a polished enterprise engineering learning platform with role-based dashboards, reusable widgets, and admin tooling.

## Modules

### 1. Role-Based Dashboards
- **USER** — Netflix/Coursera-style learning hub (`UserDashboard`)
- **TEAM** — YouTube Studio-style creator hub (`TeamDashboard`)
- **ADMIN** — Enterprise control center (`AdminDashboard`)
- Routed via `RoleDashboardRouter` on `/` (and `/admin` overview)

### 2. Quick Actions
- Reusable `QuickActionCard` + `QuickActionsGrid`
- Role-specific action sets in `features/phase8/quick-actions/actions.tsx`

### 3. Approval Center
- Modern card-based UI with filters and bulk approve
- Route: `/admin/approvals`
- Reuses `usePendingApprovals`, `useApproveVideo`, `useRejectVideo`

### 4. Speaker Management
- Public listing: `/speakers`
- Enhanced profile: `/speakers/[slug]`
- Admin management: `/admin/speakers`

### 5. Competency Pages
- Landing pages: `/competencies/[slug]`
- Overview, sessions, series, meets, speakers, related competencies

### 6. Search Analytics
- Route: `/admin/search-analytics`
- Combines API data (popular/trending/recent) + mock no-result insights

### 7. Reports
- Route: `/admin/reports`
- Uses `useAdminAnalytics` + mock executive highlights

### 8. Homepage Builder
- Route: `/admin/homepage-builder`
- Section reorder, visibility toggle, localStorage persistence

### 9. Reusable Widgets
`features/phase8/widgets/` — StatCard, ChartCard, ActivityFeed, ProgressCard, LatestMeetsCard, QuickActionCard, ApprovalCard, SpeakerCard, CompetencyCard, WidgetShell

## File Structure

```
apps/web/src/
  features/phase8/
    widgets/
    dashboards/
    quick-actions/
    approval-center/
  hooks/usePhase8.ts
  lib/mock/phase8.ts
  app/(app)/
    competencies/[slug]/page.tsx
    speakers/page.tsx
    admin/speakers/page.tsx
    admin/search-analytics/page.tsx
    admin/reports/page.tsx
    admin/homepage-builder/page.tsx
```

## Notes

- No API or schema changes required for Phase 8
- Mock data in `lib/mock/phase8.ts` for search gaps, reports highlights, team feedback, homepage builder
- Homepage layout stored in `localStorage` until CMS API is added

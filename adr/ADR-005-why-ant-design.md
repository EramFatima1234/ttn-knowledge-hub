# ADR-005 — Why Ant Design

**Status:** Accepted  
**Date:** 2026 (Phases 3–8)  
**Scope:** `apps/web` UI

## Problem

Internal admin CMS needs data tables, forms, modals, drawers, and charts quickly. Learner UI needs consistent layout, accessibility baseline, and dense enterprise patterns without building a full design system from scratch.

## Decision

Use **Ant Design 6** (`antd`, `@ant-design/icons`, `@ant-design/plots` for analytics) combined with the **Aspire** SCSS theme (`apps/web/src/styles/knowledgehub.scss`, `kh-*` classes). Wrap repeated patterns in Aspire components (`AspireButton`, `AspireTable`, `AspireModal`) and admin CMS components under `features/admin-cms/components/`.

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Material UI | Visual alignment with Aspire rebrand already invested |
| Headless UI only | Too slow for CMS table/form volume |
| Chakra | Less alignment with existing admin table patterns |

## Tradeoffs

- **Pros:** Rapid CMS delivery; plots for `/admin/analytics`.
- **Cons:** Large vendor bundle (~1.4MB chunk noted in perf report); Ant 5→6 prop renames (`Alert` `title`, `Drawer` `size`).

## Future impact

- Follow `.cursor/rules/frontend.mdc` for Ant 6 APIs.
- Lazy-load `@ant-design/plots` (already dynamic in `AnalyticsCharts.tsx`).

## Traceability

| Layer | Location |
|-------|----------|
| Theme | `apps/web/src/styles/knowledgehub.scss` |
| Admin UI | `apps/web/src/features/admin-cms/` |
| Docs | `docs/coding-guidelines.md`, `.cursor/ui-guidelines.md` |

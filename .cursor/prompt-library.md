# Prompt Library

Reusable prompts for Cursor agents working on KnowledgeHub.

## Feature development

```
Extend KnowledgeHub without regenerating the repo. Read .cursor/project-context.md and architecture/<relevant-flow>.md.
Implement [FEATURE] using existing patterns in apps/web/src/features/ and apps/api/src/modules/.
Update docs/api-contract.md and packages/types if needed. Minimal diff, strict TS, pnpm build must pass.
```

## Bug fixing

```
Reproduce [BUG] on branch main patterns. Trace apps/web and apps/api for root cause.
Fix with smallest change; no unrelated refactors. Add regression test in apps/web/e2e if applicable.
```

## Performance optimization

```
Read docs/performance-guide.md and docs/performance-report.md. Optimize without UI/theme changes.
Prefer dynamic imports, React Query staleTime, and API reductions that do not break response contracts.
```

## Code review

```
Review diff against docs/code-review-guide.md and .cursor/engineering-principles.md.
Flag security (auth, secrets), API breaks, missing migrations, and bundle regressions.
```

## Testing

```
Add Playwright test in apps/web/e2e for [FLOW]. Use PLAYWRIGHT_SKIP_WEB_SERVER=1 if server already running.
```

## Refactoring

```
Refactor [MODULE] for maintainability only—no behavior change. Keep tests green. Split files >400 lines.
```

## Documentation

```
Update architecture flow and docs/api-contract.md from actual code in apps/api/src/modules/[x].
No placeholder content—cite real paths and endpoints.
```

## Database changes

```
Modify apps/api/prisma/schema.prisma, run pnpm db:migrate, update seed if needed, document in docs/database-design.md.
```

## API changes

```
Add Nest endpoint with DTO validation and guards. Mirror types in packages/types. Regenerate docs/api-contract.md table.
```

## UI improvements

```
Follow .cursor/ui-guidelines.md and kh-* SCSS. Use Ant Design 6 props. Match Aspire components.
```

## Accessibility

```
Audit [PAGE] for keyboard nav, focus order, Ant Design form labels, and color contrast in Aspire theme.
```

## Security

```
Review against .cursor/rules/security.mdc: JWT, CORS, upload validation, no secrets in NEXT_PUBLIC_*.
```

## KnowledgeHub AI

```
Read ai/spec.md and adr/ADR-009-why-gemini-ai.md. Server-side Gemini only. Lazy-load UI. Update ai/architecture.md if endpoints change.
```

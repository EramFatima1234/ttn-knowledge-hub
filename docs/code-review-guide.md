# Code Review Guide

## Checklist

- [ ] No secrets or `.env` committed
- [ ] API changes backward compatible or documented in `release-notes/BreakingChanges.md`
- [ ] Prisma migration included for schema changes
- [ ] `@knowledgehub/types` updated if contract shared
- [ ] Guards on new admin endpoints
- [ ] React Query invalidation on mutations
- [ ] SCSS scoped (`kh-*`), no global layout breakage
- [ ] `pnpm lint` and `pnpm build` pass
- [ ] Docs/ADR updated for architectural changes

## Focus areas by layer

| Layer | Watch for |
|-------|-----------|
| API | N+1 queries, DTO validation, permission slugs |
| Web | Client bundle size, accessibility of Ant forms |
| DB | Index on new filters, cascade behavior |

## Traceability

Link PR to requirement in `docs/requirements-analysis.md` when applicable.

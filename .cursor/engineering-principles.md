# Engineering Principles

1. Never regenerate the project
2. Never duplicate components — reuse `components/` and `features/`
3. Always reuse existing services and `fetchApi`
4. Feature-based architecture under `features/`
5. Prefer composition over inheritance
6. Strict TypeScript
7. React Query for server state
8. Reusable UI primitives (Aspire*, CMS components)
9. SOLID in Nest services — split when files exceed ~400 lines
10. Clean architecture: UI → hooks → API → Prisma
11. Avoid breaking APIs — document in `release-notes/BreakingChanges.md`
12. Document ADRs for significant decisions
13. Update docs after shipping features (architecture flows, api-contract)

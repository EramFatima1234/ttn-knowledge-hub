# Coding Guidelines

Consolidates `.cursor/rules/coding-style.mdc` and team conventions.

## General

- Smallest correct diff; match surrounding patterns.
- Shared types in `packages/types` when web and API both consume.

## Naming

- React components: PascalCase files under `features/` and `components/`.
- Hooks: `useSomething.ts`.
- API routes: kebab-case segments; Nest `@Controller('segment')`.
- SCSS: `kh-` prefix.

## TypeScript

- Strict mode; no `any` in new code.
- Build must pass before merge.

## Monorepo commands

`npx pnpm@9.15.4 install`, `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm db:*`.

## Documentation

Update `architecture/` flow docs and `docs/api-contract.md` when adding endpoints.

See `docs/code-review-guide.md`.

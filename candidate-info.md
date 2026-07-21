# Candidate Information

**Name:** _[Fill before submission]_

**Role:** _[e.g. Full Stack Engineer / Software Engineer]_

**Primary Technology Stack:** Next.js 16, React 19, NestJS 11, PostgreSQL, Prisma, TypeScript, Ant Design 6, TanStack React Query

**Primary AI Tool Used:** Cursor (Agent + `.cursor/rules` knowledge base)

**Project Option Selected:** Custom internal platform — **KnowledgeHub** (engineering learning platform for TO THE NEW; **not** a support ticket system)

**Assessment Start Date:** _[Fill]_

**Submission Date:** _[Fill]_

## Project Summary

KnowledgeHub is a monorepo (`apps/web`, `apps/api`, `packages/types`) that lets `@tothenew.com` employees discover and watch **Knowledge Meets**, **Knowledge Series**, and videos; track **Learning Journey** progress (bookmarks, history, continue watching); search content; and use **KnowledgeHub AI** (Gemini). **TEAM** contributors upload via Studio; **ADMIN** users run the **Content Manager** (admin CMS), approvals, homepage metadata, and platform settings.

## Tools Used

| Tool | Purpose |
|------|---------|
| Cursor | Planning, implementation, debugging, documentation, code review |
| pnpm 9.15.4 + Turbo | Monorepo scripts |
| Docker Compose | PostgreSQL 16 (local) |
| Prisma | Schema, migrations, seed |
| Playwright | E2E smoke (`apps/web/e2e/`) |
| Swagger | API exploration (`/api/v1/docs`) |

## Setup Summary

1. `docker compose -f docker/docker-compose.yml up -d postgres`
2. Copy `apps/api/.env.example` → `.env`, `apps/web/.env.example` → `.env.local`
3. `pnpm install` → `pnpm db:migrate` → `pnpm db:seed`
4. `bash scripts/dev-restart.sh` or `npm run dev` in `apps/api` and `apps/web`
5. Sign in at http://localhost:3000/login with Google OAuth

See root `README.md` and `database/setup-notes.md`.

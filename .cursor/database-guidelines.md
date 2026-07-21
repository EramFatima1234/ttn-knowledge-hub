# Database Guidelines

- Edit `schema.prisma` → `pnpm db:migrate`
- Soft delete via `deletedAt` where model supports
- Indexes on FKs and filter columns
- Do not use `LearningPath` without product approval

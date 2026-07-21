# Backend Guidelines

- Nest module pattern: module, controller, service, dto/
- class-validator on DTOs; Prisma in services
- `@Public()` only for auth/taxonomy/health as needed
- Admin: `@Roles(ADMIN)` + permission slugs
- Adapters: storage, search, mail, push, AI via env

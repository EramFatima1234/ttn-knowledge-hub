# Demo admin access (temporary)

**TODO:** Set `DEMO_OPEN_ADMIN_ACCESS` to `false` before production.

| Location | File |
|----------|------|
| API flag | `apps/api/src/config/demo-access.ts` |
| Web flag | `apps/web/src/lib/demo-access.ts` |

## What changes in demo mode

- Any **authenticated** `@tothenew.com` user sees the Admin menu and can open `/admin/*`.
- API `RolesGuard` allows routes that require `ADMIN` when the user is authenticated.
- API `PermissionsGuard` allows all permission checks for authenticated users.
- Bootstrap admin email assignment on login is **disabled** (see commented block in `auth.service.ts`).
- Seed `ensureBootstrapAdmin('eram.fatima@tothenew.com')` is **commented** in `prisma/seed.ts`.

## Restore production RBAC

1. Set both `DEMO_OPEN_ADMIN_ACCESS` constants to `false`.
2. Uncomment bootstrap admin in `auth.service.ts` and `seed.ts`.
3. Remove demo bypass blocks in `roles.guard.ts`, `permissions.guard.ts`, `ProtectedRoute.tsx`, and `useAuthStore.ts` (search `TODO(demo)`).

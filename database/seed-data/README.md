# Seed Data

**Implementation:** `apps/api/prisma/seed.ts`

## What gets seeded

| Data | Purpose |
|------|---------|
| `Role` / `Permission` / mappings | RBAC for USER, TEAM, ADMIN |
| `Competency` | 18 engineering competencies (matches explore hub) |
| `Category` | Content taxonomy |
| Sample `Video`, `KnowledgeMeet`, `KnowledgeSeries` | Demo catalog for UI |
| `Notification` samples | In-app notification smoke |
| Bootstrap admin hook | Assigns ADMIN to configured email after first Google login |

## Run

```bash
pnpm db:seed
```

Requires `DATABASE_URL` and completed migrations.

## Not seeded

- Real user accounts (Google OAuth creates users on first login).
- Production secrets or OAuth tokens.

See `database/setup-notes.md`.

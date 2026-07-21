# Phase 5 — Admin, Upload & Approval

## Backend

| Feature | Endpoints |
|---------|-----------|
| Video drafts | `POST /videos`, `PATCH /videos/:id`, `GET /videos/mine` |
| Submit for approval | `POST /videos/:id/submit` |
| Admin approvals | `GET /admin/approvals/pending`, `POST .../approve`, `POST .../reject` |
| Announcements | `GET /announcements`, CRUD at `/admin/announcements` |
| File upload (dev) | `POST /uploads/file` (multipart) |

## Frontend

| Route | Access | Feature |
|-------|--------|---------|
| `/admin` | ADMIN | Overview + quick links |
| `/admin/approvals` | ADMIN | Approval queue |
| `/admin/announcements` | ADMIN | Create/delete announcements |
| `/admin/users` | ADMIN | Assign TEAM/ADMIN roles |
| `/team/upload` | TEAM, ADMIN | Upload draft + submit |

## Workflow

1. Admin assigns **TEAM** role via `/admin/users`
2. Team member uploads at `/team/upload` → status `DRAFT`
3. Team submits → status `PENDING_APPROVAL`
4. Admin approves at `/admin/approvals` → status `PUBLISHED`

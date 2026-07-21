# Security Guide

## Google OAuth

- Domain gate: `ALLOWED_EMAIL_DOMAIN`.
- Server verifies ID token with `GOOGLE_CLIENT_ID`.

## JWT

- Access token in memory (Zustand); refresh in **httpOnly** cookie.
- Secrets ≥ 32 characters, unique per environment.

## RBAC

- Nest guards enforce roles/permissions; see `docs/roles-and-permissions.md`.

## Validation

- Global `ValidationPipe` on API DTOs.
- Upload limits via storage module.

## Sanitization

- Render user markdown via controlled component (`MarkdownBody`).
- Do not use `dangerouslySetInnerHTML` without sanitization.

## Environment variables

- API secrets only in `apps/api/.env`.
- `NEXT_PUBLIC_*` is public — no API keys in web env.

## API hardening

- helmet, CORS restricted to web origin.

## Future security improvements

- Rate limiting on auth endpoints.
- CSP headers tuned for embed players.
- Audit log UI for admin actions.

See `.cursor/rules/security.mdc`.

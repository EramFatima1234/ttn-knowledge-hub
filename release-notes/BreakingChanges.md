# Breaking Changes

## v1.1

- **Learning paths:** `/learning-paths` web routes and API controllers removed from `src/`. Clients must not call removed endpoints. Database tables may still exist until migration.

## API policy

Avoid breaking `api/v1` JSON shapes without version bump and entry here. Use `@knowledgehub/types` for shared contracts.

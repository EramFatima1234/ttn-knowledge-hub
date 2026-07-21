# UI Flow

## Guest → Login

1. Visit any protected URL → redirect `/login`.
2. Google OAuth → `POST /auth/google` → home.

## Learner journey

```mermaid
flowchart TD
  Login --> Home[Home /]
  Home --> KM[Knowledge Meets /meets]
  Home --> KS[Knowledge Series /series]
  KM --> Watch[Watch /watch/id]
  KS --> Watch
  Watch --> Comment[Comments / Q&A]
  Watch --> Bookmark[Bookmark]
  Bookmark --> Library[/library]
  Watch --> CW[Continue watching]
  Home --> Explore[/explore]
  Home --> AI[KnowledgeHub AI FAB]
  CW --> Library
```

**Learning journey** = library + progress widgets (not `/learning-paths` — removed).

## Admin journey

```mermaid
flowchart TD
  ALogin[Login as ADMIN] --> Dash[/admin]
  Dash --> CM[/admin/content Content Manager]
  CM --> Meets[/admin/meets]
  CM --> Series[/admin/series]
  Dash --> Res[/admin/resources]
  Meets --> Publish[Publish / recording URL]
  Series --> Publish
  Dash --> HP[/admin/homepage-builder]
  Dash --> Users[/admin/users]
```

## Team journey

`/team/upload` → `/team/studio` → submit → admin `/admin/approvals`.

Routes reference: `docs/project-build-summary.md` §19.

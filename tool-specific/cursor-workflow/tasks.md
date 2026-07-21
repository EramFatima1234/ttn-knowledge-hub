# Tasks — Traceability Matrix

| Req ID | Requirement | Design | Implementation | DB | API | Test | Doc |
|--------|-------------|--------|----------------|-----|-----|------|-----|
| R-1 | Google login | `design-notes.md` Auth | `modules/auth` | User, RefreshToken | `POST /auth/google` | e2e auth | `api-contract.md` |
| R-2 | RBAC | ADR-003, roles doc | guards, seed | Role, Permission | `/users/:id/roles` | manual | `docs/roles-and-permissions.md` |
| R-3 | Watch video | `architecture/media-*` | `VideoPlayer`, `videos` | Video, History | `/videos/*`, `/history` | manual | `ui-flow.md` |
| R-4 | Knowledge meets | meet flow | `knowledge-meets`, CMS | KnowledgeMeet | `/knowledge-meets`, `/admin/cms/meets` | manual | `architecture/knowledge-meet-flow.md` |
| R-5 | Knowledge series | series flow | `knowledge-series`, CMS | SeriesSession | `/knowledge-series`, `/admin/cms/series` | manual | `architecture/knowledge-series-flow.md` |
| R-6 | Resources | design-notes | `resources`, CMS | Attachment | `/videos/:id/resources` | manual | `data-model.md` |
| R-7 | Learning Journey | ADR-008 | `progress`, `/library` | History, WatchActivity | `/progress/*`, `/history` | manual | `architecture/learning-journey-flow.md` |
| R-8 | Search | design-notes Search | `search`, explore | SearchQueryLog | `/search` | manual | `architecture/search-flow.md` |
| R-9 | Bookmarks | data-model | `engagement` | Bookmark | `/bookmarks` | manual | `acceptance-criteria.md` |
| R-10 | Content Manager | ADR-007 | `admin-cms` | all content tables | `/admin/cms/*` | manual | `architecture/content-management-flow.md` |
| R-11 | Homepage | ADR-010 | CMS homepage | HomepageSection | `/admin/cms/homepage` | manual | `architecture/homepage-flow.md` |
| R-12 | KnowledgeHub AI | ADR-009 | `ai`, `features/ai` | — | `/ai/*` | manual | `ai/spec.md` |
| R-13 | Assessment docs | planning prompt | root `*.md` | `database/*` | `api-contract.md` | `test-strategy.md` | `ai-prompts/*` |

Update this table when adding features.

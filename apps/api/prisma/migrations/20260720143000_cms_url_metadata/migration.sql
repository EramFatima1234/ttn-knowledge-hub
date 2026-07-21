-- CMS metadata: homepage sections, priority, URL resources
ALTER TABLE "knowledge_meets"
  ADD COLUMN IF NOT EXISTS "display_priority" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "homepage_tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "pdf_resource_url" TEXT,
  ADD COLUMN IF NOT EXISTS "external_resource_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "knowledge_series"
  ADD COLUMN IF NOT EXISTS "banner_url" TEXT,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "homepage_tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "display_priority" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "knowledge_meets_homepage_tags_idx" ON "knowledge_meets" USING GIN ("homepage_tags");
CREATE INDEX IF NOT EXISTS "knowledge_meets_display_priority_idx" ON "knowledge_meets" ("display_priority");
CREATE INDEX IF NOT EXISTS "knowledge_series_homepage_tags_idx" ON "knowledge_series" USING GIN ("homepage_tags");
CREATE INDEX IF NOT EXISTS "knowledge_series_display_priority_idx" ON "knowledge_series" ("display_priority");

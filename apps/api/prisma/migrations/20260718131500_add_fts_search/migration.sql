-- Full-text search vectors for Phase 6

ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS "videos_search_vector_idx" ON "videos" USING GIN ("search_vector");

ALTER TABLE "knowledge_meets" ADD COLUMN IF NOT EXISTS "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(coalesce("subtitle", '') || ' ' || coalesce("description", ''), '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS "knowledge_meets_search_vector_idx" ON "knowledge_meets" USING GIN ("search_vector");

ALTER TABLE "knowledge_series" ADD COLUMN IF NOT EXISTS "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS "knowledge_series_search_vector_idx" ON "knowledge_series" USING GIN ("search_vector");

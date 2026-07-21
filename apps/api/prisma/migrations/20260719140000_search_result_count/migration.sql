-- AlterTable
ALTER TABLE "search_query_logs" ADD COLUMN IF NOT EXISTS "result_count" INTEGER NOT NULL DEFAULT 0;

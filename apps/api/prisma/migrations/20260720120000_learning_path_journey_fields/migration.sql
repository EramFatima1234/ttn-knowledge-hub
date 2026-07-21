-- Learning journey metadata and item notes
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "goal" TEXT;
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "target_completion_at" TIMESTAMP(3);

ALTER TABLE "learning_path_items" ADD COLUMN IF NOT EXISTS "notes" TEXT;

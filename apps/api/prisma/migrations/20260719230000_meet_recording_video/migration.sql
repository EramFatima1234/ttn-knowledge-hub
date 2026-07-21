-- Link knowledge meets to published session recordings (videos)
ALTER TABLE "knowledge_meets" ADD COLUMN IF NOT EXISTS "video_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "knowledge_meets_video_id_key" ON "knowledge_meets"("video_id");

ALTER TABLE "knowledge_meets" DROP CONSTRAINT IF EXISTS "knowledge_meets_video_id_fkey";
ALTER TABLE "knowledge_meets" ADD CONSTRAINT "knowledge_meets_video_id_fkey"
  FOREIGN KEY ("video_id") REFERENCES "videos"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Add competency link to speakers (schema had field, migration was missing)
ALTER TABLE "speakers" ADD COLUMN IF NOT EXISTS "competency_id" TEXT;

ALTER TABLE "speakers" DROP CONSTRAINT IF EXISTS "speakers_competency_id_fkey";
ALTER TABLE "speakers" ADD CONSTRAINT "speakers_competency_id_fkey"
  FOREIGN KEY ("competency_id") REFERENCES "competencies"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

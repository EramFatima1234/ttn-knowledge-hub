-- Add difficulty and tags to knowledge meets
CREATE TYPE "SessionDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

ALTER TABLE "knowledge_meets"
  ADD COLUMN IF NOT EXISTS "difficulty" "SessionDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

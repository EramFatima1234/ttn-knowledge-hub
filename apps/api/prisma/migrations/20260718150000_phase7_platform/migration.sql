-- Phase 7: streaming, progress, speakers, learning paths, Q&A, resources, search

CREATE TYPE "ResourceKind" AS ENUM ('GITHUB_REPO', 'SLIDES', 'PDF', 'DEMO', 'DOCUMENTATION', 'LINK', 'OTHER');
CREATE TYPE "LearningPathItemType" AS ENUM ('VIDEO', 'SERIES', 'COMPETENCY', 'CUSTOM');

ALTER TABLE "speakers" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "speakers" ADD COLUMN IF NOT EXISTS "linkedin_url" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "speakers_slug_key" ON "speakers"("slug");

ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "storage_key" TEXT;

ALTER TABLE "attachments" ADD COLUMN IF NOT EXISTS "resource_kind" "ResourceKind";
ALTER TABLE "attachments" ADD COLUMN IF NOT EXISTS "label" TEXT;
ALTER TABLE "attachments" ADD COLUMN IF NOT EXISTS "external_url" TEXT;
ALTER TABLE "attachments" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "attachments_video_id_sort_order_idx" ON "attachments"("video_id", "sort_order");

ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "is_pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "view_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "vote_score" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "questions_video_id_created_at_idx" ON "questions"("video_id", "created_at");

ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "is_pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "vote_score" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "answers_question_id_vote_score_idx" ON "answers"("question_id", "vote_score");

CREATE TABLE IF NOT EXISTS "question_votes" (
    "question_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "question_votes_pkey" PRIMARY KEY ("question_id","user_id"),
    CONSTRAINT "question_votes_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "question_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "answer_votes" (
    "answer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "answer_votes_pkey" PRIMARY KEY ("answer_id","user_id"),
    CONSTRAINT "answer_votes_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "answer_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "speaker_follows" (
    "user_id" TEXT NOT NULL,
    "speaker_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "speaker_follows_pkey" PRIMARY KEY ("user_id","speaker_id"),
    CONSTRAINT "speaker_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "speaker_follows_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "learning_paths" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "learning_paths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "learning_paths_user_id_idx" ON "learning_paths"("user_id");

CREATE TABLE IF NOT EXISTS "learning_path_items" (
    "id" TEXT NOT NULL,
    "path_id" TEXT NOT NULL,
    "item_type" "LearningPathItemType" NOT NULL,
    "content_id" TEXT,
    "title" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_path_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "learning_path_items_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "learning_path_items_path_id_order_index_key" ON "learning_path_items"("path_id", "order_index");

CREATE TABLE IF NOT EXISTS "search_query_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "query" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_query_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "search_query_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "search_query_logs_user_id_created_at_idx" ON "search_query_logs"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "search_query_logs_query_idx" ON "search_query_logs"("query");

CREATE TABLE IF NOT EXISTS "user_playback_preferences" (
    "user_id" TEXT NOT NULL,
    "playback_speed" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "auto_play_next" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_playback_preferences_pkey" PRIMARY KEY ("user_id"),
    CONSTRAINT "user_playback_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "watch_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "content_id" TEXT NOT NULL,
    "watched_seconds" INTEGER NOT NULL DEFAULT 0,
    "watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "watch_activities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "watch_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "watch_activities_user_id_watched_at_idx" ON "watch_activities"("user_id", "watched_at");

ALTER TABLE "drafts" ADD COLUMN IF NOT EXISTS "content_id" TEXT NOT NULL DEFAULT '';
ALTER TABLE "drafts" ADD COLUMN IF NOT EXISTS "step" TEXT NOT NULL DEFAULT 'details';
CREATE UNIQUE INDEX IF NOT EXISTS "drafts_user_id_content_type_content_id_key" ON "drafts"("user_id", "content_type", "content_id");

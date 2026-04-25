-- Add new tables for reading features

-- Reading Sessions (読書タイマー)
CREATE TABLE IF NOT EXISTS "reading_sessions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_book_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "start_time" DATETIME NOT NULL,
  "end_time" DATETIME,
  "duration" INTEGER DEFAULT 0,
  "pages_read" INTEGER DEFAULT 0,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_book_id") REFERENCES "user_books"("id") ON DELETE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "reading_sessions_user_id_idx" ON "reading_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "reading_sessions_user_book_id_idx" ON "reading_sessions"("user_book_id");
CREATE INDEX IF NOT EXISTS "reading_sessions_start_time_idx" ON "reading_sessions"("start_time");

-- Reading Goals (読書目標)
CREATE TABLE IF NOT EXISTS "reading_goals" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "target" INTEGER NOT NULL,
  "current" INTEGER DEFAULT 0,
  "year" INTEGER NOT NULL,
  "month" INTEGER,
  "genre" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "reading_goals_user_id_idx" ON "reading_goals"("user_id");
CREATE INDEX IF NOT EXISTS "reading_goals_year_month_idx" ON "reading_goals"("year", "month");

-- Highlights (引用・ハイライト)
CREATE TABLE IF NOT EXISTS "highlights" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "book_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "page_number" INTEGER,
  "chapter" TEXT,
  "note" TEXT,
  "color" TEXT DEFAULT 'yellow',
  "is_public" BOOLEAN DEFAULT 0,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "highlights_user_id_book_id_idx" ON "highlights"("user_id", "book_id");
CREATE INDEX IF NOT EXISTS "highlights_is_public_idx" ON "highlights"("is_public");

-- Add columns to user_books
ALTER TABLE "user_books" ADD COLUMN "current_page" INTEGER DEFAULT 0;
ALTER TABLE "user_books" ADD COLUMN "rating" INTEGER;

-- CreateTable
CREATE TABLE "reading_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userBookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "pagesRead" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reading_sessions_userBookId_fkey" FOREIGN KEY ("userBookId") REFERENCES "user_books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reading_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "genre" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_activities" ("createdAt", "id", "metadata", "resourceId", "type", "userId") SELECT "createdAt", "id", "metadata", "resourceId", "type", "userId" FROM "activities";
DROP TABLE "activities";
ALTER TABLE "new_activities" RENAME TO "activities";
CREATE INDEX "activities_userId_createdAt_idx" ON "activities"("userId", "createdAt");
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");
CREATE TABLE "new_challenge_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "challenge_participants_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "challenge_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_challenge_participants" ("challengeId", "completed", "completedAt", "id", "joinedAt", "progress", "userId") SELECT "challengeId", "completed", "completedAt", "id", "joinedAt", "progress", "userId" FROM "challenge_participants";
DROP TABLE "challenge_participants";
ALTER TABLE "new_challenge_participants" RENAME TO "challenge_participants";
CREATE INDEX "challenge_participants_userId_completed_idx" ON "challenge_participants"("userId", "completed");
CREATE UNIQUE INDEX "challenge_participants_challengeId_userId_key" ON "challenge_participants"("challengeId", "userId");
CREATE TABLE "new_reading_streaks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastReadDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reading_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reading_streaks" ("createdAt", "currentStreak", "id", "lastReadDate", "longestStreak", "updatedAt", "userId") SELECT "createdAt", "currentStreak", "id", "lastReadDate", "longestStreak", "updatedAt", "userId" FROM "reading_streaks";
DROP TABLE "reading_streaks";
ALTER TABLE "new_reading_streaks" RENAME TO "reading_streaks";
CREATE UNIQUE INDEX "reading_streaks_userId_key" ON "reading_streaks"("userId");
CREATE TABLE "new_user_books" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'to_read',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "readingDays" INTEGER NOT NULL DEFAULT 0,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_books_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_books" ("bookId", "createdAt", "endDate", "id", "memo", "readingDays", "startDate", "status", "updatedAt", "userId") SELECT "bookId", "createdAt", "endDate", "id", "memo", "readingDays", "startDate", "status", "updatedAt", "userId" FROM "user_books";
DROP TABLE "user_books";
ALTER TABLE "new_user_books" RENAME TO "user_books";
CREATE INDEX "user_books_userId_status_idx" ON "user_books"("userId", "status");
CREATE UNIQUE INDEX "user_books_userId_bookId_key" ON "user_books"("userId", "bookId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "reading_sessions_userId_idx" ON "reading_sessions"("userId");

-- CreateIndex
CREATE INDEX "reading_sessions_userBookId_idx" ON "reading_sessions"("userBookId");

-- CreateIndex
CREATE INDEX "reading_sessions_startTime_idx" ON "reading_sessions"("startTime");

-- CreateIndex
CREATE INDEX "reading_goals_userId_idx" ON "reading_goals"("userId");

-- CreateIndex
CREATE INDEX "reading_goals_year_month_idx" ON "reading_goals"("year", "month");

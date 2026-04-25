/*
  Warnings:

  - Added the required column `updatedAt` to the `event_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "publishAt" DATETIME;

-- CreateTable
CREATE TABLE "event_report_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_report_comments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "event_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_event_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "publishAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "event_reports_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_event_reports" ("content", "createdAt", "eventId", "id", "userId") SELECT "content", "createdAt", "eventId", "id", "userId" FROM "event_reports";
DROP TABLE "event_reports";
ALTER TABLE "new_event_reports" RENAME TO "event_reports";
CREATE INDEX "event_reports_publishAt_idx" ON "event_reports"("publishAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "event_report_comments_reportId_idx" ON "event_report_comments"("reportId");

-- CreateIndex
CREATE INDEX "reviews_publishAt_idx" ON "reviews"("publishAt");

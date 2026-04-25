import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Aggregation service for Activity.metadata (JSON string).
 *
 * Uses SQLite's json_extract() to read fields out of the free-form
 * metadata column at query time. All queries are user-scoped and
 * parameterised via Prisma.sql to prevent injection.
 */

export interface DateRange {
  since?: Date;
  until?: Date;
}

function dateRangeFilter(range: DateRange = {}): Prisma.Sql {
  const parts: Prisma.Sql[] = [];
  if (range.since) parts.push(Prisma.sql`AND createdAt >= ${range.since}`);
  if (range.until) parts.push(Prisma.sql`AND createdAt < ${range.until}`);
  return parts.length > 0 ? Prisma.join(parts, " ") : Prisma.empty;
}

export interface TypeCount {
  type: string;
  count: number;
}

/** Activity count per type for a user, optionally within a time window. */
export async function getActivityCountsByType(
  userId: string,
  range: DateRange = {}
): Promise<TypeCount[]> {
  const rows = await prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
    SELECT type, COUNT(*) as count
    FROM activities
    WHERE userId = ${userId}
    ${dateRangeFilter(range)}
    GROUP BY type
    ORDER BY count DESC
  `;
  return rows.map((r) => ({ type: r.type, count: Number(r.count) }));
}

export interface DayCount {
  day: string; // YYYY-MM-DD
  count: number;
}

/** Daily activity counts for a histogram. Optionally filter by type. */
export async function getActivityCountsByDay(
  userId: string,
  options: { type?: string } & DateRange = {}
): Promise<DayCount[]> {
  const typeFilter = options.type
    ? Prisma.sql`AND type = ${options.type}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
    SELECT strftime('%Y-%m-%d', createdAt) as day, COUNT(*) as count
    FROM activities
    WHERE userId = ${userId}
    ${typeFilter}
    ${dateRangeFilter(options)}
    GROUP BY day
    ORDER BY day ASC
  `;
  return rows.map((r) => ({ day: r.day, count: Number(r.count) }));
}

export interface BookActivity {
  bookId: string;
  count: number;
}

/**
 * Top books by activity count for a user, extracted from `metadata.bookId`.
 * Skips rows where metadata is null or bookId is missing.
 */
export async function getTopBooksByActivity(
  userId: string,
  options: { type?: string; limit?: number } & DateRange = {}
): Promise<BookActivity[]> {
  const limit = options.limit ?? 10;
  const typeFilter = options.type
    ? Prisma.sql`AND type = ${options.type}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<Array<{ bookId: string; count: bigint }>>`
    SELECT json_extract(metadata, '$.bookId') as bookId, COUNT(*) as count
    FROM activities
    WHERE userId = ${userId}
      AND metadata IS NOT NULL
      AND json_extract(metadata, '$.bookId') IS NOT NULL
    ${typeFilter}
    ${dateRangeFilter(options)}
    GROUP BY bookId
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ bookId: r.bookId, count: Number(r.count) }));
}

export interface GroupActivity {
  groupId: string;
  count: number;
}

/**
 * Activity counts grouped by `metadata.groupId` — useful for showing
 * which group a user is most active in.
 */
export async function getActivityCountsByGroup(
  userId: string,
  range: DateRange = {}
): Promise<GroupActivity[]> {
  const rows = await prisma.$queryRaw<Array<{ groupId: string; count: bigint }>>`
    SELECT json_extract(metadata, '$.groupId') as groupId, COUNT(*) as count
    FROM activities
    WHERE userId = ${userId}
      AND metadata IS NOT NULL
      AND json_extract(metadata, '$.groupId') IS NOT NULL
    ${dateRangeFilter(range)}
    GROUP BY groupId
    ORDER BY count DESC
  `;
  return rows.map((r) => ({ groupId: r.groupId, count: Number(r.count) }));
}

/**
 * One-shot summary used by dashboards: total activities, per-type counts,
 * and recent days of activity — all in a single call.
 */
export interface ActivitySummary {
  total: number;
  byType: TypeCount[];
  recentDays: DayCount[];
}

export async function getActivitySummary(
  userId: string,
  range: DateRange = {}
): Promise<ActivitySummary> {
  const [byType, recentDays] = await Promise.all([
    getActivityCountsByType(userId, range),
    getActivityCountsByDay(userId, range),
  ]);
  const total = byType.reduce((sum, row) => sum + row.count, 0);
  return { total, byType, recentDays };
}

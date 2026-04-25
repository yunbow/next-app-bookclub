"use server";

import { prisma } from "@/lib/prisma";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import type { ActionResult } from "@/lib/types/action-result";
import { z } from "zod";

export interface MonthlyReadingStats {
  month: string;
  booksCount: number;
  pagesCount: number;
}

export interface ReadingTrend {
  category: string;
  count: number;
}

export interface YearlyStats {
  totalBooks: number;
  totalPages: number;
  averageRating: number;
  topCategories: ReadingTrend[];
  monthlyStats: MonthlyReadingStats[];
}

interface ReadingStatsSummary {
  totalBooks: number;
  completedBooks: number;
  readingBooks: number;
  toReadBooks: number;
  totalReviews: number;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userImage: string | null;
  booksCompleted: number;
}

interface ReviewRankingEntry {
  id: string;
  content: string;
  rating: number | null;
  createdAt: Date;
  reactionCount: number;
  user: { id: string; name: string | null; image: string | null };
  book: { id: string; title: string; author: string | null; coverImage: string | null };
}

const yearSchema = z.object({
  year: z.number().int().min(1900).max(2100),
});

/**
 * Get user's reading statistics for a specific year
 */
export async function getYearlyReadingStats(
  data: unknown
): Promise<ActionResult<YearlyStats>> {
  return withAction(async ({ validData }) => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const { year } = validData!;
    const userId = authResult.userId;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // Get completed books in the year
    const completedBooks = await prisma.userBook.findMany({
      where: {
        userId,
        status: "completed",
        endDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        book: true,
      },
      take: 1000,
    });

    // Calculate total books and pages
    const totalBooks = completedBooks.length;
    const totalPages = completedBooks.reduce(
      (sum, ub) => sum + (ub.book.pages || 0),
      0
    );

    // Get reviews for average rating
    const reviews = await prisma.review.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        rating: { not: null },
      },
      select: { rating: true },
      take: 1000,
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

    // Calculate category distribution
    const categoryMap = new Map<string, number>();
    completedBooks.forEach((ub) => {
      const category = ub.book.category || "Uncategorized";
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const topCategories: ReadingTrend[] = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate monthly stats
    const monthlyMap = new Map<string, { booksCount: number; pagesCount: number }>();

    for (let month = 0; month < 12; month++) {
      const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
      monthlyMap.set(monthKey, { booksCount: 0, pagesCount: 0 });
    }

    completedBooks.forEach((ub) => {
      if (ub.endDate) {
        const monthKey = `${ub.endDate.getFullYear()}-${String(
          ub.endDate.getMonth() + 1
        ).padStart(2, "0")}`;
        const stats = monthlyMap.get(monthKey);
        if (stats) {
          stats.booksCount += 1;
          stats.pagesCount += ub.book.pages || 0;
        }
      }
    });

    const monthlyStats: MonthlyReadingStats[] = Array.from(monthlyMap.entries())
      .map(([month, stats]) => ({
        month,
        booksCount: stats.booksCount,
        pagesCount: stats.pagesCount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      success: true,
      data: {
        totalBooks,
        totalPages,
        averageRating,
        topCategories,
        monthlyStats,
      },
    };
  }, { data, schema: yearSchema });
}

/**
 * Get reading statistics summary
 */
export async function getReadingStatsSummary(): Promise<ActionResult<ReadingStatsSummary>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const userId = authResult.userId;

    const [totalBooks, completedBooks, readingBooks, toReadBooks, reviews] =
      await Promise.all([
        prisma.userBook.count({ where: { userId } }),
        prisma.userBook.count({ where: { userId, status: "completed" } }),
        prisma.userBook.count({ where: { userId, status: "reading" } }),
        prisma.userBook.count({ where: { userId, status: "to_read" } }),
        prisma.review.count({ where: { userId } }),
      ]);

    return {
      success: true,
      data: {
        totalBooks,
        completedBooks,
        readingBooks,
        toReadBooks,
        totalReviews: reviews,
      },
    };
  });
}

/**
 * Get reading leaderboard
 */
export async function getReadingLeaderboard(
  limit: number = 10
): Promise<ActionResult<LeaderboardEntry[]>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);

    const userStats = await prisma.userBook.groupBy({
      by: ["userId"],
      where: {
        status: "completed",
        endDate: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: limit,
    });

    const userIds = userStats.map((stat) => stat.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true },
      take: 100,
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const data = userStats.map((stat) => {
      const user = userMap.get(stat.userId);
      return {
        userId: stat.userId,
        userName: user?.name || "Unknown User",
        userImage: user?.image || null,
        booksCompleted: stat._count.id,
      };
    });

    return { success: true, data };
  });
}

/**
 * Get review ranking by likes (reactions)
 */
export async function getReviewRanking(
  limit: number = 10
): Promise<ActionResult<ReviewRankingEntry[]>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const reviews = await prisma.review.findMany({
      where: {
        visibility: "public",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
      orderBy: {
        reactions: {
          _count: "desc",
        },
      },
      take: limit,
    });

    const data = reviews.map((review) => ({
      id: review.id,
      content: review.content.substring(0, 200),
      rating: review.rating,
      createdAt: review.createdAt,
      reactionCount: review._count.reactions,
      user: review.user,
      book: review.book,
    }));

    return { success: true, data };
  });
}

'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger, createContextLogger } from '@/lib/logger';
import { withAction, requireAuth } from '@/lib/actions/action-helpers';
import type { ActionResult } from '@/lib/types/action-result';
import {
  ActionResult as ErrorActionResult,
  success,
  errorToActionResult,
  ERROR_CODES
} from '@/lib/errors';
import { awardBadge } from '@/features/badge/server/award-badge-internal';

const yearSchema = z.number().int().min(2000).max(2100);

/**
 * Update reading streak when user reads
 * Uses transaction to ensure atomicity of streak update, badge award, and XP
 * Internal helper - not exported as it accepts arbitrary userId
 */
async function updateReadingStreak(userId: string): Promise<ErrorActionResult<unknown>> {
  const requestId = `update-streak-${Date.now()}`;
  const log = createContextLogger(requestId, userId);

  try {
    log.info('Starting reading streak update');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.readingStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      // Create new streak with transaction
      const result = await prisma.$transaction(async (tx) => {
        const newStreak = await tx.readingStreak.create({
          data: {
            userId,
            currentStreak: 1,
            longestStreak: 1,
            lastReadDate: new Date(),
          },
        });

        // Award first day badge
        await awardBadge(userId, 'first_book');

        return newStreak;
      });

      log.info('New streak created');
      return success(result);
    }

    const lastRead = streak.lastReadDate ? new Date(streak.lastReadDate) : null;
    if (!lastRead) {
      const result = await prisma.readingStreak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(1, streak.longestStreak),
          lastReadDate: new Date(),
        },
      });
      log.info('First read recorded');
      return success(result);
    }

    lastRead.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24));

    let newCurrentStreak = streak.currentStreak;

    if (daysDiff === 0) {
      log.info('Same day read, no streak change');
      return success(streak);
    } else if (daysDiff === 1) {
      newCurrentStreak = streak.currentStreak + 1;
    log.info('Consecutive day read');
    } else {
      newCurrentStreak = 1;
      log.info('Streak broken, resetting');
    }

    const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const updatedStreak = await tx.readingStreak.update({
        where: { userId },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastReadDate: new Date(),
        },
      });

      // Check for streak badges
      if (newCurrentStreak === 7) {
        await awardBadge(userId, 'streak_7');
      } else if (newCurrentStreak === 30) {
        await awardBadge(userId, 'streak_30');
      } else if (newCurrentStreak === 100) {
        await awardBadge(userId, 'streak_100');
      }

      // Award streak milestone XP
      if (newCurrentStreak % 10 === 0) {
        const { awardXP } = await import('@/features/gamification/server/xp-actions');
        await awardXP(userId, 20, `${newCurrentStreak} day reading streak!`);
      }

      return updatedStreak;
    });

    log.info('Streak updated successfully');
    return success(result);
  } catch (error) {
    logger.error({
      action: 'update_reading_streak',
      userId,
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, 'Failed to update reading streak');

    return errorToActionResult(error, requestId);
  }
}

/**
 * Get user's reading streak
 */
export async function getUserStreak(userId?: string): Promise<ActionResult<{ currentStreak: number; longestStreak: number; lastReadDate?: Date | null }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;
    const targetUserId = userId || authResult.userId;

    let streak = await prisma.readingStreak.findUnique({
      where: { userId: targetUserId },
    });

    // If viewing own streak and it doesn't exist, create it
    if (targetUserId === authResult.userId && !streak) {
      streak = await prisma.readingStreak.create({
        data: {
          userId: targetUserId,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    } else if (!streak) {
      return { success: true, data: { currentStreak: 0, longestStreak: 0 } };
    }

    // Check if streak is still valid
    if (streak.lastReadDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastRead = new Date(streak.lastReadDate);
      lastRead.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 1) {
        // Streak broken
        streak = await prisma.readingStreak.update({
          where: { userId: targetUserId },
          data: {
            currentStreak: 0,
          },
        });
      }
    }

    return { success: true, data: streak };
  });
}

/**
 * Get streak leaderboard
 * Optimized to avoid N+1 queries using include
 */
export async function getStreakLeaderboard(limit: number = 10): Promise<ActionResult<Array<{
  rank: number;
  userId: string;
  userName: string;
  userImage: string | null;
  currentStreak: number;
  longestStreak: number;
}>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const streaks = await prisma.readingStreak.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        currentStreak: 'desc',
      },
      take: limit,
    });

    const data = streaks.map((streak, index) => ({
      rank: index + 1,
      userId: streak.userId,
      userName: streak.user?.name || 'Unknown User',
      userImage: streak.user?.image || null,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
    }));

    return { success: true, data };
  });
}

/**
 * Get reading calendar (heatmap data)
 */
export async function getReadingCalendar(userId: string | undefined, year: number): Promise<ActionResult<Array<{ date: string; count: number }>>> {
  return withAction(async ({ validData }) => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;
    const targetUserId = userId || authResult.userId;

    const validYear = validData!;

    const startDate = new Date(validYear, 0, 1);
    const endDate = new Date(validYear + 1, 0, 1);

    const activities = await prisma.activity.findMany({
      where: {
        userId: targetUserId,
        type: {
          in: ['reading_started', 'reading_completed'],
        },
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 1000,
    });

    // Group by date
    const calendar = new Map<string, number>();

    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split('T')[0];
      calendar.set(date, (calendar.get(date) || 0) + 1);
    });

    // Convert to array format
    const result: Array<{ date: string; count: number }> = [];
    for (const [date, count] of calendar.entries()) {
      result.push({ date, count });
    }

    return { success: true, data: result };
  }, { data: year, schema: yearSchema });
}

/**
 * Check if user read today
 * Internal helper - not exported as it accepts arbitrary userId
 */
async function checkReadToday(userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activity = await prisma.activity.findFirst({
    where: {
      userId,
      type: {
        in: ['reading_started', 'reading_completed'],
      },
      createdAt: {
        gte: today,
      },
    },
  });

  return !!activity;
}

/**
 * Get streak statistics
 */
export async function getStreakStatistics(): Promise<ActionResult<{
  totalUsers: number;
  activeStreaks: number;
  longestStreak: {
    userId: string;
    userName: string;
    days: number;
  } | null;
}>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const [totalUsers, activeStreaks, longestStreak] = await Promise.all([
      prisma.readingStreak.count(),
      prisma.readingStreak.count({
        where: {
          currentStreak: {
            gt: 0,
          },
        },
      }),
      prisma.readingStreak.findFirst({
        orderBy: {
          longestStreak: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        activeStreaks,
        longestStreak: longestStreak
          ? {
              userId: longestStreak.userId,
              userName: longestStreak.user?.name || 'Unknown User',
              days: longestStreak.longestStreak,
            }
          : null,
      },
    };
  });
}

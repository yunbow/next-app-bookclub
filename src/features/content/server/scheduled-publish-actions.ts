'use server';

import { prisma } from '@/lib/prisma';
import { withAction, requireAuth } from '@/lib/actions/action-helpers';
import type { ActionResult } from '@/lib/types/action-result';
import { logger } from '@/lib/logger';

/**
 * Publish reviews that are scheduled for now or earlier
 */
export async function publishScheduledReviews(): Promise<ActionResult<number>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const now = new Date();

    const reviews = await prisma.review.findMany({
      where: {
        userId: authResult.userId,
        visibility: 'draft',
        publishAt: {
          lte: now,
        },
      },
      take: 100,
    });

    for (const review of reviews) {
      await prisma.review.update({
        where: { id: review.id },
        data: {
          visibility: 'public',
          publishAt: null,
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          userId: review.userId,
          type: 'review_posted',
          resourceId: review.id,
          metadata: JSON.stringify({ bookId: review.bookId }),
        },
      });
    }

    return { success: true, data: reviews.length };
  });
}

/**
 * Publish event reports that are scheduled for now or earlier
 */
export async function publishScheduledEventReports(): Promise<ActionResult<number>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const now = new Date();

    const reports = await prisma.eventReport.findMany({
      where: {
        userId: authResult.userId,
        visibility: 'draft',
        publishAt: {
          lte: now,
        },
      },
      take: 100,
    });

    for (const report of reports) {
      await prisma.eventReport.update({
        where: { id: report.id },
        data: {
          visibility: 'public',
          publishAt: null,
        },
      });
    }

    return { success: true, data: reports.length };
  });
}

/**
 * Get user's draft reviews
 */
export async function getUserDraftReviews(): Promise<ActionResult<Record<string, unknown>[]>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const drafts = await prisma.review.findMany({
      where: {
        userId: authResult.userId,
        visibility: 'draft',
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 100,
    });

    return { success: true, data: drafts };
  });
}

/**
 * Get user's scheduled reviews
 */
export async function getUserScheduledReviews(): Promise<ActionResult<Record<string, unknown>[]>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const scheduled = await prisma.review.findMany({
      where: {
        userId: authResult.userId,
        visibility: 'draft',
        publishAt: {
          not: null,
        },
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        publishAt: 'asc',
      },
      take: 100,
    });

    return { success: true, data: scheduled };
  });
}

/**
 * Schedule a review for future publication
 */
export async function scheduleReviewPublication(
  reviewId: string,
  publishAt: Date
): Promise<ActionResult<Record<string, unknown>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true },
    });

    if (!review) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Review not found' },
      };
    }

    if (review.userId !== authResult.userId) {
      logger.error({
        type: 'authorization_failure',
        severity: 'high',
        userId: authResult.userId,
        resourceId: reviewId,
      }, 'Unauthorized review access attempt');
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to modify this review' },
      };
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        visibility: 'draft',
        publishAt,
      },
    });

    return { success: true, data: updated };
  });
}

/**
 * Cancel scheduled publication
 */
export async function cancelScheduledPublication(reviewId: string): Promise<ActionResult<Record<string, unknown>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true },
    });

    if (!review) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Review not found' },
      };
    }

    if (review.userId !== authResult.userId) {
      logger.error({
        type: 'authorization_failure',
        severity: 'high',
        userId: authResult.userId,
        resourceId: reviewId,
      }, 'Unauthorized review access attempt');
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to modify this review' },
      };
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        publishAt: null,
      },
    });

    return { success: true, data: updated };
  });
}

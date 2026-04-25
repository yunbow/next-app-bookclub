/**
 * Internal badge awarding helper.
 * NOT a 'use server' file — this is a server-only utility that should be
 * imported by other server actions but never exposed directly to clients.
 */

import { prisma } from '@/lib/prisma';
import { logger, createContextLogger } from '@/lib/logger';
import {
  ActionResult,
  success,
  errorToActionResult,
  ERROR_CODES,
  DomainError,
} from '@/lib/errors';

/**
 * Award badge to user
 * Uses transaction to ensure atomicity of badge award, XP, and notification
 */
export async function awardBadge(
  userId: string,
  badgeCode: string
): Promise<ActionResult<unknown>> {
  const requestId = `award-badge-${Date.now()}`;
  const log = createContextLogger(requestId, userId);

  try {
    log.info('Starting badge award process');

    // Check if user already has this badge
    const existing = await prisma.userBadge.findFirst({
      where: {
        userId,
        badge: {
          code: badgeCode,
        },
      },
    });

    if (existing) {
      log.info('User already has this badge');
      return success(null);
    }

    const badge = await prisma.badge.findUnique({
      where: { code: badgeCode },
    });

    if (!badge) {
      log.warn('Badge not found');
      throw new DomainError(
        ERROR_CODES.NOT_FOUND,
        'バッジが見つかりません',
        false,
        { badgeCode }
      );
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Award badge
      const userBadge = await tx.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      });

      // Award XP
      if (badge.xpReward > 0) {
        const { awardXP } = await import('@/features/gamification/server/xp-actions');
        await awardXP(userId, badge.xpReward, `Earned badge: ${badge.name}`);
      }

      // Create notification
      await tx.notification.create({
        data: {
          type: 'badge_earned',
          recipientId: userId,
          actorId: userId,
          resourceId: badge.id,
        },
      });

      return userBadge;
    });

    log.info('Badge awarded successfully');
    return success(result);
  } catch (error) {
    logger.error({
      action: 'award_badge',
      userId,
      badgeCode,
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, 'Failed to award badge');

    return errorToActionResult(error, requestId);
  }
}

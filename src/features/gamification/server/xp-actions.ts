'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/config';

// XP rewards for different actions
const XP_REWARDS = {
  BOOK_COMPLETED: 50,
  REVIEW_POSTED: 30,
  REVIEW_COMMENT: 5,
  REVIEW_REACTION: 2,
  EVENT_CREATED: 20,
  EVENT_PARTICIPATED: 15,
  FOLLOW_USER: 1,
  DAILY_LOGIN: 5,
};

// Level calculation: level = floor(sqrt(xp / 100))
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

/**
 * Award XP to user
 */
export async function awardXP(userId: string, amount: number, reason: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newXP = user.xp + amount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > user.level;

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
    },
  });

  // Create notification if leveled up
  if (leveledUp) {
    await prisma.notification.create({
      data: {
        type: 'level_up',
        recipientId: userId,
        actorId: userId,
        resourceId: newLevel.toString(),
      },
    });
  }

  return {
    xp: newXP,
    level: newLevel,
    leveledUp,
    xpGained: amount,
    reason,
  };
}

/**
 * Award XP for completing a book
 */
export async function awardBookCompletionXP(userId: string, bookId: string) {
  return await awardXP(
    userId,
    XP_REWARDS.BOOK_COMPLETED,
    `Completed book: ${bookId}`
  );
}

/**
 * Award XP for posting a review
 */
export async function awardReviewPostXP(userId: string, reviewId: string) {
  return await awardXP(
    userId,
    XP_REWARDS.REVIEW_POSTED,
    `Posted review: ${reviewId}`
  );
}

/**
 * Award XP for commenting on a review
 */
export async function awardReviewCommentXP(userId: string) {
  return await awardXP(userId, XP_REWARDS.REVIEW_COMMENT, 'Commented on review');
}

/**
 * Award XP for reacting to a review
 */
export async function awardReviewReactionXP(userId: string) {
  return await awardXP(userId, XP_REWARDS.REVIEW_REACTION, 'Reacted to review');
}

/**
 * Award XP for creating an event
 */
export async function awardEventCreationXP(userId: string, eventId: string) {
  return await awardXP(
    userId,
    XP_REWARDS.EVENT_CREATED,
    `Created event: ${eventId}`
  );
}

/**
 * Award XP for participating in an event
 */
export async function awardEventParticipationXP(userId: string, eventId: string) {
  return await awardXP(
    userId,
    XP_REWARDS.EVENT_PARTICIPATED,
    `Participated in event: ${eventId}`
  );
}

/**
 * Award XP for following a user
 */
export async function awardFollowXP(userId: string) {
  return await awardXP(userId, XP_REWARDS.FOLLOW_USER, 'Followed a user');
}

/**
 * Award XP for daily login
 */
export async function awardDailyLoginXP(userId: string) {
  // Check if user already got daily login XP today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activities = await prisma.activity.findFirst({
    where: {
      userId,
      type: 'daily_login',
      createdAt: {
        gte: today,
      },
    },
  });

  if (activities) {
    return null; // Already got daily login XP today
  }

  // Create activity record
  await prisma.activity.create({
    data: {
      userId,
      type: 'daily_login',
    },
  });

  return await awardXP(userId, XP_REWARDS.DAILY_LOGIN, 'Daily login');
}

/**
 * Get user's XP and level info
 */
export async function getUserXPInfo(userId?: string) {
  const session = await auth();
  const targetUserId = userId || session?.user?.id;

  if (!targetUserId) {
    throw new Error('User ID required');
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      image: true,
      xp: true,
      level: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const currentLevelXP = user.level * user.level * 100;
  const nextLevelXP = (user.level + 1) * (user.level + 1) * 100;
  const xpForNextLevel = nextLevelXP - user.xp;
  const progressPercent = ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return {
    ...user,
    currentLevelXP,
    nextLevelXP,
    xpForNextLevel,
    progressPercent: Math.round(progressPercent),
  };
}

/**
 * Get XP leaderboard
 */
export async function getXPLeaderboard(limit: number = 10) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      xp: true,
      level: true,
    },
    orderBy: [
      { level: 'desc' },
      { xp: 'desc' },
    ],
    take: limit,
  });

  return users.map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
}

/**
 * Get user's recent XP activities
 */
export async function getUserXPHistory(limit: number = 20) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // This would require a separate XP history table in production
  // For now, we'll return activities that typically award XP
  const activities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
      type: {
        in: [
          'reading_completed',
          'review_posted',
          'event_created',
          'event_joined',
          'daily_login',
        ],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return activities.map((activity) => {
    let xpAmount = 0;
    switch (activity.type) {
      case 'reading_completed':
        xpAmount = XP_REWARDS.BOOK_COMPLETED;
        break;
      case 'review_posted':
        xpAmount = XP_REWARDS.REVIEW_POSTED;
        break;
      case 'event_created':
        xpAmount = XP_REWARDS.EVENT_CREATED;
        break;
      case 'event_joined':
        xpAmount = XP_REWARDS.EVENT_PARTICIPATED;
        break;
      case 'daily_login':
        xpAmount = XP_REWARDS.DAILY_LOGIN;
        break;
    }

    return {
      id: activity.id,
      type: activity.type,
      xpAmount,
      createdAt: activity.createdAt,
    };
  });
}

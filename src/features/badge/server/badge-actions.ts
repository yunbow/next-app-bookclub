'use server';

import { prisma } from '@/lib/prisma';
import { withAction, requireAuth } from '@/lib/actions/action-helpers';
import type { ActionResult } from '@/lib/types/action-result';
import { awardBadge } from '@/features/badge/server/award-badge-internal';

// Badge definitions
const BADGE_DEFINITIONS = {
  // Reading badges
  first_book: {
    code: 'first_book',
    name: '初めての一冊',
    description: '最初の本を読了',
    icon: '📖',
    rarity: 'common',
    category: 'reading',
    xpReward: 10,
  },
  books_10: {
    code: 'books_10',
    name: '読書家への第一歩',
    description: '10冊読了',
    icon: '📚',
    rarity: 'common',
    category: 'reading',
    xpReward: 50,
  },
  books_50: {
    code: 'books_50',
    name: '読書マスター',
    description: '50冊読了',
    icon: '🎓',
    rarity: 'rare',
    category: 'reading',
    xpReward: 200,
  },
  books_100: {
    code: 'books_100',
    name: '読書の達人',
    description: '100冊読了',
    icon: '👑',
    rarity: 'epic',
    category: 'reading',
    xpReward: 500,
  },

  // Review badges
  first_review: {
    code: 'first_review',
    name: '初レビュー',
    description: '最初のレビューを投稿',
    icon: '✍️',
    rarity: 'common',
    category: 'social',
    xpReward: 10,
  },
  reviews_10: {
    code: 'reviews_10',
    name: 'レビュアー',
    description: '10件のレビューを投稿',
    icon: '📝',
    rarity: 'common',
    category: 'social',
    xpReward: 50,
  },
  reviews_50: {
    code: 'reviews_50',
    name: '人気レビュアー',
    description: '50件のレビューを投稿',
    icon: '⭐',
    rarity: 'rare',
    category: 'social',
    xpReward: 200,
  },

  // Genre badges
  genre_master_fiction: {
    code: 'genre_master_fiction',
    name: 'フィクションマスター',
    description: 'フィクション20冊読了',
    icon: '🎭',
    rarity: 'rare',
    category: 'reading',
    xpReward: 100,
  },
  genre_master_nonfiction: {
    code: 'genre_master_nonfiction',
    name: 'ノンフィクションマスター',
    description: 'ノンフィクション20冊読了',
    icon: '📰',
    rarity: 'rare',
    category: 'reading',
    xpReward: 100,
  },
  genre_diversity: {
    code: 'genre_diversity',
    name: 'ジャンルコレクター',
    description: '5つの異なるジャンルを読破',
    icon: '🌈',
    rarity: 'rare',
    category: 'reading',
    xpReward: 150,
  },

  // Streak badges
  streak_7: {
    code: 'streak_7',
    name: '7日連続',
    description: '7日連続で読書',
    icon: '🔥',
    rarity: 'common',
    category: 'streak',
    xpReward: 30,
  },
  streak_30: {
    code: 'streak_30',
    name: '30日連続',
    description: '30日連続で読書',
    icon: '💪',
    rarity: 'rare',
    category: 'streak',
    xpReward: 150,
  },
  streak_100: {
    code: 'streak_100',
    name: '100日連続',
    description: '100日連続で読書',
    icon: '🏆',
    rarity: 'epic',
    category: 'streak',
    xpReward: 500,
  },

  // Social badges
  comments_100: {
    code: 'comments_100',
    name: 'コメント王',
    description: '100件のコメントを投稿',
    icon: '💬',
    rarity: 'rare',
    category: 'social',
    xpReward: 100,
  },
  likes_1000: {
    code: 'likes_1000',
    name: '人気者',
    description: 'レビューに1000いいね獲得',
    icon: '❤️',
    rarity: 'epic',
    category: 'social',
    xpReward: 300,
  },
  followers_50: {
    code: 'followers_50',
    name: 'インフルエンサー',
    description: '50人のフォロワー獲得',
    icon: '🌟',
    rarity: 'rare',
    category: 'social',
    xpReward: 200,
  },

  // Event badges
  event_organizer: {
    code: 'event_organizer',
    name: 'イベント主催者',
    description: '初めてのイベントを開催',
    icon: '🎪',
    rarity: 'common',
    category: 'event',
    xpReward: 50,
  },
  event_participant_10: {
    code: 'event_participant_10',
    name: 'イベント常連',
    description: '10回イベントに参加',
    icon: '🎉',
    rarity: 'rare',
    category: 'event',
    xpReward: 100,
  },

  // Special badges
  early_bird: {
    code: 'early_bird',
    name: '早起き読書家',
    description: '朝6時前に読書記録',
    icon: '🌅',
    rarity: 'rare',
    category: 'reading',
    xpReward: 50,
  },
  night_owl: {
    code: 'night_owl',
    name: '夜更かし読書家',
    description: '深夜2時以降に読書記録',
    icon: '🌙',
    rarity: 'rare',
    category: 'reading',
    xpReward: 50,
  },
  speed_reader: {
    code: 'speed_reader',
    name: 'スピードリーダー',
    description: '1日で本を読了',
    icon: '⚡',
    rarity: 'epic',
    category: 'reading',
    xpReward: 100,
  },
};

/**
 * Initialize all badges in database
 */
export async function initializeBadges(): Promise<ActionResult<{ count: number }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    // TODO: Add proper admin role check when role system is implemented
    // For now, this endpoint is protected by auth + API route level admin check

    for (const badge of Object.values(BADGE_DEFINITIONS)) {
      await prisma.badge.upsert({
        where: { code: badge.code },
        update: badge,
        create: {
          ...badge,
          requirement: JSON.stringify({}),
        },
      });
    }

    return { success: true, data: { count: Object.keys(BADGE_DEFINITIONS).length } };
  });
}

/**
 * Check and award badges based on user activity
 * Internal helper - not exported as it accepts arbitrary userId
 */
async function checkAndAwardBadges(userId: string) {
  const badges: string[] = [];

  // Count completed books
  const completedBooks = await prisma.userBook.count({
    where: { userId, status: 'completed' },
  });

  if (completedBooks === 1) badges.push('first_book');
  if (completedBooks >= 10) badges.push('books_10');
  if (completedBooks >= 50) badges.push('books_50');
  if (completedBooks >= 100) badges.push('books_100');

  // Count reviews
  const reviewCount = await prisma.review.count({
    where: { userId },
  });

  if (reviewCount === 1) badges.push('first_review');
  if (reviewCount >= 10) badges.push('reviews_10');
  if (reviewCount >= 50) badges.push('reviews_50');

  // Count comments
  const commentCount = await prisma.reviewComment.count({
    where: { userId },
  });

  if (commentCount >= 100) badges.push('comments_100');

  // Count followers
  const followerCount = await prisma.follow.count({
    where: { followingId: userId },
  });

  if (followerCount >= 50) badges.push('followers_50');

  // Count total likes on reviews
  const totalLikes = await prisma.reviewReaction.count({
    where: {
      review: {
        userId,
      },
      type: 'like',
    },
  });

  if (totalLikes >= 1000) badges.push('likes_1000');

  // Check genre diversity
  const userBooks = await prisma.userBook.findMany({
    where: { userId, status: 'completed' },
    include: { book: { select: { category: true } } },
    take: 1000,
  });

  const uniqueGenres = new Set(
    userBooks.map((ub) => ub.book.category).filter((c) => c)
  );

  if (uniqueGenres.size >= 5) badges.push('genre_diversity');

  // Check streak
  const streak = await prisma.readingStreak.findUnique({
    where: { userId },
  });

  if (streak) {
    if (streak.currentStreak >= 7) badges.push('streak_7');
    if (streak.currentStreak >= 30) badges.push('streak_30');
    if (streak.currentStreak >= 100) badges.push('streak_100');
  }

  // Award all earned badges
  const awarded = [];
  for (const badgeCode of badges) {
    const result = await awardBadge(userId, badgeCode);
    if (result) awarded.push(badgeCode);
  }

  return awarded;
}

/**
 * Get user's badges
 */
export async function getUserBadges(userId?: string): Promise<ActionResult<Awaited<ReturnType<typeof prisma.userBadge.findMany>>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;
    const targetUserId = userId || authResult.userId;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: targetUserId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
      take: 100,
    });

    return { success: true, data: userBadges };
  });
}

/**
 * Get all available badges
 */
export async function getAllBadges(): Promise<ActionResult<Awaited<ReturnType<typeof prisma.badge.findMany>>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const badges = await prisma.badge.findMany({
      orderBy: [{ category: 'asc' }, { rarity: 'asc' }],
      take: 100,
    });

    return { success: true, data: badges };
  });
}

/**
 * Get badge progress for user
 */
export async function getBadgeProgress(userId?: string): Promise<ActionResult<{
  completedBooks: number;
  reviews: number;
  comments: number;
  followers: number;
  currentStreak: number;
  longestStreak: number;
}>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;
    const targetUserId = userId || authResult.userId;

    const [completedBooks, reviews, comments, followers, streak] = await Promise.all([
      prisma.userBook.count({ where: { userId: targetUserId, status: 'completed' } }),
      prisma.review.count({ where: { userId: targetUserId } }),
      prisma.reviewComment.count({ where: { userId: targetUserId } }),
      prisma.follow.count({ where: { followingId: targetUserId } }),
      prisma.readingStreak.findUnique({ where: { userId: targetUserId } }),
    ]);

    return {
      success: true,
      data: {
        completedBooks,
        reviews,
        comments,
        followers,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
      },
    };
  });
}

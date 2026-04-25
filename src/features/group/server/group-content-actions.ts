'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/config';

/**
 * Check if user is a member of the group
 */
async function checkGroupMembership(
  userId: string,
  groupId: string
): Promise<boolean> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  return !!membership;
}

/**
 * Share review with group
 */
export async function shareReviewWithGroup(reviewId: string, groupId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Check if user is a member
  const isMember = await checkGroupMembership(session.user.id, groupId);

  if (!isMember) {
    throw new Error('Not a member of this group');
  }

  // Check if review belongs to user
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  });

  if (!review || review.userId !== session.user.id) {
    throw new Error('Review not found or unauthorized');
  }

  // Create activity for group
  await prisma.activity.create({
    data: {
      userId: session.user.id,
      type: 'group_review_shared',
      resourceId: reviewId,
      metadata: JSON.stringify({ groupId }),
    },
  });

  return { success: true };
}

/**
 * Get group reviews (reviews shared with the group)
 */
export async function getGroupReviews(groupId: string, limit: number = 20) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Check if user is a member
  const isMember = await checkGroupMembership(session.user.id, groupId);

  if (!isMember) {
    throw new Error('Not a member of this group');
  }

  // Get activities where reviews were shared with this group
  const activities = await prisma.activity.findMany({
    where: {
      type: 'group_review_shared',
      metadata: {
        contains: groupId,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const reviewIds = activities
    .map((a) => a.resourceId)
    .filter((id): id is string => id !== null);

  if (reviewIds.length === 0) {
    return [];
  }

  const reviews = await prisma.review.findMany({
    where: {
      id: { in: reviewIds },
      visibility: 'public',
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
          comments: true,
          reactions: true,
        },
      },
    },
  });

  return reviews;
}

/**
 * Share reading progress with group
 */
export async function shareReadingWithGroup(
  userBookId: string,
  groupId: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Check if user is a member
  const isMember = await checkGroupMembership(session.user.id, groupId);

  if (!isMember) {
    throw new Error('Not a member of this group');
  }

  // Check if userBook belongs to user
  const userBook = await prisma.userBook.findUnique({
    where: { id: userBookId },
    select: { userId: true, bookId: true, status: true },
  });

  if (!userBook || userBook.userId !== session.user.id) {
    throw new Error('Reading record not found or unauthorized');
  }

  // Create activity for group
  await prisma.activity.create({
    data: {
      userId: session.user.id,
      type: 'group_reading_shared',
      resourceId: userBookId,
      metadata: JSON.stringify({
        groupId,
        bookId: userBook.bookId,
        status: userBook.status,
      }),
    },
  });

  return { success: true };
}

/**
 * Get group reading activities
 */
export async function getGroupReadingActivities(
  groupId: string,
  limit: number = 20
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Check if user is a member
  const isMember = await checkGroupMembership(session.user.id, groupId);

  if (!isMember) {
    throw new Error('Not a member of this group');
  }

  // Get group members
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  const memberIds = members.map((m) => m.userId);

  // Get reading activities from group members
  const activities = await prisma.activity.findMany({
    where: {
      userId: { in: memberIds },
      type: {
        in: ['reading_started', 'reading_completed', 'group_reading_shared'],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Enrich with user and book data
  const userIds = [...new Set(activities.map((a) => a.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return activities.map((activity) => {
    const user = userMap.get(activity.userId);
    const metadata = activity.metadata
      ? JSON.parse(activity.metadata)
      : null;

    return {
      id: activity.id,
      type: activity.type,
      userId: activity.userId,
      userName: user?.name || 'Unknown User',
      userImage: user?.image || null,
      resourceId: activity.resourceId,
      metadata,
      createdAt: activity.createdAt,
    };
  });
}

/**
 * Get group statistics
 */
export async function getGroupStatistics(groupId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Check if user is a member
  const isMember = await checkGroupMembership(session.user.id, groupId);

  if (!isMember) {
    throw new Error('Not a member of this group');
  }

  // Get group members
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  const memberIds = members.map((m) => m.userId);

  // Get total books read by group members
  const totalBooksRead = await prisma.userBook.count({
    where: {
      userId: { in: memberIds },
      status: 'completed',
    },
  });

  // Get total reviews by group members
  const totalReviews = await prisma.review.count({
    where: {
      userId: { in: memberIds },
    },
  });

  // Get most read books in the group
  const bookCounts = await prisma.userBook.groupBy({
    by: ['bookId'],
    where: {
      userId: { in: memberIds },
      status: 'completed',
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 5,
  });

  const bookIds = bookCounts.map((bc) => bc.bookId);
  const books = await prisma.book.findMany({
    where: { id: { in: bookIds } },
    select: {
      id: true,
      title: true,
      author: true,
      coverImage: true,
    },
  });

  const bookMap = new Map(books.map((b) => [b.id, b]));

  const popularBooks = bookCounts.map((bc) => ({
    book: bookMap.get(bc.bookId),
    readCount: bc._count.id,
  }));

  return {
    memberCount: members.length,
    totalBooksRead,
    totalReviews,
    popularBooks,
  };
}

'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/config';

export interface NotificationWithActor {
  id: string;
  type: string;
  read: boolean;
  resourceId: string | null;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

/**
 * Get user's notifications
 */
export async function getNotifications(limit: number = 20, cursor?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, -1) : notifications;

  return {
    notifications: items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const count = await prisma.notification.count({
    where: {
      recipientId: session.user.id,
      read: false,
    },
  });

  return count;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.recipientId !== session.user.id) {
    throw new Error('Notification not found or unauthorized');
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return await prisma.notification.updateMany({
    where: {
      recipientId: session.user.id,
      read: false,
    },
    data: { read: true },
  });
}

/**
 * Create a notification
 */
export async function createNotification(
  type: string,
  recipientId: string,
  actorId: string,
  resourceId?: string
) {
  // Don't create notification if actor is the same as recipient
  if (actorId === recipientId) {
    return null;
  }

  // Check if user wants to receive this type of notification
  const { shouldSendNotification } = await import(
    '@/features/settings/server/notification-settings-actions'
  );

  const shouldSend = await shouldSendNotification(recipientId, type);

  if (!shouldSend) {
    return null;
  }

  return await prisma.notification.create({
    data: {
      type,
      recipientId,
      actorId,
      resourceId,
    },
  });
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.recipientId !== session.user.id) {
    throw new Error('Notification not found or unauthorized');
  }

  return await prisma.notification.delete({
    where: { id: notificationId },
  });
}

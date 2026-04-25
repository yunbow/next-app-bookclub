'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/config';
import { z } from 'zod';

export interface NotificationSettings {
  follow: boolean;
  reviewComment: boolean;
  reviewReaction: boolean;
  eventInvite: boolean;
  levelUp: boolean;
  email: {
    enabled: boolean;
    follow: boolean;
    reviewComment: boolean;
    eventInvite: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  follow: true,
  reviewComment: true,
  reviewReaction: true,
  eventInvite: true,
  levelUp: true,
  email: {
    enabled: false,
    follow: false,
    reviewComment: false,
    eventInvite: false,
  },
};

const notificationSettingsSchema = z.object({
  follow: z.boolean(),
  reviewComment: z.boolean(),
  reviewReaction: z.boolean(),
  eventInvite: z.boolean(),
  levelUp: z.boolean(),
  email: z.object({
    enabled: z.boolean(),
    follow: z.boolean(),
    reviewComment: z.boolean(),
    eventInvite: z.boolean(),
  }),
});

/**
 * Get user's notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notificationSettings: true },
  });

  if (!user || !user.notificationSettings) {
    return defaultSettings;
  }

  try {
    const settings = JSON.parse(user.notificationSettings);
    return { ...defaultSettings, ...settings };
  } catch {
    return defaultSettings;
  }
}

/**
 * Update user's notification settings
 */
export async function updateNotificationSettings(
  settings: NotificationSettings
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const validated = notificationSettingsSchema.parse(settings);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      notificationSettings: JSON.stringify(validated),
    },
  });

  return validated;
}

/**
 * Check if notification should be sent based on user settings
 */
export async function shouldSendNotification(
  userId: string,
  notificationType: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationSettings: true },
  });

  if (!user || !user.notificationSettings) {
    return true; // Default to sending notifications
  }

  try {
    const settings: NotificationSettings = JSON.parse(
      user.notificationSettings
    );

    switch (notificationType) {
      case 'follow':
        return settings.follow;
      case 'review_comment':
        return settings.reviewComment;
      case 'review_reaction':
        return settings.reviewReaction;
      case 'event_invite':
        return settings.eventInvite;
      case 'level_up':
        return settings.levelUp;
      default:
        return true;
    }
  } catch {
    return true;
  }
}

/**
 * Check if email notification should be sent
 */
export async function shouldSendEmailNotification(
  userId: string,
  notificationType: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationSettings: true },
  });

  if (!user || !user.notificationSettings) {
    return false; // Default to not sending email
  }

  try {
    const settings: NotificationSettings = JSON.parse(
      user.notificationSettings
    );

    if (!settings.email.enabled) {
      return false;
    }

    switch (notificationType) {
      case 'follow':
        return settings.email.follow;
      case 'review_comment':
        return settings.email.reviewComment;
      case 'event_invite':
        return settings.email.eventInvite;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

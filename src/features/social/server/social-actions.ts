"use server";

import { prisma } from "@/lib/prisma";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import { z } from "zod";

const userIdSchema = z.string().min(1, "ユーザーIDは必須です");

/**
 * Follow a user
 */
export async function followUserAction(
  userId: string
): Promise<ActionResult<{ following: boolean }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = userIdSchema.safeParse(userId);
    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } };
    }

    if (authResult.userId === userId) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: "自分自身をフォローできません" } };
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: authResult.userId,
          followingId: userId,
        },
      },
    });

    if (existing) {
      return { success: false, error: { code: "ALREADY_EXISTS", message: "既にフォローしています" } };
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: authResult.userId,
        followingId: userId,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: "follow",
        recipientId: userId,
        actorId: authResult.userId,
      },
    });

    // Award XP for following
    const { awardFollowXP } = await import("@/features/gamification/server/xp-actions");
    await awardFollowXP(authResult.userId);

    logger.info(
      {
        userId: authResult.userId,
        targetUserId: userId,
      },
      "User followed"
    );

    revalidatePath(`/profile/${userId}`);
    return { success: true, data: { following: true } };
  });
}

/**
 * Unfollow a user
 */
export async function unfollowUserAction(
  userId: string
): Promise<ActionResult<{ following: boolean }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = userIdSchema.safeParse(userId);
    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } };
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: authResult.userId,
          followingId: userId,
        },
      },
    });

    logger.info(
      {
        userId: authResult.userId,
        targetUserId: userId,
      },
      "User unfollowed"
    );

    revalidatePath(`/profile/${userId}`);
    return { success: true, data: { following: false } };
  });
}

/**
 * Block a user
 */
export async function blockUserAction(
  userId: string
): Promise<ActionResult<{ blocked: boolean }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = userIdSchema.safeParse(userId);
    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } };
    }

    if (authResult.userId === userId) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: "自分自身をブロックできません" } };
    }

    // Check if already blocked
    const existing = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: authResult.userId,
          blockedId: userId,
        },
      },
    });

    if (existing) {
      return { success: false, error: { code: "ALREADY_EXISTS", message: "既にブロックしています" } };
    }

    // Remove follow relationships if they exist
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: authResult.userId, followingId: userId },
          { followerId: userId, followingId: authResult.userId },
        ],
      },
    });

    // Create block
    await prisma.block.create({
      data: {
        blockerId: authResult.userId,
        blockedId: userId,
      },
    });

    logger.info(
      {
        userId: authResult.userId,
        targetUserId: userId,
      },
      "User blocked"
    );

    revalidatePath(`/profile/${userId}`);
    return { success: true, data: { blocked: true } };
  });
}

/**
 * Unblock a user
 */
export async function unblockUserAction(
  userId: string
): Promise<ActionResult<{ blocked: boolean }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = userIdSchema.safeParse(userId);
    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } };
    }

    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId: authResult.userId,
          blockedId: userId,
        },
      },
    });

    logger.info(
      {
        userId: authResult.userId,
        targetUserId: userId,
      },
      "User unblocked"
    );

    revalidatePath(`/profile/${userId}`);
    return { success: true, data: { blocked: false } };
  });
}

/**
 * Get user's followers
 */
export async function getUserFollowers(
  userId: string,
  limit: number = 20
): Promise<ActionResult<Array<{ id: string; name: string | null; image: string | null; bio: string | null }>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = userIdSchema.safeParse(userId);
    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } };
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { success: true, data: followers.map((f) => f.follower) };
  });
}

/**
 * Get user's following
 */
export async function getUserFollowing(
  userId: string,
  limit: number = 20
): Promise<ActionResult<Array<{ id: string; name: string | null; image: string | null; bio: string | null }>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const parsed = userIdSchema.safeParse(userId);
    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } };
    }

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { success: true, data: following.map((f) => f.following) };
  });
}

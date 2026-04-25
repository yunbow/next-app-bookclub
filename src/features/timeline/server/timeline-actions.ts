"use server";

import { prisma } from "@/lib/prisma";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import type { ActionResult } from "@/lib/types/action-result";
import { z } from "zod";

export interface TimelineActivity {
  id: string;
  type: string;
  userId: string;
  userName: string;
  userImage: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

interface TimelineResult {
  activities: TimelineActivity[];
  nextCursor: string | null;
}

const timelineFilterSchema = z.object({
  filter: z.enum(["all", "reviews", "reading", "events"]),
});

/**
 * Get timeline activities from followed users
 * Optimized to avoid N+1 queries using include
 */
export async function getTimelineActivities(
  limit: number = 20,
  cursor?: string
): Promise<ActionResult<TimelineResult>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const userId = authResult.userId;

    // Get list of followed user IDs
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
      take: 1000,
    });

    const followedUserIds = follows.map((f) => f.followingId);
    followedUserIds.push(userId); // Include own activities

    const activities = await prisma.activity.findMany({
      where: {
        userId: { in: followedUserIds },
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
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = activities.length > limit;
    const items = hasMore ? activities.slice(0, -1) : activities;

    const enrichedActivities: TimelineActivity[] = items.map((activity) => ({
      id: activity.id,
      type: activity.type,
      userId: activity.userId,
      userName: activity.user?.name || "Unknown User",
      userImage: activity.user?.image || null,
      resourceId: activity.resourceId,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
      createdAt: activity.createdAt,
    }));

    return {
      success: true,
      data: {
        activities: enrichedActivities,
        nextCursor: hasMore ? items[items.length - 1].id : null,
      },
    };
  });
}

/**
 * Create activity entry (internal helper - not exported)
 */
async function createActivity(
  type: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
): Promise<ActionResult<Record<string, unknown>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const activity = await prisma.activity.create({
      data: {
        userId: authResult.userId,
        type,
        resourceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return { success: true, data: activity };
  });
}

/**
 * Get filtered timeline activities
 * Optimized to avoid N+1 queries using include
 */
export async function getFilteredTimelineActivities(
  data: unknown,
  limit: number = 20,
  cursor?: string
): Promise<ActionResult<TimelineResult>> {
  return withAction(async ({ validData }) => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const { filter } = validData!;
    const userId = authResult.userId;

    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
      take: 1000,
    });

    const followedUserIds = follows.map((f) => f.followingId);
    followedUserIds.push(userId);

    const typeFilters: Record<string, string[]> = {
      all: [],
      reviews: ["review_posted"],
      reading: ["reading_started", "reading_completed"],
      events: ["event_joined", "event_created"],
    };

    const whereClause: { userId: { in: string[] }; type?: { in: string[] } } = {
      userId: { in: followedUserIds },
    };

    if (filter !== "all" && typeFilters[filter]) {
      whereClause.type = { in: typeFilters[filter] };
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = activities.length > limit;
    const items = hasMore ? activities.slice(0, -1) : activities;

    const enrichedActivities: TimelineActivity[] = items.map((activity) => ({
      id: activity.id,
      type: activity.type,
      userId: activity.userId,
      userName: activity.user?.name || "Unknown User",
      userImage: activity.user?.image || null,
      resourceId: activity.resourceId,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
      createdAt: activity.createdAt,
    }));

    return {
      success: true,
      data: {
        activities: enrichedActivities,
        nextCursor: hasMore ? items[items.length - 1].id : null,
      },
    };
  }, { data, schema: timelineFilterSchema });
}

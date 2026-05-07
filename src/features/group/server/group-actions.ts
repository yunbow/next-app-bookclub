'use server';

import { prisma } from '@/lib/prisma';
import { withAction, requireAuth } from '@/lib/actions/action-helpers';
import type { ActionResult } from '@/lib/types/action-result';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { getUserPlan, hasMinPlan, PLAN_LIMITS } from '@/lib/subscription';

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  targetDate: z.string().optional(),
});

const searchGroupSchema = z.object({
  q: z.string().min(1).max(200),
});

/**
 * Create a new group (Basic+)
 */
export async function createGroup(data: unknown): Promise<ActionResult<Record<string, unknown>>> {
  return withAction(async ({ validData }) => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const plan = await getUserPlan(authResult.userId);
    if (!hasMinPlan(plan, "basic")) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "グループ作成はBasic以上のプランが必要です" },
      };
    }

    const group = await prisma.group.create({
      data: {
        name: validData!.name,
        description: validData!.description,
        isPrivate: validData!.isPrivate,
        creatorId: authResult.userId,
        members: {
          create: {
            userId: authResult.userId,
            role: 'admin',
          },
        },
      },
    });

    return { success: true, data: group };
  }, { data, schema: createGroupSchema });
}

/**
 * Get user's groups
 */
export async function getUserGroups(): Promise<ActionResult<Array<Record<string, unknown>>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const memberships = await prisma.groupMember.findMany({
      where: { userId: authResult.userId },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true, books: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: 100,
    });

    return { success: true, data: mapMemberships(memberships) };
  });
}

function mapMemberships(memberships: Array<Record<string, unknown>>) {
  return (memberships as Array<{ role: string; group: { _count: { members: number; books: number } } & Record<string, unknown> }>).map((m) => ({
    ...m.group,
    role: m.role,
    memberCount: m.group._count.members,
    bookCount: m.group._count.books,
  }));
}

/**
 * Get group details
 */
export async function getGroupDetails(groupId: string): Promise<ActionResult<Record<string, unknown>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: authResult.userId,
        },
      },
    });

    if (!membership) {
      logger.error({
        type: 'authorization_failure',
        severity: 'high',
        userId: authResult.userId,
        resourceId: groupId,
      }, 'Unauthorized group access attempt');
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this group' },
      };
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          take: 200,
          include: {
            group: false,
          },
        },
        goals: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
        books: {
          take: 100,
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!group) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Group not found' },
      };
    }

    return {
      success: true,
      data: {
        ...group,
        userRole: membership.role,
      },
    };
  });
}

/**
 * Join a group (Free: max 3, Basic+: unlimited)
 */
export async function joinGroup(groupId: string): Promise<ActionResult<Record<string, unknown>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const plan = await getUserPlan(authResult.userId);
    const limit = PLAN_LIMITS.groups[plan];

    if (limit !== Infinity) {
      const currentCount = await prisma.groupMember.count({
        where: { userId: authResult.userId },
      });
      if (currentCount >= limit) {
        return {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: `グループ参加はフリープランでは${limit}件までです。Basicプランにアップグレードすると無制限になります`,
          },
        };
      }
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Group not found' },
      };
    }

    if (group.isPrivate) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Cannot join private group without invitation' },
      };
    }

    const membership = await prisma.groupMember.create({
      data: {
        groupId,
        userId: authResult.userId,
        role: 'member',
      },
    });

    return { success: true, data: membership };
  });
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: string): Promise<ActionResult<{ success: boolean }>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: authResult.userId,
        },
      },
    });

    if (!membership) {
      logger.error({
        type: 'authorization_failure',
        severity: 'high',
        userId: authResult.userId,
        resourceId: groupId,
      }, 'Unauthorized group access attempt');
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this group' },
      };
    }

    if (membership.role === 'admin') {
      const adminCount = await prisma.groupMember.count({
        where: { groupId, role: 'admin' },
      });

      if (adminCount === 1) {
        return {
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Cannot leave group as the only admin' },
        };
      }
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: authResult.userId,
        },
      },
    });

    return { success: true, data: { success: true } };
  });
}

/**
 * Create a group goal
 */
export async function createGroupGoal(
  groupId: string,
  data: unknown
): Promise<ActionResult<Record<string, unknown>>> {
  return withAction(async ({ validData }) => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: authResult.userId,
        },
      },
    });

    if (!membership || membership.role !== 'admin') {
      logger.error({
        type: 'authorization_failure',
        severity: 'high',
        userId: authResult.userId,
        resourceId: groupId,
      }, 'Unauthorized group access attempt');
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can create goals' },
      };
    }

    const goal = await prisma.groupGoal.create({
      data: {
        groupId,
        title: validData!.title,
        description: validData!.description,
        targetDate: validData!.targetDate
          ? new Date(validData!.targetDate)
          : undefined,
      },
    });

    return { success: true, data: goal };
  }, { data, schema: createGoalSchema });
}

/**
 * Add book to group
 */
export async function addBookToGroup(
  groupId: string,
  bookId: string,
  type: 'recommended' | 'required' = 'recommended'
): Promise<ActionResult<Record<string, unknown>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: authResult.userId,
        },
      },
    });

    if (!membership) {
      logger.error({
        type: 'authorization_failure',
        severity: 'high',
        userId: authResult.userId,
        resourceId: groupId,
      }, 'Unauthorized group access attempt');
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this group' },
      };
    }

    const groupBook = await prisma.groupBook.create({
      data: {
        groupId,
        bookId,
        type,
      },
    });

    return { success: true, data: groupBook };
  });
}

/**
 * Search public groups
 */
export async function searchPublicGroups(data: unknown): Promise<ActionResult<Array<Record<string, unknown>>>> {
  return withAction(async ({ validData }) => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const groups = await prisma.group.findMany({
      where: {
        isPrivate: false,
        OR: [
          { name: { contains: validData!.q } },
          { description: { contains: validData!.q } },
        ],
      },
      include: {
        _count: {
          select: { members: true, books: true },
        },
      },
      take: 20,
    });

    return { success: true, data: mapGroups(groups) };
  }, { data, schema: searchGroupSchema });
}

function mapGroups(groups: Array<{ _count: { members: number; books: number } } & Record<string, unknown>>) {
  return groups.map((g) => ({
    ...g,
    memberCount: g._count.members,
    bookCount: g._count.books,
  }));
}

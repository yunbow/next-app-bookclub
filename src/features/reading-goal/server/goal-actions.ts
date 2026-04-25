"use server";

import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { prisma } from "@/lib/prisma";
import { createGoalSchema, updateGoalSchema } from "../schema/goal-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createGoalAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      // 同じタイプ・期間の目標が既に存在するかチェック
      const existing = await prisma.readingGoal.findFirst({
        where: {
          userId: authResult.userId,
          type: validData!.type,
          year: validData!.year,
          month: validData!.month || null,
        },
      });

      if (existing) {
        return { success: false, error: { code: "ALREADY_EXISTS", message: "同じ期間の目標が既に存在します" } };
      }

      const goal = await prisma.readingGoal.create({
        data: {
          userId: authResult.userId,
          ...validData!,
        },
      });

      logger.info({ userId: authResult.userId, goalId: goal.id }, "Reading goal created");
      revalidatePath("/dashboard");
      return { success: true, data: { id: goal.id } };
    },
    { data, schema: createGoalSchema }
  );
}

export async function updateGoalAction(
  goalId: string,
  data: unknown
): Promise<ActionResult<void>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const goal = await prisma.readingGoal.findUnique({
        where: { id: goalId },
      });

      if (!goal) {
        return { success: false, error: { code: "NOT_FOUND", message: "目標が見つかりません" } };
      }

      if (goal.userId !== authResult.userId) {
        logger.error(
          {
            type: "authorization_failure",
            severity: "high",
            userId: authResult.userId,
            ownerId: goal.userId,
            resourceId: goalId,
          },
          "Unauthorized goal update attempt"
        );
        return { success: false, error: { code: "FORBIDDEN", message: "権限がありません" } };
      }

      await prisma.readingGoal.update({
        where: { id: goalId },
        data: validData!,
      });

      logger.info({ userId: authResult.userId, goalId }, "Reading goal updated");
      revalidatePath("/dashboard");
      return { success: true, data: undefined };
    },
    { data, schema: updateGoalSchema }
  );
}

export async function deleteGoalAction(goalId: string): Promise<ActionResult<void>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const goal = await prisma.readingGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return { success: false, error: { code: "NOT_FOUND", message: "目標が見つかりません" } };
    }

    if (goal.userId !== authResult.userId) {
      logger.error(
        {
          type: "authorization_failure",
          severity: "high",
          userId: authResult.userId,
          ownerId: goal.userId,
          resourceId: goalId,
        },
        "Unauthorized goal deletion attempt"
      );
      return { success: false, error: { code: "FORBIDDEN", message: "権限がありません" } };
    }

    await prisma.readingGoal.delete({
      where: { id: goalId },
    });

    logger.info({ userId: authResult.userId, goalId }, "Reading goal deleted");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  });
}

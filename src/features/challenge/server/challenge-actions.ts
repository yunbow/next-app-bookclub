"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import type { ActionResult } from "@/lib/types/action-result";
import {
  ActionResult as ErrorActionResult,
  success,
  errorToActionResult,
} from "@/lib/errors";
import * as challengeService from "@/features/challenge/services/challenge-service";
import type { LeaderboardEntry } from "@/features/challenge/services/challenge-service";

const createChallengeSchema = z.object({
  type: z.enum(["monthly_books", "yearly_books", "genre_diversity", "reading_streak"]),
  title: z.string().min(1),
  description: z.string().optional(),
  target: z.number().min(1),
  startDate: z.string(),
  endDate: z.string(),
});

const challengeIdSchema = z.string().min(1);

/**
 * Create a new challenge
 */
export async function createChallenge(
  data: unknown
): Promise<ActionResult<Awaited<ReturnType<typeof prisma.challenge.create>>>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const challenge = await challengeService.createChallenge(validData!);
      return { success: true, data: challenge };
    },
    { data, schema: createChallengeSchema }
  );
}

/**
 * Get active challenges
 */
export async function getActiveChallenges(): Promise<
  ActionResult<Awaited<ReturnType<typeof challengeService.getActiveChallenges>>>
> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const challenges = await challengeService.getActiveChallenges();
    return { success: true, data: challenges };
  });
}

/**
 * Join a challenge
 */
export async function joinChallenge(
  challengeId: string
): Promise<ActionResult<Awaited<ReturnType<typeof prisma.challengeParticipant.create>>>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      try {
        const participant = await challengeService.joinChallenge(
          validData!,
          authResult.userId
        );
        return { success: true, data: participant };
      } catch (error) {
        const result = errorToActionResult(error);
        return {
          success: false,
          error: {
            code: result.error!.code,
            message: result.error!.message,
          },
        };
      }
    },
    { data: challengeId, schema: challengeIdSchema }
  );
}

/**
 * Leave a challenge
 */
export async function leaveChallenge(challengeId: string): Promise<ActionResult<void>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      await challengeService.leaveChallenge(validData!, authResult.userId);
      return { success: true, data: undefined as void };
    },
    { data: challengeId, schema: challengeIdSchema }
  );
}

/**
 * Get user's challenges
 */
export async function getUserChallenges(): Promise<
  ActionResult<Awaited<ReturnType<typeof challengeService.getUserChallenges>>>
> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const participants = await challengeService.getUserChallenges(authResult.userId);
    return { success: true, data: participants };
  });
}

/**
 * Update challenge progress
 * Internal helper - not exported as it accepts arbitrary userId
 */
async function updateChallengeProgress(
  challengeId: string,
  userId: string
): Promise<ErrorActionResult<unknown>> {
  const requestId = `challenge-progress-${Date.now()}`;

  try {
    const result = await challengeService.updateChallengeProgress(challengeId, userId);
    return success(result);
  } catch (error) {
    logger.error(
      {
        action: "update_challenge_progress",
        challengeId,
        userId,
        requestId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Failed to update challenge progress"
    );

    return errorToActionResult(error, requestId);
  }
}

/**
 * Get challenge leaderboard
 */
export async function getChallengeLeaderboard(
  challengeId: string,
  limit: number = 10
): Promise<ActionResult<LeaderboardEntry[]>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const data = await challengeService.getChallengeLeaderboard(challengeId, limit);
    return { success: true, data };
  });
}

/**
 * Create default monthly challenge
 */
export async function createMonthlyChallenge(): Promise<
  ActionResult<Awaited<ReturnType<typeof prisma.challenge.create>>>
> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    // TODO: Add proper admin role check when role system is implemented

    const challenge = await challengeService.createDefaultMonthlyChallenge();
    return { success: true, data: challenge };
  });
}

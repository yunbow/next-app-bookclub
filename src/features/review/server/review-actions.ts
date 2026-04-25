"use server";

import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { prisma } from "@/lib/prisma";
import { createReviewSchema, updateReviewSchema, createReviewCommentSchema, createReviewReactionSchema, type CreateReviewReactionInput } from "../schema/review-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createReviewAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;
      const { userId } = authResult;

      const review = await prisma.review.create({
        data: {
          ...validData!,
          userId,
        },
      });

      logger.info({
        userId,
        reviewId: review.id,
        bookId: validData!.bookId,
      }, "Review created successfully");

      revalidatePath("/reviews");
      revalidatePath(`/books/${validData!.bookId}`);
      return { success: true, data: { id: review.id } };
    },
    { data, schema: createReviewSchema }
  );
}

export async function updateReviewAction(
  id: string,
  data: unknown
): Promise<ActionResult<void>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;
      const { userId } = authResult;

      const review = await prisma.review.findUnique({
        where: { id },
        select: { userId: true, bookId: true },
      });

      if (!review) {
        return { success: false, error: { code: "NOT_FOUND", message: "レビューが見つかりません" } };
      }

      if (review.userId !== userId) {
        logger.error({
          type: "authorization_failure",
          userId,
          reviewId: id,
          ownerId: review.userId,
          action: "update_review",
          reason: "not_owner",
          severity: "high",
        }, "Unauthorized review update attempt");
        return { success: false, error: { code: "FORBIDDEN", message: "権限がありません" } };
      }

      await prisma.review.update({
        where: { id },
        data: validData!,
      });

      logger.info({ userId, reviewId: id }, "Review updated");
      revalidatePath("/reviews");
      revalidatePath(`/reviews/${id}`);
      revalidatePath(`/books/${review.bookId}`);
      return { success: true, data: undefined };
    },
    { data, schema: updateReviewSchema }
  );
}

export async function deleteReviewAction(
  id: string
): Promise<ActionResult<void>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;
    const { userId } = authResult;

    const review = await prisma.review.findUnique({
      where: { id },
      select: { userId: true, bookId: true },
    });

    if (!review) {
      return { success: false, error: { code: "NOT_FOUND", message: "レビューが見つかりません" } };
    }

    if (review.userId !== userId) {
      logger.error({
        type: "authorization_failure",
        userId,
        reviewId: id,
        ownerId: review.userId,
        action: "delete_review",
        reason: "not_owner",
        severity: "high",
      }, "Unauthorized review deletion attempt");
      return { success: false, error: { code: "FORBIDDEN", message: "権限がありません" } };
    }

    await prisma.review.delete({
      where: { id },
    });

    logger.info({ userId, reviewId: id }, "Review deleted");
    revalidatePath("/reviews");
    revalidatePath(`/books/${review.bookId}`);
    return { success: true, data: undefined };
  });
}

export async function createReviewCommentAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;
      const { userId } = authResult;

      const comment = await prisma.reviewComment.create({
        data: {
          ...validData!,
          userId,
        },
      });

      // Create notification
      const review = await prisma.review.findUnique({
        where: { id: validData!.reviewId },
        select: { userId: true },
      });

      if (review && review.userId !== userId) {
        await prisma.notification.create({
          data: {
            type: "review_comment",
            recipientId: review.userId,
            actorId: userId,
            resourceId: validData!.reviewId,
          },
        });
      }

      logger.info({
        userId,
        commentId: comment.id,
        reviewId: validData!.reviewId,
      }, "Review comment created");

      revalidatePath(`/reviews/${validData!.reviewId}`);
      return { success: true, data: { id: comment.id } };
    },
    { data, schema: createReviewCommentSchema }
  );
}

export async function toggleReviewReactionAction(
  data: unknown
): Promise<ActionResult<{ isReacted: boolean }>> {
  return withAction<{ isReacted: boolean }, CreateReviewReactionInput>(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;
      const { userId } = authResult;

      const existingReaction = await prisma.reviewReaction.findFirst({
        where: {
          userId,
          reviewId: validData!.reviewId,
          type: validData!.type,
        },
      });

      if (existingReaction) {
        await prisma.reviewReaction.delete({
          where: { id: existingReaction.id },
        });

        logger.info({
          userId,
          reviewId: validData!.reviewId,
          type: validData!.type,
          action: "remove_reaction",
        }, "Review reaction removed");

        revalidatePath(`/reviews/${validData!.reviewId}`);
        return { success: true, data: { isReacted: false } };
      } else {
        await prisma.reviewReaction.create({
          data: {
            userId,
            reviewId: validData!.reviewId,
            type: validData!.type,
          },
        });

        // Create notification
        const review = await prisma.review.findUnique({
          where: { id: validData!.reviewId },
          select: { userId: true },
        });

        if (review && review.userId !== userId) {
          await prisma.notification.create({
            data: {
              type: "review_reaction",
              recipientId: review.userId,
              actorId: userId,
              resourceId: validData!.reviewId,
            },
          });
        }

        logger.info({
          userId,
          reviewId: validData!.reviewId,
          type: validData!.type,
          action: "add_reaction",
        }, "Review reaction added");

        revalidatePath(`/reviews/${validData!.reviewId}`);
        return { success: true, data: { isReacted: true } };
      }
    },
    { data, schema: createReviewReactionSchema }
  );
}

"use server";

import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { prisma } from "@/lib/prisma";
import { createHighlightSchema, updateHighlightSchema } from "../schema/highlight-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createHighlightAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const highlight = await prisma.highlight.create({
        data: {
          userId: authResult.userId,
          ...validData!,
        },
      });

      logger.info({ userId: authResult.userId, highlightId: highlight.id }, "Highlight created");
      revalidatePath(`/books/${validData!.bookId}`);
      return { success: true, data: { id: highlight.id } };
    },
    { data, schema: createHighlightSchema }
  );
}

export async function updateHighlightAction(
  highlightId: string,
  data: unknown
): Promise<ActionResult<void>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const highlight = await prisma.highlight.findUnique({
        where: { id: highlightId },
      });

      if (!highlight) {
        return { success: false, error: { code: "NOT_FOUND", message: "ハイライトが見つかりません" } };
      }

      if (highlight.userId !== authResult.userId) {
        logger.error(
          {
            type: "authorization_failure",
            severity: "high",
            userId: authResult.userId,
            ownerId: highlight.userId,
            resourceId: highlightId,
          },
          "Unauthorized highlight update attempt"
        );
        return { success: false, error: { code: "FORBIDDEN", message: "権限がありません" } };
      }

      await prisma.highlight.update({
        where: { id: highlightId },
        data: validData!,
      });

      logger.info({ userId: authResult.userId, highlightId }, "Highlight updated");
      revalidatePath(`/books/${highlight.bookId}`);
      return { success: true, data: undefined };
    },
    { data, schema: updateHighlightSchema }
  );
}

export async function deleteHighlightAction(highlightId: string): Promise<ActionResult<void>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const highlight = await prisma.highlight.findUnique({
      where: { id: highlightId },
    });

    if (!highlight) {
      return { success: false, error: { code: "NOT_FOUND", message: "ハイライトが見つかりません" } };
    }

    if (highlight.userId !== authResult.userId) {
      logger.error(
        {
          type: "authorization_failure",
          severity: "high",
          userId: authResult.userId,
          ownerId: highlight.userId,
          resourceId: highlightId,
        },
        "Unauthorized highlight deletion attempt"
      );
      return { success: false, error: { code: "FORBIDDEN", message: "権限がありません" } };
    }

    await prisma.highlight.delete({
      where: { id: highlightId },
    });

    logger.info({ userId: authResult.userId, highlightId }, "Highlight deleted");
    revalidatePath(`/books/${highlight.bookId}`);
    return { success: true, data: undefined };
  });
}

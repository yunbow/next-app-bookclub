"use server";

import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { prisma } from "@/lib/prisma";
import { updateProgressSchema } from "../schema/progress-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function updateProgressAction(
  data: unknown
): Promise<ActionResult<void>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const userBook = await prisma.userBook.findFirst({
        where: {
          userId: authResult.userId,
          bookId: validData!.bookId,
        },
        include: {
          book: true,
        },
      });

      if (!userBook) {
        return { success: false, error: { code: "NOT_FOUND", message: "読書記録が見つかりません" } };
      }

      // 進捗を更新
      await prisma.userBook.update({
        where: { id: userBook.id },
        data: {
          currentPage: validData!.currentPage,
        },
      });

      // 読了チェック
      if (userBook.book.pages && validData!.currentPage >= userBook.book.pages) {
        if (userBook.status !== "completed") {
          await prisma.userBook.update({
            where: { id: userBook.id },
            data: {
              status: "completed",
              endDate: new Date(),
            },
          });
        }
      }

      logger.info(
        { userId: authResult.userId, bookId: validData!.bookId, currentPage: validData!.currentPage },
        "Reading progress updated"
      );
      revalidatePath(`/books/${validData!.bookId}`);
      return { success: true, data: undefined };
    },
    { data, schema: updateProgressSchema }
  );
}

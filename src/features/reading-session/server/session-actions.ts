"use server";

import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { prisma } from "@/lib/prisma";
import { startSessionSchema, endSessionSchema } from "../schema/session-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function startSessionAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;
      const { userId } = authResult;

      // UserBookを取得または作成
      let userBook = await prisma.userBook.findFirst({
        where: {
          userId,
          bookId: validData!.bookId,
        },
      });

      if (!userBook) {
        userBook = await prisma.userBook.create({
          data: {
            userId,
            bookId: validData!.bookId,
            status: "reading",
            startDate: new Date(),
          },
        });
      }

      // 既に進行中のセッションがあるかチェック
      const activeSession = await prisma.readingSession.findFirst({
        where: {
          userId,
          endTime: null,
        },
      });

      if (activeSession) {
        return { success: false, error: { code: "ALREADY_EXISTS", message: "既に進行中の読書セッションがあります" } };
      }

      const readingSession = await prisma.readingSession.create({
        data: {
          userBookId: userBook.id,
          userId,
          startTime: new Date(),
        },
      });

      logger.info({ userId, sessionId: readingSession.id }, "Reading session started");
      revalidatePath("/dashboard");
      return { success: true, data: { id: readingSession.id } };
    },
    { data, schema: startSessionSchema }
  );
}

export async function endSessionAction(
  data: unknown
): Promise<ActionResult<{ duration: number }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;
      const { userId } = authResult;

      const readingSession = await prisma.readingSession.findUnique({
        where: { id: validData!.sessionId },
      });

      if (!readingSession) {
        return { success: false, error: { code: "NOT_FOUND", message: "セッションが見つかりません" } };
      }

      if (readingSession.userId !== userId) {
        logger.error(
          {
            type: "authorization_failure",
            severity: "high",
            userId,
            ownerId: readingSession.userId,
            resourceId: validData!.sessionId,
          },
          "Unauthorized session end attempt"
        );
        return { success: false, error: { code: "FORBIDDEN", message: "権限がありません" } };
      }

      if (readingSession.endTime) {
        return { success: false, error: { code: "VALIDATION_ERROR", message: "このセッションは既に終了しています" } };
      }

      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - readingSession.startTime.getTime()) / 1000
      );

      await prisma.readingSession.update({
        where: { id: validData!.sessionId },
        data: {
          endTime,
          duration,
          pagesRead: validData!.pagesRead || 0,
        },
      });

      // UserBookの現在ページを更新
      if (validData!.pagesRead) {
        const userBook = await prisma.userBook.findUnique({
          where: { id: readingSession.userBookId },
        });

        if (userBook) {
          await prisma.userBook.update({
            where: { id: userBook.id },
            data: {
              currentPage: userBook.currentPage + validData!.pagesRead,
            },
          });
        }
      }

      logger.info(
        { userId, sessionId: validData!.sessionId, duration },
        "Reading session ended"
      );
      revalidatePath("/dashboard");
      return { success: true, data: { duration } };
    },
    { data, schema: endSessionSchema }
  );
}

export async function getActiveSessionAction(): Promise<
  ActionResult<{ id: string; startTime: Date; bookId: string } | null>
> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;
    const { userId } = authResult;

    const activeSession = await prisma.readingSession.findFirst({
      where: {
        userId,
        endTime: null,
      },
      include: {
        userBook: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!activeSession) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: activeSession.id,
        startTime: activeSession.startTime,
        bookId: activeSession.userBook.bookId,
      },
    };
  });
}

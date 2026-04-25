"use server";

import { prisma } from "@/lib/prisma";
import { CreateBookSchema, UpdateUserBookSchema } from "../schema/book-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { revalidatePath } from "next/cache";

export async function createBookAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      if (validData!.isbn) {
        const existingBook = await prisma.book.findUnique({
          where: { isbn: validData!.isbn },
        });

        if (existingBook) {
          return {
            success: false,
            error: { code: "ALREADY_EXISTS", message: "このISBNは既に登録されています" },
          };
        }
      }

      const book = await prisma.book.create({
        data: validData!,
      });

      logger.info({
        userId: authResult.userId,
        bookId: book.id,
      }, "Book created successfully");

      revalidatePath("/books");
      return { success: true, data: { id: book.id } };
    },
    {
      data,
      schema: CreateBookSchema,
    }
  );
}

export async function updateUserBookAction(
  bookId: string,
  data: unknown
): Promise<ActionResult<void>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      await prisma.userBook.upsert({
        where: {
          userId_bookId: {
            userId: authResult.userId,
            bookId,
          },
        },
        update: validData!,
        create: {
          userId: authResult.userId,
          bookId,
          ...validData!,
        },
      });

      logger.info({ userId: authResult.userId, bookId }, "UserBook updated");
      revalidatePath("/books");
      revalidatePath(`/books/${bookId}`);
      return { success: true, data: undefined };
    },
    {
      data,
      schema: UpdateUserBookSchema,
    }
  );
}

export async function deleteUserBookAction(
  bookId: string
): Promise<ActionResult<void>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const userBook = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId: authResult.userId,
          bookId,
        },
      },
    });

    if (!userBook) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "読書記録が見つかりません" },
      };
    }

    await prisma.userBook.delete({
      where: {
        userId_bookId: {
          userId: authResult.userId,
          bookId,
        },
      },
    });

    logger.info({ userId: authResult.userId, bookId }, "UserBook deleted");
    revalidatePath("/books");
    return { success: true, data: undefined };
  });
}

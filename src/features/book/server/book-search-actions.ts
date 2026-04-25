"use server";

import { prisma } from "@/lib/prisma";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import type { ActionResult } from "@/lib/types/action-result";
import { z } from "zod";

const bookSearchSchema = z.object({
  query: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  author: z.string().max(200).optional(),
  publisher: z.string().max(200).optional(),
  year: z.number().int().optional(),
  isbn: z.string().max(20).optional(),
  jan: z.string().max(20).optional(),
  category: z.string().max(100).optional(),
  exactMatch: z.boolean().optional(),
});

type BookSearchParams = z.infer<typeof bookSearchSchema>;

const userLibrarySearchSchema = bookSearchSchema.extend({
  status: z.string().max(50).optional(),
});

const readingHistorySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.string().max(50).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

/**
 * Advanced book search with multiple filters
 */
export async function searchBooks(
  data: unknown,
  limit: number = 20
): Promise<ActionResult<Array<Record<string, unknown>>>> {
  return withAction(async ({ validData }) => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const params = validData!;
    const where: Record<string, unknown> = {};

    if (params.exactMatch) {
      // Exact match search
      if (params.title) where.title = params.title;
      if (params.author) where.author = params.author;
      if (params.publisher) where.publisher = params.publisher;
      if (params.isbn) where.isbn = params.isbn;
      if (params.jan) where.jan = params.jan;
      if (params.category) where.category = params.category;
    } else {
      // Partial match search
      const conditions: Record<string, unknown>[] = [];

      if (params.query) {
        conditions.push(
          { title: { contains: params.query, mode: "insensitive" } },
          { author: { contains: params.query, mode: "insensitive" } },
          { publisher: { contains: params.query, mode: "insensitive" } },
          { description: { contains: params.query, mode: "insensitive" } }
        );
      }

      if (params.title) {
        conditions.push({ title: { contains: params.title, mode: "insensitive" } });
      }

      if (params.author) {
        conditions.push({ author: { contains: params.author, mode: "insensitive" } });
      }

      if (params.publisher) {
        conditions.push({ publisher: { contains: params.publisher, mode: "insensitive" } });
      }

      if (params.category) {
        conditions.push({ category: { contains: params.category, mode: "insensitive" } });
      }

      if (conditions.length > 0) {
        where.OR = conditions;
      }
    }

    if (params.year) {
      where.publishedYear = params.year;
    }

    if (params.isbn) {
      where.isbn = params.isbn;
    }

    if (params.jan) {
      where.jan = params.jan;
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        _count: {
          select: {
            userBooks: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const result = books.map((book) => ({
      ...book,
      userCount: book._count.userBooks,
      reviewCount: book._count.reviews,
    }));

    return { success: true, data: result };
  }, { data, schema: bookSearchSchema });
}

/**
 * Search user's library
 */
export async function searchUserLibrary(
  data: unknown,
  limit: number = 20
): Promise<ActionResult<Array<Record<string, unknown>>>> {
  return withAction(async ({ validData }) => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const params = validData!;
    const bookWhere: Record<string, unknown> = {};

    if (params.exactMatch) {
      if (params.title) bookWhere.title = params.title;
      if (params.author) bookWhere.author = params.author;
      if (params.publisher) bookWhere.publisher = params.publisher;
    } else {
      const conditions: Record<string, unknown>[] = [];

      if (params.query) {
        conditions.push(
          { title: { contains: params.query, mode: "insensitive" } },
          { author: { contains: params.query, mode: "insensitive" } },
          { publisher: { contains: params.query, mode: "insensitive" } }
        );
      }

      if (params.title) {
        conditions.push({ title: { contains: params.title, mode: "insensitive" } });
      }

      if (params.author) {
        conditions.push({ author: { contains: params.author, mode: "insensitive" } });
      }

      if (conditions.length > 0) {
        bookWhere.OR = conditions;
      }
    }

    const userBookWhere: Record<string, unknown> = {
      userId: authResult.userId,
    };

    if (params.status) {
      userBookWhere.status = params.status;
    }

    const userBooks = await prisma.userBook.findMany({
      where: {
        ...userBookWhere,
        book: bookWhere,
      },
      include: {
        book: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    });

    return { success: true, data: userBooks };
  }, { data, schema: userLibrarySearchSchema });
}

/**
 * Get reading history with filters
 */
export async function getReadingHistory(
  data: unknown,
  limit: number = 50
): Promise<ActionResult<Array<Record<string, unknown>>>> {
  return withAction(async ({ validData }) => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const params = validData!;
    const where: Record<string, unknown> = {
      userId: authResult.userId,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.startDate || params.endDate) {
      const updatedAt: Record<string, Date> = {};
      if (params.startDate) updatedAt.gte = params.startDate;
      if (params.endDate) updatedAt.lte = params.endDate;
      where.updatedAt = updatedAt;
    }

    const history = await prisma.userBook.findMany({
      where,
      include: {
        book: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: params.limit ?? limit,
    });

    return { success: true, data: history };
  }, { data, schema: readingHistorySchema });
}

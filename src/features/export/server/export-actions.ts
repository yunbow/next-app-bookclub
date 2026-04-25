'use server';

import { prisma } from '@/lib/prisma';
import { withAction, requireAuth } from '@/lib/actions/action-helpers';
import type { ActionResult } from '@/lib/types/action-result';

/**
 * Export user's book data as JSON
 */
export async function exportBooksAsJSON(): Promise<ActionResult<string>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const userBooks = await prisma.userBook.findMany({
      where: { userId: authResult.userId },
      include: {
        book: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const exportData = userBooks.map((ub) => ({
      title: ub.book.title,
      author: ub.book.author,
      publisher: ub.book.publisher,
      publishedYear: ub.book.publishedYear,
      isbn: ub.book.isbn,
      jan: ub.book.jan,
      category: ub.book.category,
      status: ub.status,
      startDate: ub.startDate?.toISOString(),
      endDate: ub.endDate?.toISOString(),
      readingDays: ub.readingDays,
      memo: ub.memo,
      addedAt: ub.createdAt.toISOString(),
    }));

    return { success: true, data: JSON.stringify(exportData, null, 2) };
  });
}

/**
 * Export user's book data as Markdown
 */
export async function exportBooksAsMarkdown(): Promise<ActionResult<string>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const userBooks = await prisma.userBook.findMany({
      where: { userId: authResult.userId },
      include: {
        book: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    let markdown = '# My Book Collection\n\n';
    markdown += `Exported on: ${new Date().toISOString()}\n\n`;

    const statusGroups = {
      completed: 'Completed Books',
      reading: 'Currently Reading',
      to_read: 'To Read',
      paused: 'Paused',
    };

    for (const [status, title] of Object.entries(statusGroups)) {
      const books = userBooks.filter((ub) => ub.status === status);

      if (books.length > 0) {
        markdown += `## ${title} (${books.length})\n\n`;

        books.forEach((ub) => {
          markdown += `### ${ub.book.title}\n\n`;
          if (ub.book.author) markdown += `- **Author:** ${ub.book.author}\n`;
          if (ub.book.publisher)
            markdown += `- **Publisher:** ${ub.book.publisher}\n`;
          if (ub.book.publishedYear)
            markdown += `- **Year:** ${ub.book.publishedYear}\n`;
          if (ub.book.isbn) markdown += `- **ISBN:** ${ub.book.isbn}\n`;
          if (ub.book.category)
            markdown += `- **Category:** ${ub.book.category}\n`;
          if (ub.startDate)
            markdown += `- **Started:** ${ub.startDate.toISOString().split('T')[0]}\n`;
          if (ub.endDate)
            markdown += `- **Finished:** ${ub.endDate.toISOString().split('T')[0]}\n`;
          if (ub.readingDays > 0)
            markdown += `- **Reading Days:** ${ub.readingDays}\n`;
          if (ub.memo) markdown += `\n**Memo:**\n${ub.memo}\n`;
          markdown += '\n---\n\n';
        });
      }
    }

    return { success: true, data: markdown };
  });
}

/**
 * Export user's reading history as JSON
 */
export async function exportReadingHistoryAsJSON(): Promise<ActionResult<string>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const [userBooks, reviews] = await Promise.all([
      prisma.userBook.findMany({
        where: { userId: authResult.userId },
        include: { book: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
      prisma.review.findMany({
        where: { userId: authResult.userId },
        include: { book: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      books: userBooks.map((ub) => ({
        title: ub.book.title,
        author: ub.book.author,
        isbn: ub.book.isbn,
        status: ub.status,
        startDate: ub.startDate?.toISOString(),
        endDate: ub.endDate?.toISOString(),
        readingDays: ub.readingDays,
        memo: ub.memo,
      })),
      reviews: reviews.map((r) => ({
        bookTitle: r.book.title,
        rating: r.rating,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
      })),
    };

    return { success: true, data: JSON.stringify(exportData, null, 2) };
  });
}

/**
 * Export user's reviews as Markdown
 */
export async function exportReviewsAsMarkdown(): Promise<ActionResult<string>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const reviews = await prisma.review.findMany({
      where: { userId: authResult.userId },
      include: {
        book: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    let markdown = '# My Book Reviews\n\n';
    markdown += `Exported on: ${new Date().toISOString()}\n\n`;
    markdown += `Total Reviews: ${reviews.length}\n\n`;

    reviews.forEach((review) => {
      markdown += `## ${review.book.title}\n\n`;
      if (review.book.author) markdown += `**Author:** ${review.book.author}\n\n`;
      if (review.rating) markdown += `**Rating:** ${'⭐'.repeat(review.rating)}\n\n`;
      markdown += `**Date:** ${review.createdAt.toISOString().split('T')[0]}\n\n`;
      markdown += `${review.content}\n\n`;
      markdown += '---\n\n';
    });

    return { success: true, data: markdown };
  });
}

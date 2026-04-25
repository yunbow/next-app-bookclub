"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existing = await prisma.bookBookmark.findUnique({
    where: { userId_bookId: { userId, bookId } },
  });

  if (existing) {
    await prisma.bookBookmark.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.bookBookmark.create({
      data: { userId, bookId },
    });
  }

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/bookmarks");

  return { bookmarked: !existing };
}

export async function isBookmarked(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const existing = await prisma.bookBookmark.findUnique({
    where: { userId_bookId: { userId: session.user.id, bookId } },
  });

  return !!existing;
}

export async function getUserBookmarks() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return prisma.bookBookmark.findMany({
    where: { userId: session.user.id },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          coverImage: true,
          publisher: true,
          publishedYear: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

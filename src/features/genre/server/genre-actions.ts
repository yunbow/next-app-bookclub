"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { revalidatePath } from "next/cache";

export async function getAllGenres() {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getUserFavoriteGenres(userId: string) {
  const rows = await prisma.userFavoriteGenre.findMany({
    where: { userId },
    include: { genre: { select: { id: true, name: true, slug: true } } },
    orderBy: { genre: { name: "asc" } },
  });
  return rows.map((r) => r.genre);
}

export async function updateUserFavoriteGenres(genreIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const unique = Array.from(new Set(genreIds.filter(Boolean)));

  await prisma.$transaction([
    prisma.userFavoriteGenre.deleteMany({ where: { userId } }),
    ...(unique.length > 0
      ? [
          prisma.userFavoriteGenre.createMany({
            data: unique.map((genreId) => ({ userId, genreId })),
          }),
        ]
      : []),
  ]);

  revalidatePath(`/profile/${userId}`);
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("q");

  try {
    const where: Prisma.BookWhereInput = {
      ...(status && { userBooks: { some: { userId: session.user.id, status } } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { author: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const books = await prisma.book.findMany({
      where,
      include: {
        userBooks: {
          where: { userId: session.user.id },
          select: {
            status: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            userBooks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(books);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

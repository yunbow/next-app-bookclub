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
  const bookId = searchParams.get("bookId");

  try {
    const where: Prisma.ReviewWhereInput = {
      OR: [{ visibility: "public" }, { userId: session.user.id }],
      ...(bookId && { bookId }),
    };

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

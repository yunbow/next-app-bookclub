import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const SearchQuerySchema = z.object({
  q: z.string().min(1, "検索キーワードを入力してください").max(200),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = SearchQuerySchema.safeParse({
      q: searchParams.get("q"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const searchQuery = parsed.data.q.toLowerCase();

    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { author: { contains: searchQuery } },
          { publisher: { contains: searchQuery } },
          { isbn: { contains: searchQuery } },
        ],
      },
      select: {
        id: true,
        title: true,
        author: true,
        publisher: true,
        coverImage: true,
        isbn: true,
      },
      take: 20,
    });

    logger.info(
      { query: searchQuery, resultCount: books.length },
      "Book search completed"
    );

    return NextResponse.json({ books });
  } catch (error) {
    logger.error({ err: error }, "Book search error");
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "検索中にエラーが発生しました" } },
      { status: 500 }
    );
  }
}

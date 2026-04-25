import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const querySchema = z.object({
  bookId: z.string().cuid(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    const parsed = querySchema.safeParse({ bookId });
    if (!parsed.success) {
      logger.warn(
        { userId: session.user.id, validation: parsed.error.issues },
        "Highlights API validation failed"
      );
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const highlights = await prisma.highlight.findMany({
      where: {
        bookId: parsed.data.bookId,
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    logger.info(
      { userId: session.user.id, bookId: parsed.data.bookId, count: highlights.length },
      "Highlights fetched"
    );
    return NextResponse.json(highlights);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch highlights");
    return NextResponse.json(
      { error: "Failed to fetch highlights" },
      { status: 500 }
    );
  }
}

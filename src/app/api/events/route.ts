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
  const upcoming = searchParams.get("upcoming") === "true";

  try {
    const where: Prisma.EventWhereInput = upcoming ? { date: { gte: new Date() } } : {};

    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: { date: "asc" },
      take: 50,
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

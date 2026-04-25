import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.readingGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    logger.info(
      { userId: session.user.id, count: goals.length },
      "Reading goals fetched"
    );
    return NextResponse.json(goals);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch goals");
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { checkRateLimit, RATE_LIMITS, createRateLimitErrorResponse } from "@/lib/security/rate-limit";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const rateLimitResult = await checkRateLimit(
      `deleteAccount:${userId}`,
      RATE_LIMITS.deleteAccount.limit,
      RATE_LIMITS.deleteAccount.windowMs
    );
    if (!rateLimitResult.success) {
      logger.warn({ userId }, "Rate limit exceeded for deleteAccount");
      return NextResponse.json(createRateLimitErrorResponse(rateLimitResult.resetAt), { status: 429 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.activity.deleteMany({ where: { userId } });
      await tx.readingSession.deleteMany({
        where: { userBook: { userId } },
      });
      await tx.userBook.deleteMany({ where: { userId } });
      await tx.reviewReaction.deleteMany({
        where: { review: { userId } },
      });
      await tx.reviewComment.deleteMany({
        where: { review: { userId } },
      });
      await tx.review.deleteMany({ where: { userId } });
      await tx.eventParticipant.deleteMany({ where: { userId } });
      await tx.event.deleteMany({ where: { organizerId: userId } });
      await tx.readingGoal.deleteMany({ where: { userId } });
      await tx.userBadge.deleteMany({ where: { userId } });
      await tx.readingStreak.deleteMany({ where: { userId } });
      await tx.follow.deleteMany({
        where: {
          OR: [{ followerId: userId }, { followingId: userId }],
        },
      });
      await tx.block.deleteMany({
        where: {
          OR: [{ blockerId: userId }, { blockedId: userId }],
        },
      });
      await tx.notification.deleteMany({
        where: {
          OR: [{ recipientId: userId }, { actorId: userId }],
        },
      });
      await tx.session.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    logger.info({ userId }, "Account deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, "Account deletion error");
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "アカウントの削除に失敗しました" } },
      { status: 500 }
    );
  }
}

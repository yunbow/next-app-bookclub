import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { PasswordChangeSchema } from "@/features/settings/schema/password-schema";
import { checkRateLimit, RATE_LIMITS, createRateLimitErrorResponse } from "@/lib/security/rate-limit";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 }
      );
    }

    const rateLimitResult = await checkRateLimit(
      `changePassword:${session.user.id}`,
      RATE_LIMITS.changePassword.limit,
      RATE_LIMITS.changePassword.windowMs
    );
    if (!rateLimitResult.success) {
      logger.warn({ userId: session.user.id }, "Rate limit exceeded for changePassword");
      return NextResponse.json(createRateLimitErrorResponse(rateLimitResult.resetAt), { status: 429 });
    }

    const body = await request.json();
    const parsed = PasswordChangeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
            fieldErrors: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "ユーザーが見つかりません" } },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "このアカウントはパスワード認証を使用していません" } },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "現在のパスワードが正しくありません" } },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    logger.info({ userId: session.user.id }, "Password changed successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, "Password change error");
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "パスワードの変更に失敗しました" } },
      { status: 500 }
    );
  }
}

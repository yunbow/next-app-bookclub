import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { ProfileUpdateSchema } from "@/features/profile/schema/profile-schema";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

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

    const existingUsername = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    });
    if (existingUsername && existingUsername.id !== session.user.id) {
      return NextResponse.json(
        { error: { code: "ALREADY_EXISTS", message: "このユーザーIDは既に使用されています" } },
        { status: 400 }
      );
    }

    const updateData: { name: string; username: string; image?: string } = {
      name: parsed.data.name.trim(),
      username: parsed.data.username.trim(),
    };

    if (parsed.data.image) {
      updateData.image = parsed.data.image.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        level: true,
        xp: true,
        favoriteGenresList: {
          include: { genre: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    return NextResponse.json({
      ...updatedUser,
      favoriteGenres: updatedUser.favoriteGenresList.map((r) => r.genre),
    });
  } catch (error) {
    logger.error({ err: error }, "Profile update error");
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "プロフィールの更新に失敗しました" } },
      { status: 500 }
    );
  }
}

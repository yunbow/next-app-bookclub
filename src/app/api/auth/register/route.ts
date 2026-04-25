import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";
import { registerSchema } from "@/features/auth/schema/auth-schema";

function generateUsername(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 10; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `user_${suffix}`;
}

async function generateUniqueUsername(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const username = generateUsername();
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return username;
  }
  return `user_${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    const username = await generateUniqueUsername();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    logger.info({ userId: user.id }, "User registered via API");
    return NextResponse.json(
      { message: "登録が完了しました", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ err: error }, "Registration error");
    return NextResponse.json(
      { message: "登録中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

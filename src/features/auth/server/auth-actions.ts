"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";
import { registerSchema } from "../schema/auth-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { headers } from "next/headers";

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

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const headersList = await headers();
  const ip =
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";

  const rateLimitResult = await checkRateLimit(
    `register:${ip}`,
    RATE_LIMITS.register.limit,
    RATE_LIMITS.register.windowMs
  );
  if (!rateLimitResult.success) {
    logger.warn({ ip }, "Rate limit exceeded for register");
    return {
      success: false,
      error: { code: "RATE_LIMIT_EXCEEDED", message: "リクエストが多すぎます。しばらくしてからもう一度お試しください。" },
    };
  }

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  const parsed = registerSchema.safeParse({ name, email, password, confirmPassword });
  if (!parsed.success) {
    return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } };
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingEmail) {
    return { success: false, error: { code: "ALREADY_EXISTS", message: "このメールアドレスは既に登録されています" } };
  }

  const username = await generateUniqueUsername();
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      username,
      email: parsed.data.email,
      name: parsed.data.name,
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  logger.info(`User registered: ${parsed.data.email}`);

  return { success: true, data: undefined };
}

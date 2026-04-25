import "server-only";

import { prisma } from "@/lib/prisma";
import { createContextLogger, logger } from "@/lib/logger";
import { DomainError, ERROR_CODES } from "@/lib/errors";

export interface CreateChallengeInput {
  type: "monthly_books" | "yearly_books" | "genre_diversity" | "reading_streak";
  title: string;
  description?: string;
  target: number;
  startDate: string;
  endDate: string;
}

export async function createChallenge(input: CreateChallengeInput) {
  return prisma.challenge.create({
    data: {
      type: input.type,
      title: input.title,
      description: input.description,
      target: input.target,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
    },
  });
}

export async function getActiveChallenges() {
  const now = new Date();
  return prisma.challenge.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      _count: {
        select: { participants: true },
      },
    },
    orderBy: { startDate: "desc" },
    take: 50,
  });
}

export async function joinChallenge(challengeId: string, userId: string) {
  const existing = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });

  if (existing) {
    throw new DomainError(
      ERROR_CODES.ALREADY_EXISTS,
      "このチャレンジには既に参加しています",
      false,
      { challengeId }
    );
  }

  return prisma.challengeParticipant.create({
    data: { challengeId, userId },
  });
}

export async function leaveChallenge(challengeId: string, userId: string) {
  await prisma.challengeParticipant.delete({
    where: { challengeId_userId: { challengeId, userId } },
  });
}

export async function getUserChallenges(userId: string) {
  return prisma.challengeParticipant.findMany({
    where: { userId },
    include: { challenge: true },
    orderBy: { joinedAt: "desc" },
    take: 50,
  });
}

async function computeProgress(
  challenge: Awaited<ReturnType<typeof prisma.challenge.findUnique>>,
  userId: string
): Promise<number> {
  if (!challenge) return 0;

  switch (challenge.type) {
    case "monthly_books":
    case "yearly_books":
      return prisma.userBook.count({
        where: {
          userId,
          status: "completed",
          endDate: { gte: challenge.startDate, lte: challenge.endDate },
        },
      });

    case "genre_diversity": {
      const books = await prisma.userBook.findMany({
        where: {
          userId,
          status: "completed",
          endDate: { gte: challenge.startDate, lte: challenge.endDate },
        },
        include: { book: { select: { category: true } } },
        take: 1000,
      });
      const uniqueGenres = new Set(
        books.map((ub) => ub.book.category).filter((c): c is string => !!c)
      );
      return uniqueGenres.size;
    }

    case "reading_streak": {
      const streak = await prisma.readingStreak.findUnique({ where: { userId } });
      return streak?.currentStreak ?? 0;
    }

    default:
      return 0;
  }
}

export async function updateChallengeProgress(challengeId: string, userId: string) {
  const requestId = `challenge-progress-${Date.now()}`;
  const log = createContextLogger(requestId, userId);

  log.info("Starting challenge progress update");

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    log.warn("Challenge not found");
    throw new DomainError(
      ERROR_CODES.NOT_FOUND,
      "チャレンジが見つかりません",
      false,
      { challengeId }
    );
  }

  const existingParticipant = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });

  if (!existingParticipant) {
    log.info("User not participating in challenge");
    return null;
  }

  const progress = await computeProgress(challenge, userId);
  const completed = progress >= challenge.target;
  const wasCompleted = existingParticipant.completed;

  const participant = await prisma.$transaction(async (tx) => {
    const updated = await tx.challengeParticipant.update({
      where: { challengeId_userId: { challengeId, userId } },
      data: {
        progress,
        completed,
        completedAt:
          completed && !wasCompleted ? new Date() : existingParticipant.completedAt,
      },
    });

    if (completed && !wasCompleted) {
      const { awardXP } = await import("@/features/gamification/server/xp-actions");
      await awardXP(userId, 100, `Completed challenge: ${challenge.title}`);

      await tx.notification.create({
        data: {
          type: "challenge_completed",
          recipientId: userId,
          actorId: userId,
          resourceId: challengeId,
        },
      });

      log.info("Challenge completed, awarded XP and notification");
    }

    return updated;
  });

  log.info("Challenge progress updated successfully");
  return participant;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userImage: string | null;
  progress: number;
  completed: boolean;
  completedAt: Date | null;
}

export async function getChallengeLeaderboard(
  challengeId: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const participants = await prisma.challengeParticipant.findMany({
    where: { challengeId },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: [
      { completed: "desc" },
      { progress: "desc" },
      { completedAt: "asc" },
    ],
    take: limit,
  });

  return participants.map((p, index) => ({
    rank: index + 1,
    userId: p.userId,
    userName: p.user?.name || "Unknown User",
    userImage: p.user?.image || null,
    progress: p.progress,
    completed: p.completed,
    completedAt: p.completedAt,
  }));
}

export async function createDefaultMonthlyChallenge() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthName = startDate.toLocaleDateString("ja-JP", { month: "long" });

  try {
    return await prisma.challenge.create({
      data: {
        type: "monthly_books",
        title: `${monthName}の読書チャレンジ`,
        description: "今月10冊読破を目指そう！",
        target: 10,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to create default monthly challenge");
    throw error;
  }
}

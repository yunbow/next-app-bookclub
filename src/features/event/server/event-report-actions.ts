"use server";

import { prisma } from "@/lib/prisma";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import { z } from "zod";

const CreateReportSchema = z.object({
  eventId: z.string(),
  content: z.string().min(1),
  visibility: z.enum(["public", "private", "draft"]).default("public"),
  publishAt: z.string().optional(),
});

const CreateReportCommentSchema = z.object({
  reportId: z.string(),
  content: z.string().min(1),
});

/**
 * Create event report
 */
export async function createEventReport(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const report = await prisma.eventReport.create({
        data: {
          eventId: validData!.eventId,
          userId: authResult.userId,
          content: validData!.content,
          visibility: validData!.visibility,
          ...(validData!.publishAt && { publishAt: new Date(validData!.publishAt) }),
        },
      });

      logger.info(
        { userId: authResult.userId, reportId: report.id, eventId: validData!.eventId },
        "Event report created"
      );
      revalidatePath(`/events/${validData!.eventId}`);
      return { success: true, data: { id: report.id } };
    },
    { data, schema: CreateReportSchema }
  );
}

/**
 * Update event report
 */
export async function updateEventReport(
  reportId: string,
  data: Partial<z.infer<typeof CreateReportSchema>>
): Promise<ActionResult<void>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const report = await prisma.eventReport.findUnique({
      where: { id: reportId },
      select: { userId: true, eventId: true },
    });

    if (!report || report.userId !== authResult.userId) {
      logger.error(
        {
          type: "authorization_failure",
          severity: "high",
          userId: authResult.userId,
          ownerId: report?.userId,
          resourceId: reportId,
        },
        "Unauthorized report update attempt"
      );
      return { success: false, error: { code: "FORBIDDEN", message: "レポートが見つからないか、権限がありません" } };
    }

    const updateData: {
      content?: string;
      visibility?: "public" | "private" | "draft";
      publishAt?: Date;
    } = {};
    if (data.content) updateData.content = data.content;
    if (data.visibility) updateData.visibility = data.visibility;
    if (data.publishAt) updateData.publishAt = new Date(data.publishAt);

    await prisma.eventReport.update({
      where: { id: reportId },
      data: updateData,
    });

    logger.info({ userId: authResult.userId, reportId }, "Event report updated");
    revalidatePath(`/events/${report.eventId}`);
    return { success: true, data: undefined };
  });
}

/**
 * Delete event report
 */
export async function deleteEventReport(
  reportId: string
): Promise<ActionResult<void>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const report = await prisma.eventReport.findUnique({
      where: { id: reportId },
      select: { userId: true, eventId: true },
    });

    if (!report || report.userId !== authResult.userId) {
      logger.error(
        {
          type: "authorization_failure",
          severity: "high",
          userId: authResult.userId,
          ownerId: report?.userId,
          resourceId: reportId,
        },
        "Unauthorized report delete attempt"
      );
      return { success: false, error: { code: "FORBIDDEN", message: "レポートが見つからないか、権限がありません" } };
    }

    await prisma.eventReport.delete({
      where: { id: reportId },
    });

    logger.info({ userId: authResult.userId, reportId }, "Event report deleted");
    revalidatePath(`/events/${report.eventId}`);
    return { success: true, data: undefined };
  });
}

/**
 * Create comment on event report
 */
export async function createEventReportComment(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const comment = await prisma.eventReportComment.create({
        data: {
          reportId: validData!.reportId,
          userId: authResult.userId,
          content: validData!.content,
        },
      });

      logger.info(
        {
          userId: authResult.userId,
          commentId: comment.id,
          reportId: validData!.reportId,
        },
        "Event report comment created"
      );

      revalidatePath("/events");
      return { success: true, data: { id: comment.id } };
    },
    { data, schema: CreateReportCommentSchema }
  );
}

/**
 * Get event reports
 */
export async function getEventReports(eventId: string): Promise<ActionResult<Awaited<ReturnType<typeof prisma.eventReport.findMany>>>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const reports = await prisma.eventReport.findMany({
      where: {
        eventId,
        OR: [
          { visibility: "public" },
          { userId: authResult.userId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, data: reports };
  });
}

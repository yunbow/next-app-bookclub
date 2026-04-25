"use server";

import { prisma } from "@/lib/prisma";
import { createEventSchema, updateEventSchema, participateEventSchema, createEventReportSchema } from "../schema/event-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { withAction, requireAuth } from "@/lib/actions/action-helpers";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createEventAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const event = await prisma.event.create({
        data: {
          title: validData!.title,
          description: validData!.description,
          date: new Date(validData!.eventDate),
          location: validData!.location,
          isOnline: validData!.isOnline,
          capacity: validData!.maxParticipants,
          theme: validData!.theme,
          requiresApproval: validData!.requiresApproval,
          organizerId: authResult.userId,
        },
      });

      logger.info({
        userId: authResult.userId,
        eventId: event.id,
      }, "Event created successfully");

      revalidatePath("/events");
      return { success: true, data: { id: event.id } };
    },
    { data, schema: createEventSchema }
  );
}

export async function updateEventAction(
  id: string,
  data: unknown
): Promise<ActionResult<void>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const event = await prisma.event.findUnique({
        where: { id },
        select: { organizerId: true },
      });

      if (!event) {
        return { success: false, error: { code: "NOT_FOUND", message: "イベントが見つかりません" } };
      }

      if (event.organizerId !== authResult.userId) {
        logger.error({
          type: "AUTHORIZATION_FAILURE",
          userId: authResult.userId,
          eventId: id,
          ownerId: event.organizerId,
          action: "update_event",
          reason: "not_organizer",
          severity: "high",
        }, "Unauthorized event update attempt");
        return { success: false, error: { code: "FORBIDDEN", message: "権限がありません" } };
      }

      await prisma.event.update({
        where: { id },
        data: validData!,
      });

      logger.info({ userId: authResult.userId, eventId: id }, "Event updated");
      revalidatePath("/events");
      revalidatePath(`/events/${id}`);
      return { success: true, data: undefined };
    },
    { data, schema: updateEventSchema }
  );
}

export async function deleteEventAction(
  id: string
): Promise<ActionResult<void>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const event = await prisma.event.findUnique({
      where: { id },
      select: { organizerId: true },
    });

    if (!event) {
      return { success: false, error: { code: "NOT_FOUND", message: "イベントが見つかりません" } };
    }

    if (event.organizerId !== authResult.userId) {
      logger.error({
        type: "AUTHORIZATION_FAILURE",
        userId: authResult.userId,
        eventId: id,
        ownerId: event.organizerId,
        action: "delete_event",
        reason: "not_organizer",
        severity: "high",
      }, "Unauthorized event deletion attempt");
      return { success: false, error: { code: "FORBIDDEN", message: "権限がありません" } };
    }

    await prisma.event.delete({
      where: { id },
    });

    logger.info({ userId: authResult.userId, eventId: id }, "Event deleted");
    revalidatePath("/events");
    return { success: true, data: undefined };
  });
}

export async function participateEventAction(
  data: unknown
): Promise<ActionResult<void>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const event = await prisma.event.findUnique({
        where: { id: validData!.eventId },
        include: {
          _count: {
            select: { participants: true },
          },
        },
      });

      if (!event) {
        return { success: false, error: { code: "NOT_FOUND", message: "イベントが見つかりません" } };
      }

      // Check if already participating
      const existingParticipation = await prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: validData!.eventId,
            userId: authResult.userId,
          },
        },
      });

      if (existingParticipation) {
        return { success: false, error: { code: "ALREADY_EXISTS", message: "既に参加登録済みです" } };
      }

      // Check capacity
      if (event.capacity && event._count.participants >= event.capacity) {
        return { success: false, error: { code: "VALIDATION_ERROR", message: "定員に達しています" } };
      }

      const status = event.requiresApproval ? "pending" : "approved";

      await prisma.eventParticipant.create({
        data: {
          eventId: validData!.eventId,
          userId: authResult.userId,
          status,
        },
      });

      // Create notification for organizer
      await prisma.notification.create({
        data: {
          type: "event_participation",
          recipientId: event.organizerId,
          actorId: authResult.userId,
          resourceId: validData!.eventId,
        },
      });

      logger.info({
        userId: authResult.userId,
        eventId: validData!.eventId,
        status,
      }, "Event participation created");

      revalidatePath(`/events/${validData!.eventId}`);
      return { success: true, data: undefined };
    },
    { data, schema: participateEventSchema }
  );
}

export async function cancelParticipationAction(
  eventId: string
): Promise<ActionResult<void>> {
  return withAction(async () => {
    const authResult = await requireAuth();
    if (!authResult.success) return authResult;

    const participation = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: authResult.userId,
        },
      },
    });

    if (!participation) {
      return { success: false, error: { code: "NOT_FOUND", message: "参加登録が見つかりません" } };
    }

    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: authResult.userId,
        },
      },
    });

    logger.info({ userId: authResult.userId, eventId }, "Event participation cancelled");
    revalidatePath(`/events/${eventId}`);
    return { success: true, data: undefined };
  });
}

export async function createEventReportAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  return withAction(
    async ({ validData }) => {
      const authResult = await requireAuth();
      if (!authResult.success) return authResult;

      const event = await prisma.event.findUnique({
        where: { id: validData!.eventId },
        select: { organizerId: true },
      });

      if (!event) {
        return { success: false, error: { code: "NOT_FOUND", message: "イベントが見つかりません" } };
      }

      if (event.organizerId !== authResult.userId) {
        return { success: false, error: { code: "FORBIDDEN", message: "レポートは主催者のみ作成できます" } };
      }

      const report = await prisma.eventReport.create({
        data: {
          ...validData!,
          userId: authResult.userId,
        },
      });

      logger.info({
        userId: authResult.userId,
        reportId: report.id,
        eventId: validData!.eventId,
      }, "Event report created");

      revalidatePath(`/events/${validData!.eventId}`);
      return { success: true, data: { id: report.id } };
    },
    { data, schema: createEventReportSchema }
  );
}

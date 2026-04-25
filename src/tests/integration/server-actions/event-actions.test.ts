/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createEventAction,
  deleteEventAction,
  participateEventAction,
} from "@/features/event/server/event-actions";

// Mock auth
vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(() =>
    Promise.resolve({
      user: { id: "test-user-id", email: "test@example.com" },
    })
  ),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    eventParticipant: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}));

describe("Event Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEventAction", () => {
    it("should create an event successfully", async () => {
      const mockEvent = {
        id: "event-123",
        title: "Book Club Meeting",
        organizerId: "test-user-id",
      };

      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.event.create).mockResolvedValue(mockEvent as any);

      const result = await createEventAction({
        title: "Book Club Meeting",
        eventDate: new Date("2024-12-31").toISOString(),
        location: "Tokyo",
        isOnline: false,
        requiresApproval: false,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: "event-123" });
      }
    });

    it("should return error for invalid data", async () => {
      const result = await createEventAction({
        title: "", // Invalid: empty title
        eventDate: new Date().toISOString(),
        isOnline: false,
        requiresApproval: false,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("participateEventAction", () => {
    it("should participate in event successfully", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.event.findUnique).mockResolvedValue({
        id: "event-123",
        organizerId: "organizer-id",
        capacity: 10,
        requiresApproval: false,
        _count: { participants: 5 },
      } as any);
      vi.mocked(prisma.eventParticipant.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.eventParticipant.create).mockResolvedValue({} as any);
      vi.mocked(prisma.notification.create).mockResolvedValue({} as any);

      const result = await participateEventAction({
        eventId: "event-123",
      });

      expect(result.success).toBe(true);
    });

    it("should return error when event is full", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.event.findUnique).mockResolvedValue({
        id: "event-123",
        organizerId: "organizer-id",
        capacity: 10,
        requiresApproval: false,
        _count: { participants: 10 }, // Full
      } as any);
      vi.mocked(prisma.eventParticipant.findUnique).mockResolvedValue(null);

      const result = await participateEventAction({
        eventId: "event-123",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("定員に達しています");
      }
    });

    it("should return error when already participating", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.event.findUnique).mockResolvedValue({
        id: "event-123",
        organizerId: "organizer-id",
        _count: { participants: 0 },
      } as any);
      vi.mocked(prisma.eventParticipant.findUnique).mockResolvedValue({
        id: "participant-123",
      } as any);

      const result = await participateEventAction({
        eventId: "event-123",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("既に参加登録済みです");
      }
    });
  });

  describe("deleteEventAction", () => {
    it("should delete event successfully", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.event.findUnique).mockResolvedValue({
        id: "event-123",
        organizerId: "test-user-id",
      } as any);
      vi.mocked(prisma.event.delete).mockResolvedValue({} as any);

      const result = await deleteEventAction("event-123");

      expect(result.success).toBe(true);
    });

    it("should return error for unauthorized deletion", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.event.findUnique).mockResolvedValue({
        id: "event-123",
        organizerId: "other-user-id", // Different user
      } as any);

      const result = await deleteEventAction("event-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("権限がありません");
      }
    });
  });
});

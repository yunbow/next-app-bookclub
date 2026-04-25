import { describe, it, expect } from "vitest";
import {
  createEventSchema,
  updateEventSchema,
  participateEventSchema,
  createEventReportSchema,
} from "@/features/event/schema/event-schema";

describe("Event Schema", () => {
  describe("createEventSchema", () => {
    it("should validate valid event data", () => {
      const validData = {
        title: "Book Club Meeting",
        description: "Monthly book club",
        eventDate: new Date("2024-12-31").toISOString(),
        location: "Tokyo",
        isOnline: false,
        maxParticipants: 10,
        requiresApproval: false,
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require title and eventDate", () => {
      const invalidData = {
        description: "Monthly book club",
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate title length", () => {
      const invalidData = {
        title: "a".repeat(201),
        eventDate: new Date(),
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate maxParticipants minimum", () => {
      const invalidData = {
        title: "Book Club Meeting",
        eventDate: new Date(),
        maxParticipants: 0,
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("participateEventSchema", () => {
    it("should validate valid participation data", () => {
      const validData = {
        eventId: "event-123",
      };

      const result = participateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require eventId", () => {
      const invalidData = {};

      const result = participateEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createEventReportSchema", () => {
    it("should validate valid report data", () => {
      const validData = {
        eventId: "event-123",
        content: "Great event!",
      };

      const result = createEventReportSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require eventId and content", () => {
      const invalidData = {
        content: "Great event!",
      };

      const result = createEventReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate content length", () => {
      const invalidData = {
        eventId: "event-123",
        content: "a".repeat(5001),
      };

      const result = createEventReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

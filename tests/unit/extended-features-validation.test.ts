import { describe, it, expect } from "vitest";
import { createGoalSchema, updateGoalSchema } from "@/features/reading-goal/schema/goal-schema";
import { updateProgressSchema } from "@/features/reading-progress/schema/progress-schema";
import { startSessionSchema, endSessionSchema } from "@/features/reading-session/schema/session-schema";
import { createHighlightSchema, updateHighlightSchema } from "@/features/highlight/schema/highlight-schema";

describe("Reading Goal Validation", () => {
  it("should validate correct goal creation data", () => {
    const validData = {
      type: "yearly_books",
      target: 50,
      year: 2024,
    };

    const result = createGoalSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid goal type", () => {
    const invalidData = {
      type: "invalid_type",
      target: 50,
      year: 2024,
    };

    const result = createGoalSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject negative target", () => {
    const invalidData = {
      type: "yearly_books",
      target: -10,
      year: 2024,
    };

    const result = createGoalSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should require month for monthly_books type", () => {
    const invalidData = {
      type: "monthly_books",
      target: 5,
      year: 2024,
    };

    const result = createGoalSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Reading Progress Validation", () => {
  it("should validate correct progress update", () => {
    const validData = {
      bookId: "clxxx123456789",
      currentPage: 150,
    };

    const result = updateProgressSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject negative page number", () => {
    const invalidData = {
      bookId: "clxxx123456789",
      currentPage: -10,
    };

    const result = updateProgressSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid bookId format", () => {
    const invalidData = {
      bookId: "invalid-id",
      currentPage: 150,
    };

    const result = updateProgressSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Reading Session Validation", () => {
  it("should validate session start", () => {
    const validData = {
      bookId: "clxxx123456789",
    };

    const result = startSessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate session end", () => {
    const validData = {
      sessionId: "clxxx123456789",
      pagesRead: 25,
    };

    const result = endSessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject negative pages read", () => {
    const invalidData = {
      sessionId: "clxxx123456789",
      pagesRead: -5,
    };

    const result = endSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Highlight Validation", () => {
  it("should validate correct highlight creation", () => {
    const validData = {
      bookId: "clxxx123456789",
      content: "This is a great quote from the book.",
      pageNumber: 42,
      color: "yellow",
      isPublic: false,
    };

    const result = createHighlightSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty content", () => {
    const invalidData = {
      bookId: "clxxx123456789",
      content: "",
      pageNumber: 42,
    };

    const result = createHighlightSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid color", () => {
    const invalidData = {
      bookId: "clxxx123456789",
      content: "Great quote",
      color: "invalid_color",
    };

    const result = createHighlightSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject negative page number", () => {
    const invalidData = {
      bookId: "clxxx123456789",
      content: "Great quote",
      pageNumber: -1,
    };

    const result = createHighlightSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

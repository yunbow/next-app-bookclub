import { describe, it, expect } from "vitest";
import {
  createReviewSchema,
  updateReviewSchema,
  createReviewCommentSchema,
  createReviewReactionSchema,
} from "@/features/review/schema/review-schema";

describe("Review Schema", () => {
  describe("createReviewSchema", () => {
    it("should validate valid review data", () => {
      const validData = {
        bookId: "book-123",
        content: "Great book!!",
        rating: 5,
        visibility: "public" as const,
      };

      const result = createReviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require bookId", () => {
      const invalidData = {
        content: "Great book!",
        rating: 5,
      };

      const result = createReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate rating range", () => {
      const invalidData = {
        bookId: "book-123",
        content: "Great book!",
        rating: 6,
      };

      const result = createReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate content length", () => {
      const invalidData = {
        bookId: "book-123",
        content: "a".repeat(5001),
        rating: 5,
      };

      const result = createReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createReviewCommentSchema", () => {
    it("should validate valid comment data", () => {
      const validData = {
        reviewId: "review-123",
        content: "I agree!",
      };

      const result = createReviewCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require reviewId and content", () => {
      const invalidData = {
        content: "I agree!",
      };

      const result = createReviewCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createReviewReactionSchema", () => {
    it("should validate valid reaction types", () => {
      const validTypes = ["like", "clap", "sad", "surprise"];

      validTypes.forEach((type) => {
        const validData = {
          reviewId: "review-123",
          type,
        };

        const result = createReviewReactionSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid reaction type", () => {
      const invalidData = {
        reviewId: "review-123",
        type: "invalid",
      };

      const result = createReviewReactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

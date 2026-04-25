import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
  createReviewCommentAction,
  toggleReviewReactionAction,
} from "@/features/review/server/review-actions";

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
    review: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    reviewComment: {
      create: vi.fn(),
    },
    reviewReaction: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}));

describe("Review Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createReviewAction", () => {
    it("should create a review successfully", async () => {
      const mockReview = {
        id: "review-123",
        bookId: "book-123",
        userId: "test-user-id",
        content: "Great book!!",
        rating: 5,
      };

      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.review.create).mockResolvedValue(mockReview as any);

      const result = await createReviewAction({
        bookId: "book-123",
        content: "Great book!!",
        rating: 5,
        visibility: "public",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: "review-123" });
      }
    });

    it("should return error for invalid rating", async () => {
      const result = await createReviewAction({
        bookId: "book-123",
        content: "Great book!!",
        rating: 6, // Invalid: > 5
        visibility: "public",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("toggleReviewReactionAction", () => {
    it("should add reaction when not exists", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.reviewReaction.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.reviewReaction.create).mockResolvedValue({} as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

      const result = await toggleReviewReactionAction({
        reviewId: "review-123",
        type: "like",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ isReacted: true });
      }
    });

    it("should remove reaction when exists", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.reviewReaction.findFirst).mockResolvedValue({
        id: "reaction-123",
      } as any);
      vi.mocked(prisma.reviewReaction.delete).mockResolvedValue({} as any);

      const result = await toggleReviewReactionAction({
        reviewId: "review-123",
        type: "like",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ isReacted: false });
      }
    });
  });

  describe("deleteReviewAction", () => {
    it("should delete review successfully", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: "review-123",
        userId: "test-user-id",
      } as any);
      vi.mocked(prisma.review.delete).mockResolvedValue({} as any);

      const result = await deleteReviewAction("review-123");

      expect(result.success).toBe(true);
    });

    it("should return error for unauthorized deletion", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: "review-123",
        userId: "other-user-id", // Different user
      } as any);

      const result = await deleteReviewAction("review-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("権限がありません");
      }
    });
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createBookAction, updateUserBookAction, deleteUserBookAction } from "@/features/book/server/book-actions";

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
    book: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    userBook: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Book Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBookAction", () => {
    it("should create a book successfully", async () => {
      const mockBook = {
        id: "book-123",
        title: "Test Book",
        author: "Test Author",
      };

      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.book.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.book.create).mockResolvedValue(mockBook as any);

      const result = await createBookAction({
        title: "Test Book",
        author: "Test Author",
        isbn: "9784123456789",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: "book-123" });
      }
    });

    it("should return error for invalid data", async () => {
      const result = await createBookAction({
        title: "", // Invalid: empty title
        isbn: "9784123456789",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error when not authenticated", async () => {
      const { auth } = await import("@/lib/auth/config");
      vi.mocked(auth).mockResolvedValueOnce(null);

      const result = await createBookAction({
        title: "Test Book",
        isbn: "9784123456789",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("認証が必要です");
      }
    });
  });

  describe("updateUserBookAction", () => {
    it("should update user book successfully", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.userBook.upsert).mockResolvedValue({} as any);

      const result = await updateUserBookAction("book-123", {
        status: "reading",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("deleteUserBookAction", () => {
    it("should delete user book successfully", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.userBook.findUnique).mockResolvedValue({
        id: "userbook-123",
        userId: "test-user-id",
        bookId: "book-123",
      } as any);

      vi.mocked(prisma.userBook.delete).mockResolvedValue({} as any);

      const result = await deleteUserBookAction("book-123");

      expect(result.success).toBe(true);
    });

    it("should return error when book not found", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.userBook.findUnique).mockResolvedValue(null);

      const result = await deleteUserBookAction("book-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("読書記録が見つかりません");
      }
    });
  });
});

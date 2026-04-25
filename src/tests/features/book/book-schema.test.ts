import { describe, it, expect } from "vitest";
import {
  createBookSchema,
  updateUserBookSchema,
  searchBookSchema,
} from "@/features/book/schema/book-schema";

describe("Book Schema", () => {
  describe("createBookSchema", () => {
    it("should validate valid book data", () => {
      const validData = {
        title: "Test Book",
        author: "Test Author",
        publisher: "Test Publisher",
        publishedYear: 2024,
        isbn: "978-4-1234-5678-9",
        description: "Test description",
      };

      const result = createBookSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require title", () => {
      const invalidData = {
        author: "Test Author",
      };

      const result = createBookSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate title length", () => {
      const invalidData = {
        title: "a".repeat(201),
      };

      const result = createBookSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate published year range", () => {
      const invalidData = {
        title: "Test Book",
        publishedYear: 999,
      };

      const result = createBookSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateUserBookSchema", () => {
    it("should validate valid status", () => {
      const validData = {
        status: "reading" as const,
        startDate: new Date().toISOString(),
      };

      const result = updateUserBookSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        status: "invalid",
      };

      const result = updateUserBookSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate memo length", () => {
      const invalidData = {
        status: "reading" as const,
        memo: "a".repeat(1001),
      };

      const result = updateUserBookSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("searchBookSchema", () => {
    it("should validate search query", () => {
      const validData = {
        query: "test",
      };

      const result = searchBookSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require query", () => {
      const invalidData = {};

      const result = searchBookSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

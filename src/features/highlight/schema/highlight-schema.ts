import { z } from "zod";

// ハイライト作成
export const createHighlightSchema = z.object({
  bookId: z.string().min(1),
  content: z.string().min(1).max(2000),
  pageNumber: z.number().int().min(1).optional(),
  chapter: z.string().max(100).optional(),
  note: z.string().max(1000).optional(),
  color: z.enum(["yellow", "green", "blue", "pink"]),
  isPublic: z.boolean(),
});

// ハイライト更新
export const updateHighlightSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  pageNumber: z.number().int().min(1).optional(),
  chapter: z.string().max(100).optional(),
  note: z.string().max(1000).optional(),
  color: z.enum(["yellow", "green", "blue", "pink"]).optional(),
  isPublic: z.boolean().optional(),
});

export type CreateHighlightInput = z.infer<typeof createHighlightSchema>;
export type UpdateHighlightInput = z.infer<typeof updateHighlightSchema>;

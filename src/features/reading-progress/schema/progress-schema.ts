import { z } from "zod";

// 読書進捗更新
export const updateProgressSchema = z.object({
  bookId: z.string().min(1),
  currentPage: z.number().int().min(0),
  pagesRead: z.number().int().min(0).optional(),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

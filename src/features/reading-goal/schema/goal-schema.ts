import { z } from "zod";

// 読書目標作成
export const createGoalSchema = z.object({
  type: z.enum(["yearly_books", "monthly_books", "genre_books", "pages"]),
  target: z.number().int().min(1).max(1000),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  genre: z.string().max(50).optional(),
});

// 読書目標更新
export const updateGoalSchema = z.object({
  target: z.number().int().min(1).max(1000).optional(),
  current: z.number().int().min(0).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

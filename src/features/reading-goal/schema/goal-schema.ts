import { z } from "zod";

// 読書目標作成
export const createGoalSchema = z
  .object({
    type: z.enum(["yearly_books", "monthly_books", "genre_books", "pages"]),
    target: z.number().int().min(1).max(1000),
    year: z.number().int().min(2020).max(2100),
    month: z.number().int().min(1).max(12).optional(),
    genre: z.string().max(50).optional(),
  })
  .refine((data) => data.type !== "monthly_books" || data.month !== undefined, {
    message: "月次目標には month が必要です",
    path: ["month"],
  })
  .refine((data) => data.type !== "genre_books" || data.genre !== undefined, {
    message: "ジャンル目標には genre が必要です",
    path: ["genre"],
  });

// 読書目標更新
export const updateGoalSchema = z.object({
  target: z.number().int().min(1).max(1000).optional(),
  current: z.number().int().min(0).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

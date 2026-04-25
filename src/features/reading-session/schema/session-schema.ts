import { z } from "zod";

// 読書セッション開始
export const startSessionSchema = z.object({
  bookId: z.string().min(1),
});

// 読書セッション終了
export const endSessionSchema = z.object({
  sessionId: z.string().min(1),
  pagesRead: z.number().int().min(0).optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;

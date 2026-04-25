import { z } from "zod";

// Review creation schema
export const createReviewSchema = z.object({
  bookId: z.string().min(1, "書籍IDは必須です"),
  content: z.string().min(10, "レビューは10文字以上必要です").max(5000, "レビューは5000文字以内です"),
  rating: z.number().int().min(1, "評価は1以上です").max(5, "評価は5以下です"),
  visibility: z.enum(["public", "private", "draft"]),
  publishAt: z.string().datetime().optional(),
});

// Review update schema
export const updateReviewSchema = z.object({
  content: z.string().min(10, "レビューは10文字以上必要です").max(5000, "レビューは5000文字以内です").optional(),
  rating: z.number().int().min(1).max(5).optional(),
  visibility: z.enum(["public", "private", "draft"]).optional(),
  publishAt: z.string().datetime().optional(),
});

// Review comment schema
export const createReviewCommentSchema = z.object({
  reviewId: z.string().min(1, "レビューIDは必須です"),
  content: z.string().min(1, "コメントを入力してください").max(1000, "コメントは1000文字以内です"),
});

// Review reaction schema
export const createReviewReactionSchema = z.object({
  reviewId: z.string().min(1, "レビューIDは必須です"),
  type: z.enum(["like", "clap", "sad", "surprise"], {
    message: "有効なリアクションタイプを選択してください",
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type CreateReviewCommentInput = z.infer<typeof createReviewCommentSchema>;
export type CreateReviewReactionInput = z.infer<typeof createReviewReactionSchema>;

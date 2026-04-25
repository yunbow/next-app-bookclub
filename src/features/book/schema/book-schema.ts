import { z } from "zod";

export const CreateBookSchema = z.object({
  isbn: z.string().min(1, "ISBNは必須です").regex(/^[\d-]{10,17}$/, "有効なISBNを入力してください"),
  title: z.string().min(1, "タイトルは必須です").max(200, "タイトルは200文字以内です"),
  author: z.string().max(100, "著者名は100文字以内です").optional(),
  publisher: z.string().max(100, "出版社名は100文字以内です").optional(),
  publishedYear: z.number().int().min(1000).max(9999).optional(),
  pages: z.number().int().min(1, "ページ数は1以上である必要があります").optional(),
  category: z.string().max(50, "カテゴリは50文字以内です").optional(),
  description: z.string().max(2000, "説明は2000文字以内です").optional(),
  coverImage: z.string().url("有効なURLを入力してください").optional(),
});

export const UpdateUserBookSchema = z.object({
  status: z.enum(["to_read", "reading", "completed", "paused"], {
    message: "有効なステータスを選択してください",
  }),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  memo: z.string().max(1000, "メモは1000文字以内です").optional(),
  currentPage: z.number().int().min(0).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const SearchBookSchema = z.object({
  query: z.string().min(1, "検索キーワードを入力してください"),
  searchType: z.enum(["title", "author", "isbn", "all"]).default("all"),
});

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
export type UpdateUserBookInput = z.infer<typeof UpdateUserBookSchema>;
export type SearchBookInput = z.infer<typeof SearchBookSchema>;

/** @deprecated Use CreateBookSchema instead */
export const createBookSchema = CreateBookSchema;
/** @deprecated Use UpdateUserBookSchema instead */
export const updateUserBookSchema = UpdateUserBookSchema;
/** @deprecated Use SearchBookSchema instead */
export const searchBookSchema = SearchBookSchema;

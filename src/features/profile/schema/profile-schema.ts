import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "ユーザー名を入力してください")
    .max(50, "ユーザー名は50文字以内です"),
  username: z
    .string()
    .min(3, "3文字以上")
    .max(20, "20文字以内")
    .regex(/^[a-zA-Z0-9_]+$/, "英数字とアンダースコアのみ"),
  image: z
    .string()
    .url("有効なURLを入力してください")
    .optional()
    .or(z.literal("")),
  genreIds: z.array(z.string()).max(20, "ジャンルは最大20件までです").optional(),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

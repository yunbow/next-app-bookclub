import { z } from "zod";

export const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
    newPassword: z
      .string()
      .min(8, "パスワードは8文字以上である必要があります"),
    confirmPassword: z.string().min(1, "パスワード確認を入力してください"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "新しいパスワードは現在のパスワードと異なる必要があります",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "新しいパスワードが一致しません",
    path: ["confirmPassword"],
  });

export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;

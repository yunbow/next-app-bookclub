import { z } from "zod";

export const CreateEventSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(200, "タイトルは200文字以内です"),
  description: z.string().max(2000, "説明は2000文字以内です").optional(),
  eventDate: z.string()
    .min(1, "開催日時は必須です")
    .refine(
      (val) => {
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?Z?$/;
        const localRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        return isoRegex.test(val) || localRegex.test(val);
      },
      "有効な日時を入力してください"
    ),
  location: z.string().max(200, "場所は200文字以内です").optional(),
  isOnline: z.boolean(),
  maxParticipants: z.number().int().min(1, "定員は1人以上です").max(1000, "定員は1000人以下です").optional(),
  requiresApproval: z.boolean(),
  theme: z.string().max(200, "テーマは200文字以内です").optional(),
  bookId: z.string().optional(),
});

export const UpdateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().max(200).optional(),
  isOnline: z.boolean().optional(),
  maxParticipants: z.number().int().min(1).max(1000).optional(),
  requiresApproval: z.boolean().optional(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
});

export const ParticipateEventSchema = z.object({
  eventId: z.string().min(1, "イベントIDは必須です"),
  message: z.string().max(500, "メッセージは500文字以内です").optional(),
});

export const CreateEventReportSchema = z.object({
  eventId: z.string().min(1, "イベントIDは必須です"),
  content: z.string().min(10, "レポートは10文字以上必要です").max(5000, "レポートは5000文字以内です"),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type ParticipateEventInput = z.infer<typeof ParticipateEventSchema>;
export type CreateEventReportInput = z.infer<typeof CreateEventReportSchema>;

/** @deprecated Use CreateEventSchema instead */
export const createEventSchema = CreateEventSchema;
/** @deprecated Use UpdateEventSchema instead */
export const updateEventSchema = UpdateEventSchema;
/** @deprecated Use ParticipateEventSchema instead */
export const participateEventSchema = ParticipateEventSchema;
/** @deprecated Use CreateEventReportSchema instead */
export const createEventReportSchema = CreateEventReportSchema;

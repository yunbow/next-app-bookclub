import "server-only";
import { z } from "zod";

// See next-app-post/src/lib/config/env.ts for canonical template rationale.
const optionalString = <T extends z.ZodTypeAny>(inner: T) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    inner.optional(),
  );
const optionalUrl = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.url().optional(),
  );
const optionalEmail = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.email().optional(),
  );

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    LOG_LEVEL: optionalString(
      z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
    ),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    NEXTAUTH_SECRET: z
      .string()
      .min(32, "NEXTAUTH_SECRET must be at least 32 chars"),
    NEXTAUTH_URL: z.url("NEXTAUTH_URL must be a valid URL"),

    GOOGLE_CLIENT_ID: optionalString(z.string().min(1)),
    GOOGLE_CLIENT_SECRET: optionalString(z.string().min(1)),
    GITHUB_CLIENT_ID: optionalString(z.string().min(1)),
    GITHUB_CLIENT_SECRET: optionalString(z.string().min(1)),

    SMTP_HOST: optionalString(z.string().min(1)),
    SMTP_PORT: optionalString(z.string().min(1)),
    SMTP_USER: optionalString(z.string().min(1)),
    SMTP_PASSWORD: optionalString(z.string().min(1)),
    SMTP_FROM_EMAIL: optionalEmail(),
    SMTP_FROM_NAME: optionalString(z.string().min(1)),

    GOOGLE_BOOKS_API_KEY: optionalString(z.string().min(1)),

    MAINTENANCE_MODE: optionalString(z.enum(["true", "false"])),
    ADMIN_ALLOWED_IPS: optionalString(z.string().min(1)),

    CRON_SECRET: optionalString(z.string().min(32)),

    STRIPE_SECRET_KEY: optionalString(z.string().min(1)),
    STRIPE_WEBHOOK_SECRET: optionalString(z.string().min(1)),
    STRIPE_BASIC_PRICE_ID: optionalString(z.string().min(1)),
    STRIPE_PREMIUM_PRICE_ID: optionalString(z.string().min(1)),

    NEXT_PUBLIC_APP_URL: optionalUrl(),
  })
  .superRefine((v, ctx) => {
    const pairs: Array<[string, Array<string | undefined>]> = [
      ["Google OAuth", [v.GOOGLE_CLIENT_ID, v.GOOGLE_CLIENT_SECRET]],
      ["GitHub OAuth", [v.GITHUB_CLIENT_ID, v.GITHUB_CLIENT_SECRET]],
    ];
    for (const [name, keys] of pairs) {
      const setCount = keys.filter(
        (k) => k !== undefined && k.length > 0,
      ).length;
      if (setCount !== 0 && setCount !== keys.length) {
        ctx.addIssue({
          code: "custom",
          message: `${name} keys must be all-set or all-unset`,
        });
      }
    }
    const smtpCore = [v.SMTP_HOST, v.SMTP_USER, v.SMTP_PASSWORD];
    const smtpSet = smtpCore.filter(
      (k) => k !== undefined && k.length > 0,
    ).length;
    if (smtpSet !== 0 && smtpSet !== smtpCore.length) {
      ctx.addIssue({
        code: "custom",
        message:
          "SMTP_HOST / SMTP_USER / SMTP_PASSWORD must be all-set or all-unset",
      });
    }
  });

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = JSON.stringify(
    z.flattenError(parsed.error).fieldErrors,
    null,
    2,
  );
  throw new Error(`Invalid environment variables:\n${formatted}`);
}

export const env = parsed.data;

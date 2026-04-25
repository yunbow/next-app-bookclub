import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { ActionResult, ActionError } from "@/lib/types/action-result";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

interface WithActionOptions<D = unknown> {
  data?: unknown;
  schema?: ZodSchema<D>;
}

interface ActionContext<D> {
  validData?: D;
}

export async function withAction<T, D = unknown>(
  fn: (params: ActionContext<D>) => Promise<ActionResult<T>>,
  options: WithActionOptions<D> = {}
): Promise<ActionResult<T>> {
  try {
    let validData: D | undefined;

    if (options.schema && options.data !== undefined) {
      const parsed = options.schema.safeParse(options.data);
      if (!parsed.success) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
            fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
          },
        };
      }
      validData = parsed.data;
    }

    return await fn({ validData });
  } catch (error) {
    logger.error({ err: error }, "Unhandled error in server action");
    return {
      success: false,
      error: handleActionError(error),
    };
  }
}

export async function requireAuth(): Promise<
  | { success: true; userId: string }
  | { success: false; error: ActionError }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "認証が必要です" },
    };
  }
  return { success: true, userId: session.user.id };
}

export async function requireOwnership<T extends Record<string, unknown>>(
  resource: T | null,
  userId: string,
  ownerField: keyof T = "userId" as keyof T
): Promise<
  | { success: true; resource: T }
  | { success: false; error: ActionError }
> {
  if (!resource) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "リソースが見つかりません" },
    };
  }
  if (resource[ownerField] !== userId) {
    logger.error(
      {
        type: "authorization_failure",
        severity: "high",
        userId,
        ownerId: resource[ownerField],
      },
      "Unauthorized resource access attempt"
    );
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "権限がありません" },
    };
  }
  return { success: true, resource };
}

export function handleActionError(error: unknown): ActionError {
  if (error instanceof ZodError) {
    return {
      code: "VALIDATION_ERROR",
      message: "入力が正しくありません",
      fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (error instanceof Error && "code" in error) {
    const prismaCode = (error as Error & { code: string }).code;

    if (prismaCode === "P2002") {
      return {
        code: "ALREADY_EXISTS",
        message: "このリソースは既に存在します",
      };
    }

    if (prismaCode === "P2025") {
      return {
        code: "NOT_FOUND",
        message: "リソースが見つかりません",
      };
    }
  }

  return {
    code: "INTERNAL_ERROR",
    message: "エラーが発生しました。時間を置いて再度お試しください。",
  };
}

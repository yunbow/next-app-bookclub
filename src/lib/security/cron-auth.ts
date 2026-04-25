import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/logger";

/**
 * Vercel Cron エンドポイント用の Bearer 認証ヘルパー。
 *
 * 返値:
 *   - `null`: 認証成功。呼び出し側は cron 本体の処理に進む。
 *   - `NextResponse`: 認証失敗。そのまま return して終了させる。
 *
 * fail-closed: `CRON_SECRET` が未設定なら常に 500 を返し、決して no-op で
 * 通さない。以前は `if (cronSecret && auth !== ...)` 形式で
 * 「secret 未設定なら誰でも通る」fail-open バグが bookclub / chat / flashcard
 * に存在した。本ヘルパーに集約することで同バグの再発を物理的に防ぐ。
 *
 * 検証順:
 *   1. `env.CRON_SECRET` が存在するか (未設定 → 500: server misconfigured)
 *   2. Authorization ヘッダが `Bearer ${env.CRON_SECRET}` と一致するか (不一致 → 401)
 */
export function assertCronAuth(request: NextRequest): NextResponse | null {
  if (!env.CRON_SECRET) {
    logger.error(
      { path: request.nextUrl.pathname },
      "Cron endpoint called but CRON_SECRET is not configured",
    );
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    logger.warn(
      {
        ip: request.headers.get("x-forwarded-for"),
        userAgent: request.headers.get("user-agent"),
        path: request.nextUrl.pathname,
      },
      "Unauthorized cron request",
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

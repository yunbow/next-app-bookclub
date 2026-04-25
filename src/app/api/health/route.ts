import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEALTH_TIMEOUT_MS = 2000;

/**
 * Canonical /api/health — liveness + readiness in one endpoint.
 *
 * 200 ok: app is up, DB reachable, cache reachable (or not configured).
 * 503 degraded: at least one required dep is unhealthy.
 *
 * Response body is informational (env, uptime, per-check latency) but
 * intentionally free of secrets and schema details.
 *
 * Edge Runtime 不可: prisma と pino は Node のみ動作。`runtime = "nodejs"` を明示。
 */

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timeout after ${ms}ms`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function checkDb(): Promise<string> {
  try {
    await withTimeout(
      prisma.$queryRaw`SELECT 1`,
      HEALTH_TIMEOUT_MS,
      "db",
    );
    return "ok";
  } catch (e) {
    return e instanceof Error ? `fail: ${e.message}` : "fail";
  }
}

async function checkRedis(): Promise<string> {
  // Upstash REST は @upstash/redis 依存を持たないアプリでも動作するよう fetch 直叩き。
  // env.ts 経由ではなく process.env を直接読むのは、Upstash 未宣言のアプリでも
  // このテンプレがそのまま使えるようにするため（型エラー回避）。
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return "not_configured";
  try {
    const res = await withTimeout(
      fetch(`${url}/ping`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      HEALTH_TIMEOUT_MS,
      "redis",
    );
    if (!res.ok) return `fail: http ${res.status}`;
    return "ok";
  } catch (e) {
    return e instanceof Error ? `fail: ${e.message}` : "fail";
  }
}

export async function GET() {
  const start = Date.now();
  const [db, redis] = await Promise.all([checkDb(), checkRedis()]);
  // Redis 未設定は "not_configured" を OK 扱い。DB は必須。
  const allOk =
    db === "ok" && (redis === "ok" || redis === "not_configured");

  const body = {
    status: allOk ? "ok" : "degraded",
    checks: { db, redis },
    latencyMs: Date.now() - start,
    uptime: Math.round(process.uptime()),
    env: process.env.NODE_ENV ?? "unknown",
    timestamp: new Date().toISOString(),
  } as const;

  if (!allOk) {
    // logger が無いアプリ (todo) でも動作するよう console を使う。
    // eslint-disable-next-line no-console
    console.error("[health] degraded", body);
  }

  return NextResponse.json(body, { status: allOk ? 200 : 503 });
}

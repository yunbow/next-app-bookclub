import "server-only";
import { prisma } from "@/lib/prisma";
import type { PlanType } from "./plans";

const PLAN_ORDER: PlanType[] = ["free", "basic", "premium"];

export async function getUserPlan(userId: string): Promise<PlanType> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });

  if (
    !sub ||
    sub.status === "canceled" ||
    sub.status === "unpaid" ||
    sub.status === "incomplete_expired"
  ) {
    return "free";
  }

  return (sub.plan as PlanType) ?? "free";
}

export function hasMinPlan(userPlan: PlanType, minPlan: PlanType): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(minPlan);
}

export const PLAN_LIMITS: Record<string, Record<PlanType, number>> = {
  highlights: { free: 10, basic: 50, premium: Infinity },
  groups: { free: 3, basic: Infinity, premium: Infinity },
};

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserPlan } from "@/lib/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ plan: "free" });
  }

  const plan = await getUserPlan(session.user.id);
  return NextResponse.json({ plan });
}

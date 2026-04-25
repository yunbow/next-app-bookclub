import { auth } from "@/lib/auth";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { PlanType } from "@/lib/plans";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const plan = body.plan as PlanType;

  if (!plan || plan === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  let customerId = subscription?.stripeCustomerId ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings/billing?canceled=true`,
    metadata: { userId: session.user.id, plan },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

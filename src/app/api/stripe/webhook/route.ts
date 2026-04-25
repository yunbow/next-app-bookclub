import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

function periodDates(invoice: Stripe.Invoice | null) {
  return {
    currentPeriodStart: invoice?.period_start
      ? new Date(invoice.period_start * 1000)
      : null,
    currentPeriodEnd: invoice?.period_end
      ? new Date(invoice.period_end * 1000)
      : null,
  };
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (!userId || !plan || !subscriptionId) break;

      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["latest_invoice"],
      });

      const invoice = stripeSub.latest_invoice as Stripe.Invoice | null;
      const { currentPeriodStart, currentPeriodEnd } = periodDates(invoice);

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: stripeSub.items.data[0].price.id,
          plan,
          status: stripeSub.status,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        },
        update: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: stripeSub.items.data[0].price.id,
          plan,
          status: stripeSub.status,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const stripeSub = event.data.object as Stripe.Subscription;
      const customerId = stripeSub.customer as string;
      const priceId = stripeSub.items.data[0].price.id;

      let plan = "free";
      if (priceId === process.env.STRIPE_BASIC_PRICE_ID) plan = "basic";
      else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) plan = "premium";

      const subWithInvoice = await stripe.subscriptions.retrieve(stripeSub.id, {
        expand: ["latest_invoice"],
      });
      const invoice = subWithInvoice.latest_invoice as Stripe.Invoice | null;
      const { currentPeriodStart, currentPeriodEnd } = periodDates(invoice);

      await prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan,
          status: stripeSub.status,
          stripePriceId: priceId,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const stripeSub = event.data.object as Stripe.Subscription;
      const customerId = stripeSub.customer as string;

      await prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan: "free",
          status: "canceled",
          stripeSubscriptionId: null,
          stripePriceId: null,
          cancelAtPeriodEnd: false,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

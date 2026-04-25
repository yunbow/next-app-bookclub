import "server-only";
import Stripe from "stripe";

const config: Stripe.StripeConfig = {
  apiVersion: "2026-02-25.clover",
  typescript: true,
};

if (process.env.STRIPE_MOCK_HOST) {
  config.host = process.env.STRIPE_MOCK_HOST;
  config.port = parseInt(process.env.STRIPE_MOCK_PORT ?? "12111");
  config.protocol = "http";
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, config);

export const STRIPE_PRICE_IDS: Record<string, string | undefined> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
};

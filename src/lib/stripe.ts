import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export const STRIPE_PRICE_IDS: Record<string, string | undefined> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
};

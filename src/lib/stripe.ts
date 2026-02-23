/**
 * Stripe configuration and client helper.
 *
 * Uses test keys during development — Stripe is in test mode.
 */

import Stripe from "stripe";

// Singleton Stripe client
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

// Price IDs (configured in Stripe dashboard)
export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "price_1T46Yb6TbFt3vZ69Rz5eE2n8",
  annual: process.env.STRIPE_ANNUAL_PRICE_ID || "price_1T46Yv6TbFt3vZ69klPXgdgT",
} as const;

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

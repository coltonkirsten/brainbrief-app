/**
 * Stripe configuration and client helper.
 *
 * Uses test keys during development — Stripe is in test mode.
 * All env vars are required — no silent fallbacks to prevent
 * test/live mode mismatches.
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

// Price IDs (configured in Stripe dashboard — no fallbacks to prevent test/live mismatch)
export function getStripePrices() {
  const monthly = process.env.STRIPE_MONTHLY_PRICE_ID;
  const annual = process.env.STRIPE_ANNUAL_PRICE_ID;
  if (!monthly || !annual) {
    throw new Error("STRIPE_MONTHLY_PRICE_ID and STRIPE_ANNUAL_PRICE_ID must be set");
  }
  return { monthly, annual } as const;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return secret;
}

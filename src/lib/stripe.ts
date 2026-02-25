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
    const rawKey = process.env.STRIPE_SECRET_KEY;
    if (!rawKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    // Defensive: trim whitespace/newlines that break HTTP auth headers
    const secretKey = rawKey.trim();

    // Validate key format
    if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
      console.error(
        "[stripe] Invalid STRIPE_SECRET_KEY format — expected sk_test_* or sk_live_*"
      );
      throw new Error("STRIPE_SECRET_KEY has invalid format");
    }

    const mode = secretKey.startsWith("sk_live_") ? "live" : "test";
    console.log(`[stripe] Initializing Stripe client in ${mode} mode`);

    stripeClient = new Stripe(secretKey, {
      maxNetworkRetries: 3,
      timeout: 30000, // 30s — well within Vercel function limits
    });
  }
  return stripeClient;
}

// Price IDs (configured in Stripe dashboard — no fallbacks to prevent test/live mismatch)
export function getStripePrices() {
  const monthly = process.env.STRIPE_MONTHLY_PRICE_ID?.trim();
  const annual = process.env.STRIPE_ANNUAL_PRICE_ID?.trim();
  if (!monthly || !annual) {
    throw new Error(
      "STRIPE_MONTHLY_PRICE_ID and STRIPE_ANNUAL_PRICE_ID must be set"
    );
  }
  return { monthly, annual } as const;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return secret;
}

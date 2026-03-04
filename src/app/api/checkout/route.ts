import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe, getStripePrices } from "@/lib/stripe";
import Stripe from "stripe";

// Allow up to 60s for Stripe API calls + retries
export const maxDuration = 60;

/**
 * Create a Stripe Checkout Session for subscription.
 *
 * POST /api/checkout
 * Body: { plan: "monthly" | "annual" }
 *
 * Billing starts immediately on subscription — no Stripe-level trial.
 * Our app trial is managed independently via profiles.trial_ends_at.
 */
export async function POST(request: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    let body: { plan?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const plan = body.plan as "monthly" | "annual";

    if (!plan || !["monthly", "annual"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'monthly' or 'annual'." },
        { status: 400 }
      );
    }

    const prices = getStripePrices();
    const priceId = prices[plan];

    // Get user profile for trial info and existing Stripe customer
    const adminDb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll() { return []; }, setAll() {} } }
    );

    const { data: profile } = await adminDb
      .from("profiles")
      .select("trial_ends_at, subscription_status, stripe_customer_id, stripe_subscription_id, email")
      .eq("user_id", user.id)
      .maybeSingle();

    // Guard: reject if user already has an active subscription
    if (profile?.subscription_status === "active" && profile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "You already have an active subscription." },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const email = profile?.email || user.email || "";

    // Reuse existing Stripe customer or create reference for new one
    const customerId = profile?.stripe_customer_id || undefined;

    // Subscription data with metadata
    // NOTE: We never set trial_end on Stripe. Our app trial is managed
    // independently via the profiles.trial_ends_at column. When a user
    // subscribes (during or after trial), Stripe billing starts immediately.
    // This prevents Stripe Checkout from showing confusing "$0 today" UI.
    const subscriptionData: Stripe.Checkout.SessionCreateParams["subscription_data"] = {
      metadata: {
        supabase_user_id: user.id,
        plan_type: plan,
      },
    };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: subscriptionData,
      success_url: `${getBaseUrl()}/dashboard?checkout=success`,
      cancel_url: `${getBaseUrl()}/subscribe?checkout=canceled`,
      metadata: {
        supabase_user_id: user.id,
        plan_type: plan,
      },
    };

    // Set customer identification — can't pass both customer and customer_email
    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = email;
    }

    const baseUrl = getBaseUrl();
    console.log("[checkout] Creating session for user:", user.id, "plan:", plan, "base_url:", baseUrl);

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("[checkout] Session created:", session.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Capture Stripe-specific error details
    if (err instanceof Stripe.errors.StripeError) {
      console.error("[checkout] Stripe error:", {
        type: err.type,
        code: err.code,
        message: err.message,
        param: err.param,
        statusCode: err.statusCode,
      });
      return NextResponse.json(
        { error: `Checkout failed: ${err.message}` },
        { status: err.statusCode || 500 }
      );
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[checkout] Error creating session:", message);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

function getBaseUrl(): string {
  const url = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.brainbrief.app"
  ).trim().replace(/\/+$/, "");
  return url;
}

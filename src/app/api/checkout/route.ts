import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe, getStripePrices } from "@/lib/stripe";
import { getTrialInfo } from "@/lib/trial";
import Stripe from "stripe";

/**
 * Create a Stripe Checkout Session for subscription.
 *
 * POST /api/checkout
 * Body: { plan: "monthly" | "annual" }
 *
 * If user is still in trial (Day 1-7), sets trial_end on the Stripe
 * subscription so billing starts after trial expires.
 * If user is past trial (Day 8+), billing starts immediately.
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
      .select("trial_ends_at, subscription_status, stripe_customer_id, email")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = getStripe();
    const email = profile?.email || user.email || "";

    // Reuse existing Stripe customer or create reference for new one
    const customerId = profile?.stripe_customer_id || undefined;

    // Build checkout session params
    const trialInfo = getTrialInfo(
      profile ?? { trial_ends_at: null, subscription_status: "trialing" }
    );

    // Subscription data with metadata
    const subscriptionData: Stripe.Checkout.SessionCreateParams["subscription_data"] = {
      metadata: {
        supabase_user_id: user.id,
        plan_type: plan,
      },
    };

    // If user is still in trial, set trial_end so billing starts after trial expires.
    // Stripe requires trial_end to be at least 48 hours in the future.
    if (trialInfo.isTrialActive && profile?.trial_ends_at) {
      const trialEndTimestamp = Math.floor(
        new Date(profile.trial_ends_at).getTime() / 1000
      );
      const minTrialEnd = Math.floor(Date.now() / 1000) + (48 * 60 * 60); // 48h from now

      if (trialEndTimestamp > minTrialEnd) {
        // Trial ends more than 48h from now — sync with our trial
        subscriptionData.trial_end = trialEndTimestamp;
      } else if (trialEndTimestamp > Math.floor(Date.now() / 1000)) {
        // Trial ends within 48h — use Stripe's minimum (48h)
        subscriptionData.trial_end = minTrialEnd;
      }
      // If trial already ended (shouldn't happen since isTrialActive is true),
      // don't set trial_end — billing starts immediately
    }

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

    console.log("[checkout] Creating session for user:", user.id, "plan:", plan, "trial_active:", trialInfo.isTrialActive);

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
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://brainbrief-app.vercel.app"
  );
}

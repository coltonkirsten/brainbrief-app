import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe, STRIPE_PRICES } from "@/lib/stripe";
import { getTrialInfo } from "@/lib/trial";

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
    const body = await request.json();
    const plan = body.plan as "monthly" | "annual";

    if (!plan || !["monthly", "annual"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'monthly' or 'annual'." },
        { status: 400 }
      );
    }

    const priceId = STRIPE_PRICES[plan];

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
    let customerId = profile?.stripe_customer_id || undefined;

    // Build checkout session params
    const trialInfo = getTrialInfo(
      profile ?? { trial_ends_at: null, subscription_status: "trialing" }
    );

    // If user is still in trial, set subscription trial_end so billing starts after trial
    // Otherwise, billing starts immediately
    const subscriptionData: Record<string, unknown> = {
      metadata: {
        supabase_user_id: user.id,
        plan_type: plan,
      },
    };

    if (trialInfo.isTrialActive && profile?.trial_ends_at) {
      const trialEnd = Math.floor(
        new Date(profile.trial_ends_at).getTime() / 1000
      );
      subscriptionData.trial_end = trialEnd;
    }

    const sessionParams: Record<string, unknown> = {
      mode: "subscription",
      payment_method_types: ["card"],
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
      customer_email: customerId ? undefined : email,
      customer: customerId || undefined,
    };

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
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

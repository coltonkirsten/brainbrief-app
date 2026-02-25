import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import type Stripe from "stripe";

/**
 * Stripe webhook handler.
 *
 * POST /api/webhooks/stripe
 *
 * Handles:
 * - checkout.session.completed → activate subscription in DB
 * - customer.subscription.updated → update subscription status
 * - customer.subscription.deleted → mark as canceled
 * - invoice.payment_failed → mark subscription at risk
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`[webhook] Received event: ${event.type} (${event.id})`);

  // Service role client to update profiles (bypasses RLS)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabase, event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(supabase, event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[webhook] Error handling ${event.type}:`, message);
    // Return 200 anyway so Stripe doesn't retry indefinitely
    return NextResponse.json({ error: message }, { status: 200 });
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract current_period_end from a Stripe subscription (lives on items in SDK v20+) */
function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const item = subscription.items?.data?.[0];
  if (item && item.current_period_end) {
    return new Date(item.current_period_end * 1000).toISOString();
  }
  return null;
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createServerClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.supabase_user_id;
  const planType = session.metadata?.plan_type || "monthly";

  if (!userId) {
    console.error("[webhook] checkout.session.completed: no supabase_user_id in metadata");
    return;
  }

  console.log(`[webhook] Checkout completed for user ${userId}, plan: ${planType}`);

  // Get the subscription to extract details
  const stripe = getStripe();
  let stripeSubscriptionId = "";
  let currentPeriodEnd: string | null = null;
  const stripeCustomerId = (session.customer as string) || "";

  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    stripeSubscriptionId = subscription.id;
    currentPeriodEnd = getPeriodEnd(subscription);
  }

  // Update profile with subscription info
  const { error } = await supabase
    .from("profiles")
    .update({
      tier: "pro",
      subscription_status: "active",
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      current_period_end: currentPeriodEnd,
      plan_type: planType,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[webhook] Failed to update profile:", error);
    throw error;
  }

  console.log(`[webhook] User ${userId} subscription activated (${planType})`);
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createServerClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.supabase_user_id;

  if (!userId) {
    // Try to find user by stripe_customer_id
    const customerId = subscription.customer as string;
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (!profile) {
      console.error(
        `[webhook] subscription.updated: can't find user for customer ${customerId}`
      );
      return;
    }

    await updateSubscriptionInDb(supabase, profile.user_id, subscription);
    return;
  }

  await updateSubscriptionInDb(supabase, userId, subscription);
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createServerClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.supabase_user_id;

  // Find user by metadata or customer ID
  let targetUserId = userId;
  if (!targetUserId) {
    const customerId = subscription.customer as string;
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (!profile) {
      console.error(
        `[webhook] subscription.deleted: can't find user for customer ${customerId}`
      );
      return;
    }
    targetUserId = profile.user_id;
  }

  console.log(`[webhook] Subscription deleted for user ${targetUserId}`);

  const { error } = await supabase
    .from("profiles")
    .update({
      tier: "free",
      subscription_status: "canceled",
      current_period_end: getPeriodEnd(subscription),
    })
    .eq("user_id", targetUserId);

  if (error) {
    console.error("[webhook] Failed to update profile on deletion:", error);
    throw error;
  }
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createServerClient>,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, email")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) {
    console.error(
      `[webhook] invoice.payment_failed: can't find user for customer ${customerId}`
    );
    return;
  }

  console.log(
    `[webhook] Payment failed for user ${profile.user_id} (${profile.email})`
  );

  const { error } = await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("user_id", profile.user_id);

  if (error) {
    console.error("[webhook] Failed to update profile on payment failure:", error);
    throw error;
  }
}

async function updateSubscriptionInDb(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  subscription: Stripe.Subscription
) {
  // Map Stripe status to our status
  let status: string;
  switch (subscription.status) {
    case "active":
    case "trialing":
      status = "active";
      break;
    case "past_due":
      status = "past_due";
      break;
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      status = "canceled";
      break;
    default:
      status = subscription.status;
  }

  const planType =
    subscription.metadata?.plan_type ||
    (subscription.items.data[0]?.price?.recurring?.interval === "year"
      ? "annual"
      : "monthly");

  const tier = status === "active" ? "pro" : "free";

  const { error } = await supabase
    .from("profiles")
    .update({
      tier,
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      current_period_end: getPeriodEnd(subscription),
      plan_type: planType,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[webhook] Failed to update subscription:", error);
    throw error;
  }

  console.log(
    `[webhook] Updated subscription for user ${userId}: status=${status}, plan=${planType}`
  );
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe";

export const maxDuration = 30;

/**
 * Create a Stripe Customer Portal session for subscription management.
 *
 * POST /api/billing/portal
 *
 * Redirects the user to Stripe's hosted portal where they can:
 * - View invoices
 * - Update payment method
 * - Cancel subscription
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Stripe customer ID from profile
    const adminDb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll() { return []; }, setAll() {} } }
    );

    const { data: profile } = await adminDb
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe first to manage billing." },
        { status: 404 }
      );
    }

    const stripe = getStripe();
    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.brainbrief.app"
    ).trim().replace(/\/+$/, "");

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[billing/portal] Error:", message);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}

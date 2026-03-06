import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe";

export const maxDuration = 30;

/**
 * DELETE /api/account/delete
 *
 * Permanently deletes the authenticated user's account:
 * 1. Cancels any active Stripe subscription
 * 2. Deletes all user data (feedback, briefings, topics, profile)
 * 3. Deletes the Supabase auth user via Admin API
 *
 * Required for GDPR/privacy compliance — users must be able to delete their data.
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    console.log(`[account/delete] Starting account deletion for user ${userId}`);

    // Admin client for bypassing RLS
    const adminDb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll() { return []; }, setAll() {} } }
    );

    // 1. Cancel Stripe subscription if exists
    const { data: profile } = await adminDb
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.stripe_subscription_id) {
      try {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        console.log(`[account/delete] Canceled Stripe subscription ${profile.stripe_subscription_id}`);
      } catch (stripeErr) {
        // Log but don't block deletion — subscription may already be canceled
        console.error("[account/delete] Stripe cancellation error:", stripeErr);
      }
    }

    // 2. Delete all user data (order matters for foreign key constraints)
    const tables = ["topic_feedback", "briefings", "topics", "profiles"] as const;
    for (const table of tables) {
      const { error } = await adminDb.from(table).delete().eq("user_id", userId);
      if (error) {
        console.error(`[account/delete] Error deleting from ${table}:`, error.message);
      } else {
        console.log(`[account/delete] Deleted from ${table}`);
      }
    }

    // 3. Delete the auth user via Supabase Admin API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const deleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!deleteRes.ok) {
      const body = await deleteRes.text();
      console.error(`[account/delete] Auth user deletion failed: ${deleteRes.status} ${body}`);
      return NextResponse.json(
        { error: "Failed to delete auth account. Please contact support@brainbrief.app." },
        { status: 500 }
      );
    }

    console.log(`[account/delete] Auth user deleted successfully`);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[account/delete] Unexpected error:", message);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support@brainbrief.app." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { generateBriefing } from "@/lib/gemini";
import { sendBriefingEmail } from "@/lib/email";
import { getTrialInfo } from "@/lib/trial";

// Allow up to 60s for Gemini generation + email delivery
export const maxDuration = 60;

const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

/**
 * Create a service-role Supabase client that bypasses RLS.
 * Used for DB writes (briefings table only has SELECT RLS policy).
 */
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );
}

/**
 * On-demand briefing generation for authenticated users.
 * Rate-limited to once per hour.
 */
export async function POST() {
  const startTime = Date.now();

  try {
    // User-scoped client for auth + reading user data (respects RLS)
    const supabase = await createClient();

    // Verify the user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Service-role client for DB writes (bypasses RLS)
    const adminDb = createServiceClient();

    // Check rate limit — look at the most recent briefing
    const { data: lastBriefing } = await adminDb
      .from("briefings")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastBriefing) {
      const lastCreated = new Date(lastBriefing.created_at).getTime();
      const elapsed = Date.now() - lastCreated;
      if (elapsed < RATE_LIMIT_MS) {
        const minutesLeft = Math.ceil((RATE_LIMIT_MS - elapsed) / 60000);
        return NextResponse.json(
          {
            error: "Rate limited",
            message: `You can generate a new briefing in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
          },
          { status: 429 }
        );
      }
    }

    // Get user's active topics
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("name")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (topicsError) {
      console.error("[generate] Topics fetch error:", topicsError);
      return NextResponse.json(
        { error: "Failed to fetch topics" },
        { status: 500 }
      );
    }

    if (!topics || topics.length === 0) {
      return NextResponse.json(
        { error: "No topics", message: "Add at least one topic before generating a briefing." },
        { status: 400 }
      );
    }

    const topicNames = topics.map((t) => t.name);

    // Get user profile for display name and trial status
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email, trial_ends_at, subscription_status")
      .eq("user_id", user.id)
      .maybeSingle();

    // Check trial/subscription status
    const trialInfo = getTrialInfo(
      profile ?? { trial_ends_at: null, subscription_status: "trialing" }
    );

    if (!trialInfo.canGenerateBriefings) {
      return NextResponse.json(
        {
          error: "Trial expired",
          message:
            "Your free trial has ended. Subscribe to Brain Brief Pro to keep receiving briefings.",
        },
        { status: 403 }
      );
    }

    // Generate briefing with Gemini + grounding
    console.log(`[generate] Starting Gemini for user ${user.id}, topics: ${topicNames.join(", ")}`);
    const briefing = await generateBriefing(
      topicNames,
      profile?.display_name
    );

    if (!briefing.contentHtml) {
      console.error("[generate] Gemini returned empty content");
      return NextResponse.json(
        { error: "Generation failed", message: "AI returned empty content. Please try again." },
        { status: 500 }
      );
    }

    // Check if this is the user's first briefing (for welcome section)
    const { count: existingCount } = await adminDb
      .from("briefings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const isFirstBriefing = (existingCount ?? 0) === 0;

    // Store in database (using admin client to bypass RLS)
    const { error: insertError } = await adminDb
      .from("briefings")
      .insert({
        user_id: user.id,
        content_html: briefing.contentHtml,
        content_text: briefing.contentText,
        topics_covered: briefing.topicsCovered,
      });

    if (insertError) {
      console.error("[generate] DB insert error:", JSON.stringify(insertError));
      return NextResponse.json(
        { error: "Failed to save briefing" },
        { status: 500 }
      );
    }

    // Send email if we have their address
    const emailAddress = profile?.email || user.email;
    if (emailAddress) {
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      const emailResult = await sendBriefingEmail({
        to: emailAddress,
        subject: `Your Brain Brief — ${today}`,
        html: briefing.contentHtml,
        text: briefing.contentText,
        structured: briefing.structured,
        trialInfo,
        isFirstBriefing,
      });

      if (emailResult.success) {
        await adminDb
          .from("briefings")
          .update({ sent_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .is("sent_at", null)
          .order("created_at", { ascending: false })
          .limit(1);
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(`[generate] Success for user ${user.id} in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      elapsed: `${elapsed}ms`,
      topicsCovered: briefing.topicsCovered,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const stack = err instanceof Error ? err.stack : "";
    console.error("[generate] Unhandled error:", message, stack);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

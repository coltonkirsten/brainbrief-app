import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateBriefing } from "@/lib/gemini";
import { sendBriefingEmail } from "@/lib/email";
import { getTrialInfo } from "@/lib/trial";
import { processLifecycleEmails } from "@/lib/lifecycle-emails";

// Allow up to 300s for processing multiple users
export const maxDuration = 300;

/**
 * Cron endpoint: generates and sends briefings for users.
 * Called by Vercel Cron hourly. Each run filters users by preferred
 * delivery time in their timezone — only users whose preferred hour
 * matches the current local hour get briefings.
 *
 * Pipeline:
 * 1. Fetch all users who have active topics
 * 2. Filter to users whose preferred delivery hour matches now (in their tz)
 * 3. For each matched user, call Gemini with grounding to research their topics
 * 4. Store the briefing in Supabase
 * 5. Send the briefing via email (Resend, or stub if not configured)
 * 6. Process post-trial emails (Day 8 + Day 10 standalone emails)
 */

/**
 * Get the current hour (0-23) in a given IANA timezone.
 * Uses the Intl API which handles DST automatically.
 */
function getCurrentHourInTimezone(timezone: string): number {
  try {
    const hourStr = new Date().toLocaleString("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    });
    return parseInt(hourStr, 10);
  } catch {
    // Invalid timezone — fall back to UTC
    return new Date().getUTCHours();
  }
}
export async function GET(request: Request) {
  const startTime = Date.now();

  // Verify cron secret to prevent unauthorized access
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron] CRON_SECRET is not set — refusing to run");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[cron] Starting briefing generation at", new Date().toISOString());

  // Use service role client to bypass RLS (we need to read all users)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );

  // Step 1: Get all users with their active topics
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("user_id, name")
    .eq("is_active", true);

  if (topicsError) {
    console.error("[cron] Failed to fetch topics:", topicsError);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }

  if (!topics || topics.length === 0) {
    console.log("[cron] No active topics found. Skipping.");
    return NextResponse.json({
      success: true,
      message: "No active topics found",
      usersProcessed: 0,
    });
  }

  // Group topics by user
  const userTopics = new Map<string, string[]>();
  for (const topic of topics) {
    const existing = userTopics.get(topic.user_id) || [];
    existing.push(topic.name);
    userTopics.set(topic.user_id, existing);
  }

  console.log(`[cron] Found ${userTopics.size} users with active topics`);

  // Step 2: Get user profiles for display names, emails, and trial status
  const userIds = Array.from(userTopics.keys());
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, display_name, email, timezone, preferred_time, trial_ends_at, subscription_status")
    .in("user_id", userIds);

  if (profilesError) {
    console.error("[cron] Failed to fetch profiles:", profilesError);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p])
  );

  // Step 3: Filter users whose preferred delivery hour matches the current
  // hour in their timezone. Each hourly cron run only processes matching users.
  const usersToProcess: [string, string[]][] = [];

  for (const [userId, topicNames] of userTopics) {
    const profile = profileMap.get(userId);
    if (!profile) continue;

    // Parse preferred hour from "HH:MM" string (e.g., "06:00" → 6)
    const preferredHour = parseInt(
      (profile.preferred_time ?? "06:00").split(":")[0],
      10
    );

    // Get the current hour in the user's timezone
    const currentHour = getCurrentHourInTimezone(
      profile.timezone ?? "America/New_York"
    );

    if (currentHour !== preferredHour) {
      continue; // Not this user's delivery hour
    }

    usersToProcess.push([userId, topicNames]);
  }

  console.log(
    `[cron] ${usersToProcess.length} of ${userTopics.size} users matched for this hour`
  );

  if (usersToProcess.length === 0) {
    // Still process lifecycle emails even when no briefings are due
    console.log("[cron] Processing post-trial lifecycle emails...");
    let lifecycleResult = { sent: 0, errors: 0, details: [] as string[] };
    try {
      lifecycleResult = await processLifecycleEmails(supabase);
      if (lifecycleResult.sent > 0) {
        console.log(`[cron] Lifecycle emails: ${lifecycleResult.sent} sent`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[cron] Lifecycle email processing failed:", msg);
    }

    return NextResponse.json({
      success: true,
      message: "No users matched for this hour",
      usersProcessed: 0,
      lifecycleSent: lifecycleResult.sent,
    });
  }

  // Step 4: Generate and send briefings for matched users
  const results: {
    userId: string;
    success: boolean;
    error?: string;
  }[] = [];

  for (const [userId, topicNames] of usersToProcess) {
    const profile = profileMap.get(userId);
    if (!profile) {
      console.warn(`[cron] No profile found for user ${userId}, skipping`);
      results.push({ userId, success: false, error: "No profile found" });
      continue;
    }

    // Check trial/subscription status — skip users who can't receive briefings
    const trialInfo = getTrialInfo(profile);
    if (!trialInfo.canGenerateBriefings) {
      console.log(
        `[cron] Skipping ${profile.email} — trial expired, no active subscription (status: ${trialInfo.subscriptionStatus})`
      );
      results.push({
        userId,
        success: false,
        error: "Trial expired, no active subscription",
      });
      continue;
    }

    // Guard: skip if user already received a briefing today (prevents
    // double-sends from DST transitions or mid-day preference changes)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { data: existingBriefing } = await supabase
      .from("briefings")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString())
      .limit(1)
      .maybeSingle();

    if (existingBriefing) {
      console.log(`[cron] Skipping ${profile.email} — already briefed today`);
      results.push({ userId, success: true });
      continue;
    }

    try {
      console.log(
        `[cron] Generating briefing for ${profile.email} (${topicNames.length} topics: ${topicNames.join(", ")})`
      );

      // Generate briefing with Gemini + grounding
      const briefing = await generateBriefing(
        topicNames,
        profile.display_name,
        profile.timezone
      );

      // Store in database
      const { error: insertError } = await supabase
        .from("briefings")
        .insert({
          user_id: userId,
          content_html: briefing.contentHtml,
          content_text: briefing.contentText,
          topics_covered: briefing.topicsCovered,
          grounded: briefing.grounded,
        });

      if (insertError) {
        console.error(
          `[cron] Failed to store briefing for ${profile.email}:`,
          insertError
        );
        results.push({
          userId,
          success: false,
          error: `DB insert failed: ${insertError.message}`,
        });
        continue;
      }

      // Always send email — grounded briefings get citations, ungrounded get
      // an honest "overview" (no fake dates). Users signed up for daily briefings.
      let emailSent = false;
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      const emailResult = await sendBriefingEmail({
        to: profile.email,
        subject: `Your Brain Brief — ${today}`,
        html: briefing.contentHtml,
        text: briefing.contentText,
        structured: briefing.structured,
        trialInfo,
        grounded: briefing.grounded,
      });

      if (emailResult.success) {
        emailSent = true;
        // Update sent_at timestamp
        await supabase
          .from("briefings")
          .update({ sent_at: new Date().toISOString() })
          .eq("user_id", userId)
          .is("sent_at", null)
          .order("created_at", { ascending: false })
          .limit(1);
      }

      console.log(
        `[cron] Briefing for ${profile.email}: generated=true, grounded=${briefing.grounded}, emailed=${emailSent}`
      );

      results.push({ userId, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `[cron] Error generating briefing for ${profile.email}:`,
        message
      );
      results.push({ userId, success: false, error: message });
    }
  }

  // Step 6: Process post-trial lifecycle emails (Day 8 + Day 10 standalone emails)
  console.log("[cron] Processing post-trial lifecycle emails...");
  let lifecycleResult = { sent: 0, errors: 0, details: [] as string[] };
  try {
    lifecycleResult = await processLifecycleEmails(supabase);
    console.log(
      `[cron] Lifecycle emails: ${lifecycleResult.sent} sent, ${lifecycleResult.errors} errors`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron] Lifecycle email processing failed:", msg);
    lifecycleResult.errors = 1;
    lifecycleResult.details = [`Fatal error: ${msg}`];
  }

  const elapsed = Date.now() - startTime;
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log(
    `[cron] Done in ${elapsed}ms. Briefings: ${successCount} ok, ${failCount} failed. Lifecycle: ${lifecycleResult.sent} sent.`
  );

  // Log full details server-side but redact PII from response
  console.log("[cron] Per-user results:", JSON.stringify(results));

  // Response body is minimal — detailed logs are server-side only
  return NextResponse.json({
    success: true,
    processed: successCount,
    failed: failCount,
  });
}

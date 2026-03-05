import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /api/feedback — 1-click feedback from email links
 *
 * Params: user, topic, briefing, rating (too_basic | spot_on | go_deeper)
 * Returns: HTML thank-you page
 * Idempotent: upserts on (user_id, topic_id, briefing_id) — clicking again updates the rating
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("user");
  const topicId = url.searchParams.get("topic");
  const briefingId = url.searchParams.get("briefing");
  const rating = url.searchParams.get("rating");

  // Validate all params present
  if (!userId || !topicId || !briefingId || !rating) {
    return new Response(buildThankYouPage("error", "Missing parameters — this link may be malformed."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Validate rating value
  const validRatings = ["too_basic", "spot_on", "go_deeper"];
  if (!validRatings.includes(rating)) {
    return new Response(buildThankYouPage("error", "Invalid rating value."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Validate UUID format (prevent injection)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId) || !uuidRegex.test(topicId) || !uuidRegex.test(briefingId)) {
    return new Response(buildThankYouPage("error", "Invalid link parameters."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Create admin client (bypass RLS — user isn't authenticated via session)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[feedback] Missing Supabase env vars");
    return new Response(buildThankYouPage("error", "Server configuration error."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  // Security: validate ownership — topic AND briefing must belong to this user
  const [topicCheck, briefingCheck] = await Promise.all([
    supabase.from("topics").select("id").eq("id", topicId).eq("user_id", userId).maybeSingle(),
    supabase.from("briefings").select("id").eq("id", briefingId).eq("user_id", userId).maybeSingle(),
  ]);

  if (!topicCheck.data || !briefingCheck.data) {
    return new Response(buildThankYouPage("error", "This feedback link is invalid or has expired."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Upsert feedback (idempotent — clicking again just updates the rating)
  const { error } = await supabase
    .from("topic_feedback")
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        briefing_id: briefingId,
        rating,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic_id,briefing_id" }
    );

  if (error) {
    console.error("[feedback] Upsert error:", error);
    return new Response(buildThankYouPage("error", "Something went wrong saving your feedback. Please try again."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Format rating for display
  const ratingLabels: Record<string, string> = {
    too_basic: "Too Basic",
    spot_on: "Spot On",
    go_deeper: "Go Deeper",
  };

  return new Response(buildThankYouPage("success", undefined, ratingLabels[rating] ?? rating), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

/**
 * Build a simple branded HTML thank-you page
 */
function buildThankYouPage(status: "success" | "error", errorMessage?: string, ratingLabel?: string): string {
  const isSuccess = status === "success";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? "Thanks!" : "Oops"} — Brain Brief</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      max-width: 440px;
      width: 100%;
      margin: 24px;
      padding: 48px 32px;
      background: #FFFFFF;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      text-align: center;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #0F172A;
    }
    .rating-badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 20px;
      background-color: #F0FDF4;
      color: #059669;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .error-text { color: #DC2626; }
    a.btn {
      display: inline-block;
      padding: 12px 28px;
      background-color: #0F172A;
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    a.btn:hover { background-color: #1E293B; }
    .logo {
      margin-top: 32px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 16px;
      color: #94A3B8;
    }
    .logo span { color: #10B981; }
  </style>
</head>
<body>
  <div class="card">
    ${isSuccess ? `
      <div class="icon">\u2705</div>
      <h1>Thanks for the feedback!</h1>
      ${ratingLabel ? `<div class="rating-badge">${ratingLabel}</div>` : ""}
      <p>This helps us calibrate your briefings over time. We\u2019re always tuning to get the depth right for you.</p>
    ` : `
      <div class="icon">\u26A0\uFE0F</div>
      <h1>Something went wrong</h1>
      <p class="error-text">${errorMessage || "An unexpected error occurred."}</p>
    `}
    <a href="https://www.brainbrief.app/dashboard" class="btn">Back to Dashboard</a>
    <p class="logo">Brain<span>Brief</span></p>
  </div>
</body>
</html>`;
}

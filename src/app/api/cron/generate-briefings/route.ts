import { NextResponse } from "next/server";

/**
 * Cron endpoint: generates and sends briefings for all users.
 * Called by Vercel Cron on a daily schedule.
 *
 * TODO: Implement full pipeline:
 * 1. Fetch all users with topics from Supabase
 * 2. For each user, call Gemini with grounding to research topics
 * 3. Generate HTML briefing content
 * 4. Send email via Resend
 * 5. Store briefing record in Supabase
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Stub: log and return success
  console.log("[cron] generate-briefings triggered at", new Date().toISOString());

  return NextResponse.json({
    success: true,
    message: "Briefing generation stub — pipeline not yet implemented",
    timestamp: new Date().toISOString(),
  });
}

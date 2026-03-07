import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

export const maxDuration = 15;

const VALID_CATEGORIES = [
  "feature_request",
  "bug_report",
  "content_quality",
  "general",
] as const;

/**
 * POST /api/feedback/submit
 *
 * Accepts user feedback from the /feedback page.
 * Stores in user_feedback table and sends email notification to support.
 *
 * Body: { category, message, email? }
 * - category: one of VALID_CATEGORIES
 * - message: 1–5000 chars
 * - email: optional (pre-filled if logged in on the frontend)
 */
export async function POST(request: Request) {
  try {
    // Parse body
    let body: { category?: string; message?: string; email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { category, message, email } = body;

    // Validate category
    if (
      !category ||
      !VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])
    ) {
      return NextResponse.json(
        { error: "Invalid category." },
        { status: 400 }
      );
    }

    // Validate message
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5,000 characters)." },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && typeof email === "string" && email.length > 320) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Check if user is logged in (optional — feedback works for anonymous users too)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? null;
    const submitterEmail = email?.trim() || user?.email || null;

    // Admin client for insert (bypasses RLS for service role, but our INSERT policy allows anyone)
    const adminDb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll() { return []; }, setAll() {} } }
    );

    // Store in database
    const { error: insertError } = await adminDb.from("user_feedback").insert({
      user_id: userId,
      email: submitterEmail,
      category,
      message: message.trim(),
    });

    if (insertError) {
      console.error("[feedback/submit] Insert error:", insertError.message);
      return NextResponse.json(
        { error: "Failed to save feedback. Please try again." },
        { status: 500 }
      );
    }

    // Send email notification to support
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Brain Brief <brief@brainbrief.app>";

    if (resendKey) {
      const categoryLabels: Record<string, string> = {
        feature_request: "Feature Request",
        bug_report: "Bug Report",
        content_quality: "Content Quality",
        general: "General Feedback",
      };

      const categoryLabel = categoryLabels[category] || category;

      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: fromEmail,
          to: "support@brainbrief.app",
          subject: `[Feedback] ${categoryLabel} from ${submitterEmail || "Anonymous"}`,
          text: [
            `New feedback submitted on Brain Brief`,
            ``,
            `Category: ${categoryLabel}`,
            `Email: ${submitterEmail || "Not provided"}`,
            `User ID: ${userId || "Anonymous"}`,
            ``,
            `Message:`,
            message.trim(),
            ``,
            `---`,
            `Submitted at ${new Date().toISOString()}`,
          ].join("\n"),
        });
      } catch (emailErr) {
        // Log but don't fail — feedback is already saved in DB
        console.error("[feedback/submit] Email notification error:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[feedback/submit] Unexpected error:", msg);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

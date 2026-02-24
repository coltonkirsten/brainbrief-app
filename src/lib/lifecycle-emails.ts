/**
 * Trial lifecycle email sequence.
 *
 * Sends conversion-focused emails at key moments during and after a user's
 * 14-day free trial. Called from the daily cron job.
 *
 * Sequence:
 *   Day  7 — Value recap (halfway)
 *   Day 12 — Urgency (3 days left)
 *   Day 14 — Last day
 *   Day 15 — Trial expired (no briefing, just this email)
 *   Day 30 — Win-back / re-engagement
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { generateTeaser } from "./gemini";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LifecycleEmailKey = "day8" | "day10";

interface LifecycleEmailDef {
  key: LifecycleEmailKey;
  /** Day number in the trial when this email fires (1-indexed, day 1 = signup day) */
  triggerDay: number;
  subject: (ctx: EmailContext) => string;
  buildHtml: (ctx: EmailContext) => string;
  buildText: (ctx: EmailContext) => string;
}

interface EmailContext {
  displayName: string | null;
  email: string;
  briefingCount: number;
  topicNames: string[];
  trialDay: number;
  daysRemaining: number;
  teaser?: string;
}

interface UserProfile {
  user_id: string;
  email: string;
  display_name: string | null;
  trial_ends_at: string | null;
  subscription_status: string;
  lifecycle_emails_sent: string[];
}

// ---------------------------------------------------------------------------
// Email definitions
// ---------------------------------------------------------------------------

const LIFECYCLE_EMAILS: LifecycleEmailDef[] = [
  {
    key: "day8",
    triggerDay: 8,
    subject: () => "Your Brain Brief trial has ended",
    buildHtml: (ctx) => buildLifecycleHtml({
      preheader: "Your topics are saved and waiting",
      headline: `${greeting(ctx)} Your 7-day trial is over.`,
      body: `
        <p style="${bodyStyle}">
          Today's briefing wasn't delivered &mdash; but your topics are saved and waiting.
        </p>
        <p style="${bodyStyle}">
          If Brain Brief earned a place in your morning, we'd love to keep it there.
        </p>`,
      ctaText: "Resume your briefings &rarr;",
      ctaSubtext: "$6/month &middot; $50/year &middot; Cancel anytime",
    }),
    buildText: (ctx) => `${greeting(ctx)} Your 7-day trial is over.\n\n` +
      "Today's briefing wasn't delivered — but your topics are saved and waiting.\n\n" +
      "If Brain Brief earned a place in your morning, we'd love to keep it there.\n\n" +
      "Resume your briefings: https://brainbrief.app/subscribe\n\n" +
      "$6/month · $50/year · Cancel anytime\n",
  },
  {
    key: "day10",
    triggerDay: 10,
    subject: (ctx) => ctx.topicNames.length > 0
      ? `Still curious about ${ctx.topicNames[0]}?`
      : "Your briefings miss you",
    buildHtml: (ctx) => buildLifecycleHtml({
      preheader: "The world didn't stop.",
      headline: `${greeting(ctx)} It's been a few days since your last Brain Brief.`,
      body: `
        <p style="${bodyStyle}">
          The world didn't stop. Here's a taste of what you missed${ctx.topicNames.length > 0 ? ` on <strong>${ctx.topicNames[0]}</strong>` : ""}:
        </p>
        <div style="margin: 0 0 16px 0; padding: 16px; border-left: 3px solid #6366F1; background-color: #F8FAFC; border-radius: 0 6px 6px 0;">
          <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; font-style: italic; color: #334155; line-height: 1.6;">
            ${ctx.teaser || "Developments continue in your selected topics."}
          </p>
        </div>
        <p style="${bodyStyle}">
          Your other topics have been moving too.
        </p>
        <p style="${bodyStyle}">
          This is our last note. We won't follow up again &mdash; but your account and topics will always be here if you change your mind.
        </p>`,
      ctaText: "Get your briefings back &rarr;",
      ctaSubtext: "",
    }),
    buildText: (ctx) => `${greeting(ctx)} It's been a few days since your last Brain Brief.\n\n` +
      `The world didn't stop. Here's a taste of what you missed${ctx.topicNames.length > 0 ? ` on ${ctx.topicNames[0]}` : ""}:\n\n` +
      `"${ctx.teaser || "Developments continue in your selected topics."}"\n\n` +
      "Your other topics have been moving too.\n\n" +
      "This is our last note. We won't follow up again — but your account and topics will always be here if you change your mind.\n\n" +
      "Get your briefings back: https://brainbrief.app/subscribe\n",
  }
];

// ---------------------------------------------------------------------------
// Main entry point — called from cron job
// ---------------------------------------------------------------------------

export async function processLifecycleEmails(
  supabase: SupabaseClient
): Promise<{ sent: number; errors: number; details: string[] }> {
  const logs: string[] = [];
  let sent = 0;
  let errors = 0;

  // Get all trialing users (active subscribers don't need lifecycle emails)
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, email, display_name, trial_ends_at, subscription_status, lifecycle_emails_sent")
    .in("subscription_status", ["trialing", "canceled"]);

  if (profilesError) {
    console.error("[lifecycle] Failed to fetch profiles:", profilesError);
    return { sent: 0, errors: 1, details: [`Failed to fetch profiles: ${profilesError.message}`] };
  }

  if (!profiles || profiles.length === 0) {
    return { sent: 0, errors: 0, details: ["No trialing users found"] };
  }

  for (const profile of profiles as UserProfile[]) {
    // Skip users who converted to paid
    if (profile.subscription_status === "active") continue;

    // Calculate trial day
    if (!profile.trial_ends_at) continue;
    const trialEndsAt = new Date(profile.trial_ends_at);
    const now = new Date();
    const trialStartedAt = new Date(trialEndsAt.getTime() - 7 * 24 * 60 * 60 * 1000);
    const trialDay = Math.floor((now.getTime() - trialStartedAt.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const alreadySent = profile.lifecycle_emails_sent || [];

    // Check each lifecycle email
    for (const emailDef of LIFECYCLE_EMAILS) {
      // Skip if not yet time
      if (trialDay < emailDef.triggerDay) continue;

      // Skip if already sent
      if (alreadySent.includes(emailDef.key)) continue;

      // Don't send old emails — only send if we're within 2 days of the trigger
      // (prevents sending day 7 email on day 14 for a user who just appeared)
      if (trialDay > emailDef.triggerDay + 2) {
        // Mark as sent so we don't keep checking
        await markEmailSent(supabase, profile.user_id, alreadySent, emailDef.key);
        logs.push(`[skip] ${profile.email}: ${emailDef.key} (past window, day ${trialDay})`);
        continue;
      }

      // Build context — fetch briefing count and topics
      const ctx = await buildEmailContext(supabase, profile, trialDay);

      try {
        const subject = emailDef.subject(ctx);
        const html = emailDef.buildHtml(ctx);
        const text = emailDef.buildText(ctx);

        await sendLifecycleEmail({
          to: profile.email,
          subject,
          html,
          text,
        });

        // Record that we sent this email
        await markEmailSent(supabase, profile.user_id, alreadySent, emailDef.key);

        sent++;
        logs.push(`[sent] ${profile.email}: ${emailDef.key} (day ${trialDay})`);
        console.log(`[lifecycle] Sent ${emailDef.key} to ${profile.email} (trial day ${trialDay})`);
      } catch (err) {
        errors++;
        const msg = err instanceof Error ? err.message : "Unknown error";
        logs.push(`[error] ${profile.email}: ${emailDef.key} — ${msg}`);
        console.error(`[lifecycle] Failed to send ${emailDef.key} to ${profile.email}:`, msg);
      }
    }
  }

  return { sent, errors, details: logs };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function buildEmailContext(
  supabase: SupabaseClient,
  profile: UserProfile,
  trialDay: number
): Promise<EmailContext> {
  // Fetch briefing count
  const { count } = await supabase
    .from("briefings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.user_id);

  // Fetch topic names
  const { data: topics } = await supabase
    .from("topics")
    .select("name")
    .eq("user_id", profile.user_id)
    .eq("is_active", true);
    
  const topicNames = (topics ?? []).map((t) => t.name);

  const trialEndsAt = new Date(profile.trial_ends_at!);
  const daysRemaining = Math.ceil(
    (trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  let teaser = undefined;
  if (trialDay === 10 && topicNames.length > 0) {
    try {
      teaser = await generateTeaser(topicNames[0]);
    } catch (err) {
      console.error("[lifecycle] Failed to generate teaser:", err);
    }
  }

  return {
    displayName: profile.display_name,
    email: profile.email,
    briefingCount: count ?? 0,
    topicNames,
    trialDay,
    daysRemaining,
    teaser,
  };
}

async function markEmailSent(
  supabase: SupabaseClient,
  userId: string,
  currentlySent: string[],
  key: LifecycleEmailKey
) {
  const updated = [...currentlySent, key];
  await supabase
    .from("profiles")
    .update({ lifecycle_emails_sent: updated })
    .eq("user_id", userId);
}

async function sendLifecycleEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[lifecycle-stub] Would send to: ${params.to}, subject: ${params.subject}`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const fromAddress =
    process.env.RESEND_FROM_EMAIL || "Brain Brief <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    headers: {
      "List-Unsubscribe": "<https://brainbrief.app/dashboard>",
    },
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }
}

function greeting(ctx: EmailContext): string {
  return ctx.displayName ? `Hi ${ctx.displayName},` : "Hi there,";
}

// ---------------------------------------------------------------------------
// Email template — clean, personal, text-focused
// ---------------------------------------------------------------------------

const bodyStyle =
  'margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #334155;';

function buildLifecycleHtml(params: {
  preheader: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaSubtext?: string;
  urgent?: boolean;
}): string {
  const year = new Date().getFullYear();
  const ctaBg = params.urgent ? "#DC2626" : "#4F46E5";
  const ctaHover = params.urgent ? "#B91C1C" : "#4338CA";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(params.headline)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0F172A !important; }
      .email-card { background-color: #1E293B !important; border-color: #334155 !important; }
      .text-heading { color: #F1F5F9 !important; }
      .text-body { color: #CBD5E1 !important; }
      .text-muted { color: #94A3B8 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(params.preheader)}</div>

  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBFBFD;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">

          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #E2E8F0;">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px;">
                Brain<span style="color: #6366F1;">Brief</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 class="text-heading" style="margin: 0 0 20px; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #0F172A; line-height: 1.4;">
                ${params.headline}
              </h2>

              ${params.body}

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 8px;">
                <tr>
                  <td align="center">
                    <a href="https://brainbrief.app/subscribe" style="display: inline-block; padding: 14px 32px; background-color: ${ctaBg}; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; mso-padding-alt: 0; text-align: center;">
                      <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
                      ${params.ctaText}
                      <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
                    </a>
                  </td>
                </tr>
                ${params.ctaSubtext ? `
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <p class="text-muted" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #94A3B8;">
                      ${params.ctaSubtext}
                    </p>
                  </td>
                </tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F8FAFC; text-align: center;">
              <p class="text-muted" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #94A3B8; line-height: 1.6;">
                You're receiving this because you signed up for Brain Brief.
                <br>
                <a href="https://brainbrief.app/dashboard" style="color: #64748B; text-decoration: underline;">Manage your account</a>
              </p>
            </td>
          </tr>

        </table>

        <p style="margin: 24px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #CBD5E1; text-align: center;">
          &copy; ${year} Brain Brief
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

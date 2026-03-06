/**
 * Post-trial email sequence.
 *
 * After a user's 7-day free trial ends, we send exactly two standalone emails:
 *
 *   Day  8 — "Your briefings have stopped" (trial ended notice)
 *   Day 10 — "Miss me?" follow-up with Gemini-generated topic teaser (final email ever)
 *
 * After Day 10, no more emails are sent. The user's account stays active
 * and they can subscribe at any time to resume briefings.
 *
 * Called from the daily cron job.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendStandaloneEmail } from "./email";
import { generateTeaser } from "./gemini";
import { TRIAL_DURATION_DAYS } from "./trial";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LifecycleEmailKey = "day8_trial_ended" | "day10_miss_me";

interface LifecycleEmailDef {
  key: LifecycleEmailKey;
  /** Day number (from trial start) when this email fires */
  triggerDay: number;
  subject: (ctx: EmailContext) => string;
  buildHtml: (ctx: EmailContext) => string;
  buildText: (ctx: EmailContext) => string;
}

interface EmailContext {
  displayName: string | null;
  email: string;
  topicNames: string[];
  /** Gemini-generated teaser about the user's first topic (Day 10 only) */
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
    key: "day8_trial_ended",
    triggerDay: TRIAL_DURATION_DAYS + 1, // Day 8
    subject: () => "Your Brain Brief trial has ended",
    buildHtml: (ctx) =>
      buildStandaloneHtml({
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
    buildText: (ctx) =>
      `${greeting(ctx)} Your 7-day trial is over.\n\n` +
      "Today's briefing wasn't delivered — but your topics are saved and waiting.\n\n" +
      "If Brain Brief earned a place in your morning, we'd love to keep it there.\n\n" +
      "Resume your briefings: https://www.brainbrief.app/subscribe\n\n" +
      "$6/month · $50/year · Cancel anytime\n",
  },
  {
    key: "day10_miss_me",
    triggerDay: TRIAL_DURATION_DAYS + 3, // Day 10
    subject: (ctx) =>
      ctx.topicNames.length > 0
        ? `Still curious about ${ctx.topicNames[0]}?`
        : "Your briefings miss you",
    buildHtml: (ctx) =>
      buildStandaloneHtml({
        preheader: "The world didn't stop.",
        headline: `${greeting(ctx)} It's been a few days since your last Brain Brief.`,
        body: `
          <p style="${bodyStyle}">
            The world didn't stop. Here's a taste of what you missed${ctx.topicNames.length > 0 ? ` on <strong>${escapeHtml(ctx.topicNames[0])}</strong>` : ""}:
          </p>
          <div class="lc-teaser" style="margin: 0 0 16px 0; padding: 16px; border-left: 3px solid #10B981; background-color: #F8FAFC; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; font-style: italic; color: #334155; line-height: 1.6;">
              ${escapeHtml(ctx.teaser || "Developments continue in your selected topics.")}
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
    buildText: (ctx) =>
      `${greeting(ctx)} It's been a few days since your last Brain Brief.\n\n` +
      `The world didn't stop. Here's a taste of what you missed${ctx.topicNames.length > 0 ? ` on ${ctx.topicNames[0]}` : ""}:\n\n` +
      `"${ctx.teaser || "Developments continue in your selected topics."}"\n\n` +
      "Your other topics have been moving too.\n\n" +
      "This is our last note. We won't follow up again — but your account and topics will always be here if you change your mind.\n\n" +
      "Get your briefings back: https://www.brainbrief.app/subscribe\n",
  },
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

  // Get users whose trial has expired but haven't subscribed
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(
      "user_id, email, display_name, trial_ends_at, subscription_status, lifecycle_emails_sent"
    )
    .in("subscription_status", ["trialing", "canceled"]);

  if (profilesError) {
    console.error("[lifecycle] Failed to fetch profiles:", profilesError);
    return {
      sent: 0,
      errors: 1,
      details: [`Failed to fetch profiles: ${profilesError.message}`],
    };
  }

  if (!profiles || profiles.length === 0) {
    return { sent: 0, errors: 0, details: ["No expired-trial users found"] };
  }

  for (const profile of profiles as UserProfile[]) {
    // Skip users who converted to paid
    if (profile.subscription_status === "active") continue;

    // Calculate trial day
    if (!profile.trial_ends_at) continue;
    const trialEndsAt = new Date(profile.trial_ends_at);
    const now = new Date();
    const trialStartedAt = new Date(
      trialEndsAt.getTime() - TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000
    );
    const trialDay =
      Math.floor(
        (now.getTime() - trialStartedAt.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Only process users whose trial has ended (day > 7)
    if (trialDay <= TRIAL_DURATION_DAYS) continue;

    const alreadySent = profile.lifecycle_emails_sent || [];

    for (const emailDef of LIFECYCLE_EMAILS) {
      // Skip if not yet time
      if (trialDay < emailDef.triggerDay) continue;

      // Skip if already sent
      if (alreadySent.includes(emailDef.key)) continue;

      // Don't send old emails — only send if within 2 days of trigger
      if (trialDay > emailDef.triggerDay + 2) {
        await markEmailSent(
          supabase,
          profile.user_id,
          alreadySent,
          emailDef.key
        );
        logs.push(
          `[skip] ${profile.email}: ${emailDef.key} (past window, day ${trialDay})`
        );
        continue;
      }

      // Build context
      const ctx = await buildEmailContext(supabase, profile, emailDef.key, trialDay);

      try {
        const subject = emailDef.subject(ctx);
        const html = emailDef.buildHtml(ctx);
        const text = emailDef.buildText(ctx);

        await sendStandaloneEmail({
          to: profile.email,
          subject,
          html,
          text,
        });

        await markEmailSent(
          supabase,
          profile.user_id,
          alreadySent,
          emailDef.key
        );

        sent++;
        logs.push(
          `[sent] ${profile.email}: ${emailDef.key} (day ${trialDay})`
        );
        console.log(
          `[lifecycle] Sent ${emailDef.key} to ${profile.email} (trial day ${trialDay})`
        );
      } catch (err) {
        errors++;
        const msg = err instanceof Error ? err.message : "Unknown error";
        logs.push(`[error] ${profile.email}: ${emailDef.key} — ${msg}`);
        console.error(
          `[lifecycle] Failed to send ${emailDef.key} to ${profile.email}:`,
          msg
        );
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
  emailKey: LifecycleEmailKey,
  trialDay: number
): Promise<EmailContext> {
  const { data: topics } = await supabase
    .from("topics")
    .select("name")
    .eq("user_id", profile.user_id)
    .eq("is_active", true);

  const topicNames = (topics ?? []).map((t) => t.name);

  // For Day 10 "miss me?" email, generate a Gemini teaser about their first topic
  let teaser: string | undefined;
  if (emailKey === "day10_miss_me" && topicNames.length > 0) {
    try {
      teaser = await generateTeaser(topicNames[0]);
      console.log(`[lifecycle] Generated teaser for ${profile.email} on "${topicNames[0]}"`);
    } catch (err) {
      console.error("[lifecycle] Failed to generate teaser:", err);
      // Falls back to default text in the template
    }
  }

  return {
    displayName: profile.display_name,
    email: profile.email,
    topicNames,
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

function greeting(ctx: EmailContext): string {
  return ctx.displayName ? `Hi ${ctx.displayName},` : "Hi there,";
}

// ---------------------------------------------------------------------------
// Standalone email template — matches Brain Brief brand
// ---------------------------------------------------------------------------

const bodyStyle =
  'margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #334155;';

function buildStandaloneHtml(params: {
  preheader: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaSubtext?: string;
  urgent?: boolean;
}): string {
  const year = new Date().getFullYear();
  const ctaBg = params.urgent ? "#DC2626" : "#10B981";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(params.headline)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    :root { color-scheme: light dark; }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0F172A !important; }
      .email-card { background-color: #1E293B !important; border-color: #334155 !important; }
      .lc-header { background-color: #1E293B !important; border-color: #334155 !important; }
      .lc-body-cell { background-color: #1E293B !important; }
      .lc-body-cell p { color: #CBD5E1 !important; }
      .lc-body-cell strong { color: #F8FAFC !important; }
      .lc-teaser { background-color: #0F172A !important; }
      .lc-teaser p { color: #CBD5E1 !important; }
      .lc-footer { background-color: #1A2332 !important; }
      .text-heading { color: #F8FAFC !important; }
      .text-body { color: #CBD5E1 !important; }
      .text-muted { color: #94A3B8 !important; }
      .lc-copyright { color: #64748B !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(params.preheader)}</div>

  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">

          <!-- Header -->
          <tr>
            <td class="lc-header" style="padding: 24px 32px; background-color: #FFFFFF; border-bottom: 1px solid #E2E8F0;">
              <h1 class="text-heading" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px;">
                Brain<span style="color: #10B981;">Brief</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="lc-body-cell" style="padding: 32px; background-color: #FFFFFF;">
              <h2 class="text-heading" style="margin: 0 0 20px; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #0F172A; line-height: 1.4;">
                ${params.headline}
              </h2>

              ${params.body}

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 8px;">
                <tr>
                  <td align="center">
                    <a href="https://www.brainbrief.app/subscribe" style="display: inline-block; padding: 14px 32px; background-color: ${ctaBg}; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; text-align: center;">
                      <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
                      ${params.ctaText}
                      <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
                    </a>
                  </td>
                </tr>
                ${
                  params.ctaSubtext
                    ? `
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <p class="text-muted" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #94A3B8;">
                      ${params.ctaSubtext}
                    </p>
                  </td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="lc-footer" style="padding: 20px 32px; background-color: #F8FAFC; text-align: center;">
              <p class="text-muted" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #94A3B8; line-height: 1.6;">
                You're receiving this because you signed up for Brain Brief.
                <br>
                <a href="https://www.brainbrief.app/dashboard" style="color: #64748B; text-decoration: underline;">Manage your account</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.brainbrief.app/unsubscribe" style="color: #64748B; text-decoration: underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:support@brainbrief.app" style="color: #64748B; text-decoration: underline;">Support</a>
              </p>
            </td>
          </tr>

        </table>

        <p class="lc-copyright" style="margin: 24px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #CBD5E1; text-align: center;">
          &copy; ${year} Brain Brief
        </p>
        <p class="lc-copyright" style="margin: 8px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #CBD5E1; text-align: center;">
          Brain Brief &middot; PO Box 254752 &middot; Sacramento, CA 95825
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

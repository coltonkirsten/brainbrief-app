/**
 * Post-trial email sequence.
 *
 * After a user's 7-day free trial ends, we send exactly two standalone emails:
 *
 *   Day  8 — "Your briefings have stopped" (trial ended notice)
 *   Day 10 — "Miss me?" follow-up (final email ever)
 *
 * After Day 10, no more emails are sent. The user's account stays active
 * and they can subscribe at any time to resume briefings.
 *
 * Called from the daily cron job.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendStandaloneEmail } from "./email";
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
        preheader: "Your topics are saved and waiting for you",
        headline: `${greeting(ctx)} Your 7-day trial is over.`,
        body: `
          <p style="${bodyStyle}">
            Today's briefing wasn't delivered because your free trial has ended.
          </p>
          <p style="${bodyStyle}">
            <strong>Your topics are saved and waiting for you.</strong>
            Subscribe to pick up right where you left off &mdash; no setup needed.
          </p>`,
        ctaText: "Subscribe to Brain Brief Pro",
        ctaSubtext: "$6/mo or $50/year &mdash; cancel anytime",
        urgent: false,
      }),
    buildText: (ctx) =>
      `${greeting(ctx)} Your 7-day trial is over.\n\n` +
      `Today's briefing wasn't delivered because your free trial has ended.\n\n` +
      `Your topics are saved and waiting for you. Subscribe to pick up right where you left off.\n\n` +
      `Subscribe: https://brainbrief.app/subscribe\n`,
  },
  {
    key: "day10_miss_me",
    triggerDay: TRIAL_DURATION_DAYS + 3, // Day 10
    subject: (ctx) =>
      ctx.topicNames.length > 0
        ? `Still curious about ${ctx.topicNames[0]}?`
        : "Your briefings miss you",
    buildHtml: (ctx) => {
      const topicTeaser =
        ctx.topicNames.length > 0
          ? `<p style="${bodyStyle}">The world didn't stop &mdash; there's been a lot happening in <strong>${escapeHtml(ctx.topicNames[0])}</strong> since your last briefing.</p>`
          : `<p style="${bodyStyle}">The world didn't stop &mdash; there's been a lot happening since your last briefing.</p>`;

      return buildStandaloneHtml({
        preheader: "It's been a few days since your last Brain Brief",
        headline: `${greeting(ctx)} It's been a few days.`,
        body: `
          ${topicTeaser}
          <p style="${bodyStyle}">
            Your topics are still saved. One click and you're back to daily intelligence &mdash; no setup needed.
          </p>`,
        ctaText: "Get your briefings back",
        ctaSubtext: "$6/mo &mdash; cancel anytime",
        urgent: false,
      });
    },
    buildText: (ctx) =>
      `${greeting(ctx)} It's been a few days since your last Brain Brief.\n\n` +
      (ctx.topicNames.length > 0
        ? `There's been a lot happening in ${ctx.topicNames[0]} since your last briefing.\n\n`
        : `There's been a lot happening since your last briefing.\n\n`) +
      `Your topics are still saved. Subscribe to pick up where you left off.\n\n` +
      `Subscribe: https://brainbrief.app/subscribe\n`,
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
      const ctx = await buildEmailContext(supabase, profile);

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
  profile: UserProfile
): Promise<EmailContext> {
  const { data: topics } = await supabase
    .from("topics")
    .select("name")
    .eq("user_id", profile.user_id)
    .eq("is_active", true);

  return {
    displayName: profile.display_name,
    email: profile.email,
    topicNames: (topics ?? []).map((t) => t.name),
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

  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">

          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #E2E8F0;">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px;">
                Brain<span style="color: #10B981;">Brief</span>
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
                    <a href="https://brainbrief.app/subscribe" style="display: inline-block; padding: 14px 32px; background-color: ${ctaBg}; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; text-align: center;">
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

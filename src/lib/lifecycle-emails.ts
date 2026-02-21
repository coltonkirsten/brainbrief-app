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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LifecycleEmailKey =
  | "day7"
  | "day12"
  | "day14"
  | "day15"
  | "day30";

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
  /** Number of briefings sent to this user */
  briefingCount: number;
  /** Topic names the user has */
  topicNames: string[];
  /** Current day of trial (1-indexed) */
  trialDay: number;
  /** Days remaining in trial (can be negative for post-trial emails) */
  daysRemaining: number;
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
    key: "day7",
    triggerDay: 7,
    subject: () => "Your first week with Brain Brief",
    buildHtml: (ctx) => buildLifecycleHtml({
      preheader: "Here's what your first week looked like",
      headline: `${greeting(ctx)} Your first week in review.`,
      body: `
        <p style="${bodyStyle}">
          You've been a Brain Brief member for <strong>one week</strong> now.
          ${ctx.briefingCount > 0
            ? `In that time, we've delivered <strong>${ctx.briefingCount} briefing${ctx.briefingCount !== 1 ? "s" : ""}</strong> covering ${ctx.topicNames.length} topic${ctx.topicNames.length !== 1 ? "s" : ""} you care about.`
            : `You have ${ctx.topicNames.length} topic${ctx.topicNames.length !== 1 ? "s" : ""} set up and ready to go.`
          }
        </p>
        ${ctx.topicNames.length > 0 ? `
        <p style="${bodyStyle}">
          Your topics: <strong>${ctx.topicNames.join(", ")}</strong>
        </p>` : ""}
        <p style="${bodyStyle}">
          Every briefing saves you 20+ minutes of reading and keeps you sharp
          on what matters. That's time back in your day, every day.
        </p>
        <p style="${bodyStyle}">
          You have <strong>7 days left</strong> in your free trial. When you're
          ready to make it permanent:
        </p>`,
      ctaText: "Subscribe to Brain Brief Pro",
      ctaSubtext: "Plans start at $6/mo",
    }),
    buildText: (ctx) => `${greeting(ctx)} Your first week in review.\n\n` +
      (ctx.briefingCount > 0
        ? `In the past week, we've delivered ${ctx.briefingCount} briefing${ctx.briefingCount !== 1 ? "s" : ""} covering ${ctx.topicNames.length} topic${ctx.topicNames.length !== 1 ? "s" : ""}.\n\n`
        : `You have ${ctx.topicNames.length} topic${ctx.topicNames.length !== 1 ? "s" : ""} set up.\n\n`) +
      `You have 7 days left in your free trial.\n\n` +
      `Subscribe to keep your briefings: https://brainbrief.app/subscribe\n`,
  },
  {
    key: "day12",
    triggerDay: 12,
    subject: () => "3 days left in your free trial",
    buildHtml: (ctx) => buildLifecycleHtml({
      preheader: "Your briefings stop in 3 days",
      headline: `${greeting(ctx)} Your trial ends in 3 days.`,
      body: `
        <p style="${bodyStyle}">
          Just a heads-up: your Brain Brief free trial ends in <strong>3 days</strong>.
          After that, your daily briefings will stop.
        </p>
        <p style="${bodyStyle}">
          Your topics and account will stay saved &mdash; so if you subscribe later,
          you'll pick up right where you left off. But we'd hate for you to miss a day.
        </p>
        <p style="${bodyStyle}">
          Brain Brief Pro is <strong>$6/month</strong> (or $50/year &mdash; save 30%).
          That's less than a coffee for daily intelligence on the topics you care about.
        </p>`,
      ctaText: "Subscribe now &mdash; $6/mo",
      ctaSubtext: "Don't miss a briefing",
      urgent: true,
    }),
    buildText: (ctx) => `${greeting(ctx)} Your trial ends in 3 days.\n\n` +
      `Your Brain Brief free trial ends in 3 days. After that, your daily briefings will stop.\n\n` +
      `Your topics and account will stay saved. Subscribe to keep your briefings.\n\n` +
      `Brain Brief Pro: $6/month or $50/year (save 30%).\n\n` +
      `Subscribe: https://brainbrief.app/subscribe\n`,
  },
  {
    key: "day14",
    triggerDay: 14,
    subject: () => "Last briefing tomorrow",
    buildHtml: (ctx) => buildLifecycleHtml({
      preheader: "This is your last briefing unless you subscribe",
      headline: `${greeting(ctx)} Tomorrow is your last free briefing.`,
      body: `
        <p style="${bodyStyle}">
          Your 14-day free trial ends tomorrow. This means today's briefing
          will be your <strong>second-to-last</strong> unless you subscribe.
        </p>
        <p style="${bodyStyle}">
          ${ctx.briefingCount > 0
            ? `Over the past two weeks, you've received <strong>${ctx.briefingCount} briefings</strong>. That's ${ctx.briefingCount * 20}+ minutes of research we've done for you.`
            : `We've been covering ${ctx.topicNames.join(" and ")} for you.`
          }
        </p>
        <p style="${bodyStyle}">
          Don't lose your edge. Subscribe to Brain Brief Pro and keep your
          daily intelligence flowing.
        </p>`,
      ctaText: "Keep my briefings &rarr;",
      ctaSubtext: "$6/mo or $50/yr",
      urgent: true,
    }),
    buildText: (ctx) => `${greeting(ctx)} Tomorrow is your last free briefing.\n\n` +
      `Your 14-day free trial ends tomorrow.\n\n` +
      (ctx.briefingCount > 0
        ? `Over the past two weeks, you've received ${ctx.briefingCount} briefings.\n\n`
        : "") +
      `Subscribe to keep your briefings: https://brainbrief.app/subscribe\n`,
  },
  {
    key: "day15",
    triggerDay: 15,
    subject: () => "Your Brain Brief trial has ended",
    buildHtml: (ctx) => buildLifecycleHtml({
      preheader: "Your topics are still saved — come back anytime",
      headline: `${greeting(ctx)} Your free trial has ended.`,
      body: `
        <p style="${bodyStyle}">
          As of today, your Brain Brief free trial is over. You won't receive
          any more daily briefings unless you subscribe.
        </p>
        <p style="${bodyStyle}">
          The good news: <strong>your account and topics are still saved</strong>.
          ${ctx.topicNames.length > 0 ? `Your topics (${ctx.topicNames.join(", ")}) are waiting for you.` : ""}
          Subscribe anytime and you'll pick up right where you left off &mdash; no setup needed.
        </p>
        <p style="${bodyStyle}">
          We built Brain Brief because staying informed shouldn't take hours.
          We hope you'll join us.
        </p>`,
      ctaText: "Subscribe to Brain Brief Pro",
      ctaSubtext: "Start at $6/mo &mdash; cancel anytime",
      urgent: false,
    }),
    buildText: (ctx) => `${greeting(ctx)} Your free trial has ended.\n\n` +
      `You won't receive any more daily briefings unless you subscribe.\n\n` +
      `Your account and topics are still saved. Subscribe anytime to pick up where you left off.\n\n` +
      `Subscribe: https://brainbrief.app/subscribe\n`,
  },
  {
    key: "day30",
    triggerDay: 30,
    subject: (ctx) =>
      ctx.topicNames.length > 0
        ? `A lot has happened in ${ctx.topicNames[0]}`
        : "A lot has happened since you left",
    buildHtml: (ctx) => {
      const daysMissed = ctx.trialDay - 14;
      return buildLifecycleHtml({
        preheader: `${daysMissed} days of updates you haven't seen`,
        headline: ctx.topicNames.length > 0
          ? `${daysMissed} days of ${ctx.topicNames[0]} updates you haven't seen.`
          : `${daysMissed} days of updates you haven't seen.`,
        body: `
          <p style="${bodyStyle}">
            ${greeting(ctx)} It's been a while. Since your trial ended,
            <strong>${daysMissed} days of news</strong> have gone by
            ${ctx.topicNames.length > 0 ? ` in ${ctx.topicNames.join(", ")}` : ""}.
          </p>
          <p style="${bodyStyle}">
            Your topics are still saved. Your account is still here.
            One click and you're back to daily briefings &mdash; no setup needed.
          </p>
          <p style="${bodyStyle}">
            We'd love to have you back.
          </p>`,
        ctaText: "Come back to Brain Brief",
        ctaSubtext: "$6/mo or $50/yr &mdash; cancel anytime",
        urgent: false,
      });
    },
    buildText: (ctx) => {
      const daysMissed = ctx.trialDay - 14;
      return `${greeting(ctx)} It's been a while.\n\n` +
        `Since your trial ended, ${daysMissed} days of news have gone by` +
        (ctx.topicNames.length > 0 ? ` in ${ctx.topicNames.join(", ")}` : "") + `.\n\n` +
        `Your topics are still saved. Subscribe to pick up where you left off.\n\n` +
        `Subscribe: https://brainbrief.app/subscribe\n`;
    },
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
    const trialStartedAt = new Date(trialEndsAt.getTime() - 14 * 24 * 60 * 60 * 1000);
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

  const trialEndsAt = new Date(profile.trial_ends_at!);
  const daysRemaining = Math.ceil(
    (trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return {
    displayName: profile.display_name,
    email: profile.email,
    briefingCount: count ?? 0,
    topicNames: (topics ?? []).map((t) => t.name),
    trialDay,
    daysRemaining,
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

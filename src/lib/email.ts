/**
 * Email delivery module.
 *
 * Uses Resend when RESEND_API_KEY is set.
 * Falls back to console stub for local dev / when key isn't configured yet.
 *
 * Email template designed by Chelsea — "Premium Editorial Tech" aesthetic.
 *
 * Trial email strategy v2:
 * - No separate lifecycle emails during trial
 * - Trial countdown lives in the briefing email footer
 * - Day 1: welcome card at top of first briefing (auto-detected via trialInfo)
 * - Day 6: "ends tomorrow" elevated footer
 * - Day 7: "last free briefing" emphasized footer
 * - Day 8 & Day 10: standalone post-trial emails (handled by lifecycle-emails.ts)
 */

import type { BriefingData } from "./gemini";
import type { TrialInfo } from "./trial";


interface SendBriefingEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  structured?: BriefingData;
  trialInfo?: TrialInfo;
  /** Whether the briefing was grounded with live sources */
  grounded?: boolean;
  /** User ID — added as hint param in email links for mismatch detection */
  userId?: string;
  /** Briefing ID — added to "Rate this briefing" link for context */
  briefingId?: string;
}

export async function sendBriefingEmail({
  to,
  subject,
  html,
  text,
  structured,
  trialInfo,
  grounded,
  userId,
  briefingId,
}: SendBriefingEmailParams): Promise<{
  success: boolean;
  messageId?: string;
}> {
  // Use Resend when configured
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const fromAddress = process.env.RESEND_FROM_EMAIL;
      if (!fromAddress) {
        console.error("[email] RESEND_FROM_EMAIL is not set — refusing to send from default address");
        return { success: false };
      }

      const emailHtml = structured
        ? buildStructuredEmailTemplate(structured, trialInfo, grounded, userId, briefingId)
        : buildLegacyEmailTemplate(html, userId, briefingId);

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html: emailHtml,
        text,
        headers: {
          "List-Unsubscribe": "<https://www.brainbrief.app/unsubscribe>",
        },
      });

      if (error) {
        console.error("[email] Resend error:", error);
        return { success: false };
      }

      console.log(`[email] Sent to ${to}, messageId: ${data?.id}`);
      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error("[email] Failed to send via Resend:", err);
      return { success: false };
    }
  }

  // Stub: log to console when Resend isn't configured
  console.log(`[email-stub] Would send to: ${to}`);
  console.log(`[email-stub] Subject: ${subject}`);
  console.log(`[email-stub] HTML length: ${html.length} chars`);
  console.log(`[email-stub] Text preview: ${text.substring(0, 200)}...`);

  return { success: true, messageId: `stub-${Date.now()}` };
}

/**
 * Send a standalone (non-briefing) email using the Brain Brief template.
 * Used for Day 8 "trial ended" and Day 10 "miss me?" emails.
 */
export async function sendStandaloneEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email-stub] Would send standalone to: ${params.to}, subject: ${params.subject}`);
    return { success: true, messageId: `stub-${Date.now()}` };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromAddress = process.env.RESEND_FROM_EMAIL;
    if (!fromAddress) {
      console.error("[email] RESEND_FROM_EMAIL is not set — refusing to send from default address");
      return { success: false };
    }

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      headers: {
        "List-Unsubscribe": "<https://www.brainbrief.app/unsubscribe>",
      },
    });

    if (error) {
      console.error("[email] Standalone Resend error:", error);
      return { success: false };
    }

    console.log(`[email] Standalone sent to ${params.to}, messageId: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("[email] Failed to send standalone:", err);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// Dynamic subject line generation
// ---------------------------------------------------------------------------

/**
 * Generate a curiosity-inducing email subject line from the briefing content.
 * Uses the first topic's headline + a count of remaining topics.
 *
 * Examples:
 * - "SpaceX Just Broke a Launch Record + 2 more"
 * - "The Study That Could Change Longevity Research"
 * - "AI Funding Shifts as Major Players Restructure + 1 more"
 */
export function generateSubjectLine(structured?: BriefingData): string {
  if (!structured?.topics?.length) {
    const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
    return `Your Brain Brief — ${today}`;
  }

  const topics = structured.topics;
  const firstHeadline = topics[0].headline;
  const otherCount = topics.length - 1;

  if (otherCount === 0) {
    // Single topic — just the headline, truncated to 60 chars
    if (firstHeadline.length <= 60) return firstHeadline;
    const truncated = firstHeadline.substring(0, 57);
    const lastSpace = truncated.lastIndexOf(" ");
    return (lastSpace > 25 ? truncated.substring(0, lastSpace) : truncated) + "...";
  }

  // Multiple topics — headline + " + N more"
  const suffix = ` + ${otherCount} more`;
  const maxLen = 60 - suffix.length;

  let headline = firstHeadline;
  if (headline.length > maxLen) {
    const truncated = headline.substring(0, maxLen - 3);
    const lastSpace = truncated.lastIndexOf(" ");
    headline = (lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated) + "...";
  }

  return headline + suffix;
}

// ---------------------------------------------------------------------------
// Structured email template — Chelsea's "Premium Editorial" design
// ---------------------------------------------------------------------------

function buildStructuredEmailTemplate(data: BriefingData, trialInfo?: TrialInfo, grounded?: boolean, userId?: string, briefingId?: string): string {
  // Build dashboard URLs with user hint params for mismatch detection
  const uidParam = userId ? `&uid=${userId}` : "";
  const briefingParam = briefingId ? `&briefing_id=${briefingId}` : "";
  const rateUrl = `https://www.brainbrief.app/dashboard?ref=email${uidParam}${briefingParam}`;
  const manageUrl = `https://www.brainbrief.app/dashboard?ref=email${uidParam}`;

  const year = new Date().getFullYear();
  // #6: Shortened date format — won't wrap on mobile next to logo
  const now = new Date();
  const dateStr = `${now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()} \u00b7 ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}`;

  const isTrial = trialInfo && trialInfo.isTrialActive && !trialInfo.isSubscriber;

  // #8: Welcome header for Day 1 — BELOW logo, light indigo background
  const welcomeHeader = isTrial && trialInfo.trialDayNumber === 1
    ? `
      <!-- ============ WELCOME HEADER (DAY 1) ============ -->
      <tr>
        <td style="padding: 0 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="welcome-card" style="background-color: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 8px;">
            <tr>
              <td style="padding: 20px;">
                <p class="text-heading" style="margin: 0 0 12px 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0F172A;">
                  Welcome — your first Brain Brief is below.
                </p>
                <p class="text-body" style="margin: 0 0 12px 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569;">
                  You'll get one like this every day for the next 7 days, covering the topics you selected. No filler, no noise. Just what's worth knowing.
                </p>
                <p class="text-body" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569;">
                  If it earns a place in your morning, subscribing is easy. For now, enjoy the read.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `
    : "";

  // Build trial countdown footer + subscribe CTA based on trial day
  let footerCountdown = "";
  let subscribeCta = "";
  if (isTrial) {
    const day = trialInfo.trialDayNumber;
    if (day === 1) {
      footerCountdown = `
              <p style="margin: 0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B;">
                Day 1 of 7 — your free trial is active
              </p>`;
    } else if (day >= 2 && day <= 5) {
      const daysLeft = 7 - day + 1;
      footerCountdown = `
              <p style="margin: 0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B;">
                Day ${day} of 7 &middot; ${daysLeft} days left in your free trial
              </p>`;
    } else if (day === 6) {
      footerCountdown = `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px 0;">
                <tr>
                  <td class="trial-card" style="padding: 16px; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #F8FAFC; text-align: center;">
                    <p class="trial-card-text" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #334155;">
                      Day 6 of 7 &middot; Your last free briefing is tomorrow.
                    </p>
                  </td>
                </tr>
              </table>`;
    } else if (day === 7) {
      footerCountdown = `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px 0;">
                <tr>
                  <td class="trial-card" style="padding: 16px; border: 1px solid #CBD5E1; border-radius: 8px; background-color: #F1F5F9; text-align: center;">
                    <p class="trial-card-text" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0F172A;">
                      Day 7 of 7 &middot; This is your last free briefing.
                    </p>
                  </td>
                </tr>
              </table>`;
    }
    // #4: Full-width subscribe CTA button for all trial users
    subscribeCta = `
              <p style="margin: 0 0 20px 0;">
                <a href="https://www.brainbrief.app/subscribe" style="display: block; padding: 14px 20px; background-color: #0F172A; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; text-align: center;">Subscribe to keep your briefings &rarr;</a>
              </p>`;
  }

  const topicBlocks = data.topics
    .map((topic, i) => {
      const isLast = i === data.topics.length - 1;

      const bulletItems = topic.bullets
        .map((bullet, bi) => {
          const rawSources = topic.bulletSources?.[bi] ?? [];
          const bulletSourceList = rawSources.filter((s) => s.uri && s.uri.trim().length > 0);
          // #11: Citations — 11px muted gray, underlined for accessibility
          const citationHtml =
            bulletSourceList.length > 0
              ? ` <span style="font-size: 11px; color: #94A3B8;">[${bulletSourceList
                  .map(
                    (s) =>
                      `<a href="${escapeHtml(s.uri)}" style="color: #94A3B8; text-decoration: underline; font-size: 11px;" target="_blank">${escapeHtml(cleanSourceTitle(s.title))}</a>`
                  )
                  .join(", ")}]</span>`
              : "";
          // #1: Narrower bullet column (12px) + less left padding (4px)
          return `
              <tr>
                <td style="padding: 0 0 8px 0; vertical-align: top; width: 12px;">
                  <span style="color: #10B981; font-size: 18px; line-height: 1;">&#8226;</span>
                </td>
                <td class="text-bullet" style="padding: 0 0 8px 4px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #334155;">
                  ${escapeHtml(bullet)}${citationHtml}
                </td>
              </tr>`;
        })
        .join("");

      const bottomLineBlock = topic.bottomLine
        ? `
            <tr>
              <td style="padding: 12px 0 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="bottom-line-bg" style="padding: 16px; background-color: #F8FAFC; border-left: 3px solid #10B981; border-radius: 0 6px 6px 0;">
                      <p class="bottom-line-text" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-style: italic; color: #0F172A; line-height: 1.6;">
                        <strong style="font-style: normal; font-family: Helvetica, Arial, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #10B981; display: block; margin-bottom: 6px;">The Bottom Line</strong>
                        ${escapeHtml(topic.bottomLine)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
        : "";

      // Legacy source links — only show "Read More" block when no per-bullet sources
      const hasBulletSources = topic.bulletSources?.some((bs) => bs.length > 0);
      const sourceLinks =
        !hasBulletSources && topic.sources && topic.sources.length > 0
          ? `
            <tr>
              <td style="padding: 16px 0 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 0;">
                      <p style="margin: 0 0 8px 0; font-family: Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">
                        Read More
                      </p>
                      ${topic.sources
                        .map((source) => {
                          const displayTitle = cleanSourceTitle(source.title);
                          const domain = extractDomain(source.uri, source.title);
                          const domainSuffix = domain && displayTitle.toLowerCase() !== domain.toLowerCase()
                            ? `<span style="color: #94A3B8; font-size: 11px;"> · ${escapeHtml(domain)}</span>`
                            : "";
                          return `
                      <p style="margin: 0 0 4px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5;">
                        <a href="${escapeHtml(source.uri)}" style="color: #94A3B8; text-decoration: underline;" target="_blank">
                          ${escapeHtml(displayTitle)}
                        </a>
                        ${domainSuffix}
                      </p>`;
                        })
                        .join("")}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
          : "";

      // #3: 40px padding between topics + thin divider (not on last)
      const divider = !isLast
        ? `
          <tr>
            <td style="padding: 20px 24px 0 24px;">
              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 0;">
            </td>
          </tr>`
        : "";

      return `
          <!-- Topic: ${escapeHtml(topic.name)} -->
          <tr>
            <td class="email-body-cell" style="padding: ${i === 0 ? "24px" : "20px"} 24px ${isLast ? "24px" : "0"} 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Badge -->
                <tr>
                  <td style="padding: 0 0 12px 0;">
                    <span class="topic-badge" style="display: inline-block; padding: 4px 12px; border-radius: 4px; background-color: #F1F5F9; font-family: Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #E2E8F0;">
                      ${escapeHtml(topic.name)}
                    </span>
                  </td>
                </tr>
                <!-- Headline -->
                <tr>
                  <td style="padding: 0 0 12px 0;">
                    <h2 class="text-heading topic-headline" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                      ${escapeHtml(topic.headline)}
                    </h2>
                  </td>
                </tr>
                <!-- Bullets -->
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${bulletItems}
                    </table>
                  </td>
                </tr>
                ${bottomLineBlock}
                ${sourceLinks}
              </table>
            </td>
          </tr>${divider}`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Your Brain Brief</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: light dark; }
    /* #1: Mobile width reclaim */
    @media (max-width: 480px) {
      .email-outer-pad { padding: 16px 8px !important; }
      .email-inner-pad { padding-left: 16px !important; padding-right: 16px !important; }
      /* #7: Responsive headline size */
      .topic-headline { font-size: 22px !important; line-height: 28px !important; }
    }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0F172A !important; }
      .email-card { background-color: #1E293B !important; border-color: #334155 !important; }
      .email-header { background-color: #1E293B !important; border-color: #334155 !important; }
      .email-intro { background-color: #1A2332 !important; }
      .email-footer { background-color: #1A2332 !important; border-color: #334155 !important; }
      .email-body-cell { background-color: #1E293B !important; border-color: #334155 !important; }
      .text-heading { color: #F8FAFC !important; }
      .text-body { color: #CBD5E1 !important; }
      .text-bullet { color: #CBD5E1 !important; }
      .text-muted { color: #94A3B8 !important; }
      .topic-badge { background-color: #334155 !important; color: #F8FAFC !important; border-color: #475569 !important; }
      .bottom-line-bg { background-color: #0F172A !important; }
      .bottom-line-text { color: #F8FAFC !important; }
      .welcome-card { background-color: #1E293B !important; border-color: #475569 !important; }
      .trial-card { background-color: #0F172A !important; border-color: #334155 !important; }
      .trial-card-text { color: #F8FAFC !important; }
      .overview-text { color: #94A3B8 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; background-color: #F8FAFC;">
  <!-- #13: Off-white outer background -->
  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center" class="email-outer-pad" style="padding: 24px 12px;">
        <!-- #2: Rounded container with border -->
        <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">

          <!-- ============ HEADER ============ -->
          <tr>
            <td class="email-header email-inner-pad" style="padding: 28px 24px 20px 24px; border-bottom: 1px solid #F1F5F9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <h1 class="text-heading" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px;">
                      Brain<span style="color: #10B981;">Brief</span>
                    </h1>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span class="text-muted" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">
                      ${escapeHtml(dateStr)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- #8: Welcome header AFTER logo (Day 1 only) -->
          ${welcomeHeader}

          <!-- #10: Shortened intro -->
          <tr>
            <td class="email-intro email-inner-pad" style="padding: 20px 24px; background-color: #FAFAFA;">
              <p class="text-body" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #475569;">
                ${grounded === false
                  ? "No breaking news found today \u2014 here\u2019s a quick overview of where things stand."
                  : "Here\u2019s your briefing."}
              </p>
            </td>
          </tr>

          <!-- ============ TOPICS ============ -->
          ${topicBlocks}

          ${grounded === false ? `
          <!-- ============ OVERVIEW NOTE ============ -->
          <tr>
            <td class="email-inner-pad" style="padding: 4px 24px 12px 24px;">
              <p class="overview-text" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #94A3B8; line-height: 1.5; font-style: italic;">
                This is an overview briefing. Live source citations will return in your next edition.
              </p>
            </td>
          </tr>
          ` : ""}

          <!-- ============ FOOTER ============ -->
          <tr>
            <td class="email-footer email-inner-pad" style="padding: 28px 24px; background-color: #FAFAFA; border-top: 1px solid #F1F5F9; text-align: center;">
              ${footerCountdown}
              <!-- #4: Subscribe CTA for trial users -->
              ${subscribeCta}
              <p class="text-muted" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B; line-height: 1.6;">
                You're receiving this because you subscribed to topics on Brain Brief.
              </p>
              <!-- #5: Rate = primary green button; Manage Topics = text link -->
              <p style="margin: 20px 0 0;">
                <a href="${rateUrl}" style="display: inline-block; padding: 10px 24px; background-color: #10B981; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 8px;">Rate this briefing</a>
              </p>
              <p style="margin: 12px 0 0;">
                <a href="${manageUrl}" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; color: #64748B; text-decoration: underline;">Manage Topics</a>
              </p>
              <p style="margin: 20px 0 0;">
                <a href="https://www.brainbrief.app/unsubscribe" class="text-muted" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; color: #94A3B8; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 16px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #94A3B8;">
                <a href="https://www.brainbrief.app/terms" style="color: #94A3B8; text-decoration: underline;">Terms</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.brainbrief.app/privacy" style="color: #94A3B8; text-decoration: underline;">Privacy</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:support@brainbrief.app" style="color: #94A3B8; text-decoration: underline;">Support</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- #12: Cut "Powered by AI" tagline -->
        <p class="text-muted" style="margin: 24px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #94A3B8; text-align: center;">
          &copy; ${year} Brain Brief. All rights reserved.
        </p>
        <p class="text-muted" style="margin: 8px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 10px; color: #CBD5E1; text-align: center;">
          Brain Brief &middot; PO Box 254752 &middot; Sacramento, CA 95825
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Legacy email template — wraps raw HTML content (fallback)
// ---------------------------------------------------------------------------

function buildLegacyEmailTemplate(contentHtml: string, userId?: string, briefingId?: string): string {
  // Build dashboard URLs with user hint params for mismatch detection
  const uidParam = userId ? `&uid=${userId}` : "";
  const briefingParam = briefingId ? `&briefing_id=${briefingId}` : "";
  const rateUrl = `https://www.brainbrief.app/dashboard?ref=email${uidParam}${briefingParam}`;
  const manageUrl = `https://www.brainbrief.app/dashboard?ref=email${uidParam}`;

  const year = new Date().getFullYear();
  const now = new Date();
  const dateStr = `${now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()} \u00b7 ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}`;

  // Add inline styles to HTML elements for email client compatibility
  const styledContent = addEmailInlineStyles(contentHtml);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Your Brain Brief</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: light dark; }
    @media (max-width: 480px) {
      .legacy-outer-pad { padding: 16px 8px !important; }
      .legacy-inner-pad { padding-left: 16px !important; padding-right: 16px !important; }
    }
    @media (prefers-color-scheme: dark) {
      .legacy-bg { background-color: #0F172A !important; }
      .legacy-card { background-color: #1E293B !important; border-color: #334155 !important; }
      .legacy-header { background-color: #1E293B !important; border-color: #334155 !important; }
      .legacy-content { background-color: #1E293B !important; color: #CBD5E1 !important; }
      .legacy-content h1, .legacy-content h2, .legacy-content h3 { color: #F8FAFC !important; }
      .legacy-content strong { color: #F8FAFC !important; }
      .legacy-content blockquote { background-color: #0F172A !important; }
      .legacy-footer { background-color: #1A2332 !important; border-color: #334155 !important; }
      .legacy-heading { color: #F8FAFC !important; }
      .legacy-date { color: #94A3B8 !important; }
      .legacy-footer-text { color: #94A3B8 !important; }
      .legacy-muted { color: #64748B !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" class="legacy-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center" class="legacy-outer-pad" style="padding: 24px 12px;">
        <table role="presentation" class="legacy-card" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">
          <!-- Header -->
          <tr>
            <td class="legacy-header legacy-inner-pad" style="padding: 28px 24px 20px 24px; background-color: #FFFFFF; border-bottom: 1px solid #F1F5F9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <h1 class="legacy-heading" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px;">
                      Brain<span style="color: #10B981;">Brief</span>
                    </h1>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span class="legacy-date" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">
                      ${escapeHtml(dateStr)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="legacy-content legacy-inner-pad" style="padding: 24px; background-color: #FFFFFF; color: #334155; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6;">
              ${styledContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="legacy-footer legacy-inner-pad" style="padding: 28px 24px; background-color: #FAFAFA; border-top: 1px solid #F1F5F9; text-align: center;">
              <p class="legacy-footer-text" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B; line-height: 1.6;">
                You're receiving this because you subscribed to topics on Brain Brief.
              </p>
              <p style="margin: 20px 0 0;">
                <a href="${rateUrl}" style="display: inline-block; padding: 10px 24px; background-color: #10B981; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 8px;">Rate this briefing</a>
              </p>
              <p style="margin: 12px 0 0;">
                <a href="${manageUrl}" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; color: #64748B; text-decoration: underline;">Manage Topics</a>
              </p>
              <p style="margin: 20px 0 0;">
                <a href="https://www.brainbrief.app/unsubscribe" class="legacy-footer-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; color: #94A3B8; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p class="legacy-footer-text" style="margin: 16px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #94A3B8;">
                <a href="https://www.brainbrief.app/terms" style="color: #94A3B8; text-decoration: underline;">Terms</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.brainbrief.app/privacy" style="color: #94A3B8; text-decoration: underline;">Privacy</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:support@brainbrief.app" style="color: #94A3B8; text-decoration: underline;">Support</a>
              </p>
              <p class="legacy-footer-text" style="margin: 24px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #94A3B8;">
                &copy; ${year} Brain Brief. All rights reserved.
              </p>
              <p class="legacy-muted" style="margin: 8px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 10px; color: #CBD5E1;">
                Brain Brief &middot; PO Box 254752 &middot; Sacramento, CA 95825
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Add inline styles to standard HTML elements for email client compatibility.
 * Email clients (Gmail, Outlook, etc.) strip <style> tags and class-based CSS,
 * so all styling must be inline on each element.
 */
function addEmailInlineStyles(html: string): string {
  return html
    // Headings — serif font, proper spacing, dark color
    .replace(
      /<h1(?:\s[^>]*)?>/g,
      '<h1 style="margin: 0 0 16px; font-family: Georgia, \'Times New Roman\', serif; font-size: 26px; font-weight: 700; color: #0F172A; line-height: 1.3;">'
    )
    .replace(
      /<h2(?:\s[^>]*)?>/g,
      '<h2 style="margin: 32px 0 12px; font-family: Georgia, \'Times New Roman\', serif; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 1.3;">'
    )
    .replace(
      /<h3(?:\s[^>]*)?>/g,
      '<h3 style="margin: 24px 0 10px; font-family: Georgia, \'Times New Roman\', serif; font-size: 18px; font-weight: 700; color: #0F172A; line-height: 1.4;">'
    )
    // Paragraphs — proper margin, readable line height
    .replace(
      /<p(?:\s[^>]*)?>/g,
      '<p style="margin: 0 0 16px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #334155;">'
    )
    // Lists — indentation and spacing
    .replace(
      /<ul(?:\s[^>]*)?>/g,
      '<ul style="margin: 0 0 20px; padding-left: 24px; list-style-type: disc;">'
    )
    .replace(
      /<ol(?:\s[^>]*)?>/g,
      '<ol style="margin: 0 0 20px; padding-left: 24px;">'
    )
    .replace(
      /<li(?:\s[^>]*)?>/g,
      '<li style="margin-bottom: 10px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #334155;">'
    )
    // Bold — darker color for emphasis
    .replace(
      /<strong(?:\s[^>]*)?>/g,
      '<strong style="font-weight: 700; color: #0F172A;">'
    )
    // Italic
    .replace(
      /<em(?:\s[^>]*)?>/g,
      '<em style="font-style: italic;">'
    )
    // Horizontal rules — styled separator
    .replace(
      /<hr(?:\s[^>]*)?(?:\/)?>/g,
      '<hr style="border: none; border-top: 1px solid #E2E8F0; margin: 28px 0;">'
    )
    // Links — accent color
    .replace(
      /<a\s+href="/g,
      '<a style="color: #10B981; text-decoration: underline;" href="'
    )
    // Blockquotes — left border accent
    .replace(
      /<blockquote(?:\s[^>]*)?>/g,
      '<blockquote style="margin: 20px 0; padding: 16px 20px; border-left: 3px solid #10B981; background-color: #F8FAFC; border-radius: 0 6px 6px 0;">'
    );
}

/** Escape HTML special characters in text content */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Map of known domains to proper display names (shared with gemini.ts) */
const DOMAIN_DISPLAY_NAMES: Record<string, string> = {
  "theguardian.com": "The Guardian",
  "nytimes.com": "NY Times",
  "washingtonpost.com": "Washington Post",
  "bbc.com": "BBC",
  "bbc.co.uk": "BBC",
  "cnn.com": "CNN",
  "reuters.com": "Reuters",
  "apnews.com": "AP News",
  "techcrunch.com": "TechCrunch",
  "theverge.com": "The Verge",
  "arstechnica.com": "Ars Technica",
  "wired.com": "Wired",
  "bloomberg.com": "Bloomberg",
  "ft.com": "Financial Times",
  "wsj.com": "Wall Street Journal",
  "cnbc.com": "CNBC",
  "cio.com": "CIO",
  "zdnet.com": "ZDNet",
  "infoworld.com": "InfoWorld",
  "networkworld.com": "Network World",
  "eff.org": "EFF",
  "nature.com": "Nature",
  "science.org": "Science",
  "formula1.com": "Formula 1",
  "espn.com": "ESPN",
  "aljazeera.com": "Al Jazeera",
  "npr.org": "NPR",
  "politico.com": "Politico",
  "axios.com": "Axios",
  "technologyreview.com": "MIT Tech Review",
};

/** Clean up a source title — remove trailing site names, truncate if too long */
function cleanSourceTitle(title: string): string {
  // Check if the title is a known domain name → return proper name
  const stripped = title.replace(/^www\./, "").toLowerCase();
  if (DOMAIN_DISPLAY_NAMES[stripped]) return DOMAIN_DISPLAY_NAMES[stripped];

  // Remove trailing " - Site Name" or " | Site Name" patterns
  let cleaned = title.replace(/\s*[-|]\s*[^-|]{1,30}$/, "").trim();
  // Truncate very long titles
  if (cleaned.length > 80) {
    cleaned = cleaned.substring(0, 77) + "...";
  }
  return cleaned || title;
}

/** Extract a clean domain name from a URL (e.g., "reuters.com" → "Reuters") */
function extractDomain(uri: string, title?: string): string {
  try {
    const url = new URL(uri);
    let hostname = url.hostname.replace(/^www\./, "");
    // Google grounding redirect URLs — use the title (which IS the domain) instead
    if (hostname.includes("vertexaisearch.cloud.google.com") && title) {
      hostname = title.replace(/^www\./, "");
    }
    // Check known domain mapping
    const mapped = DOMAIN_DISPLAY_NAMES[hostname.toLowerCase()];
    return mapped || hostname;
  } catch {
    const fallback = title?.replace(/^www\./, "") || "";
    return DOMAIN_DISPLAY_NAMES[fallback.toLowerCase()] || fallback;
  }
}

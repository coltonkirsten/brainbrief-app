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
}

export async function sendBriefingEmail({
  to,
  subject,
  html,
  text,
  structured,
  trialInfo,
  grounded,
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
        ? buildStructuredEmailTemplate(structured, trialInfo, grounded)
        : buildLegacyEmailTemplate(html);

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
// Structured email template — Chelsea's "Premium Editorial" design
// ---------------------------------------------------------------------------

function buildStructuredEmailTemplate(data: BriefingData, trialInfo?: TrialInfo, grounded?: boolean): string {
  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Welcome header for Day 1 of trial (auto-detected from trialInfo)
  const welcomeHeader = trialInfo && trialInfo.isTrialActive && !trialInfo.isSubscriber && trialInfo.trialDayNumber === 1
    ? `
      <!-- ============ WELCOME HEADER (DAY 1) ============ -->
      <tr>
        <td style="padding: 20px 24px 0 24px; background-color: #FFFFFF;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAFA; border: 1px solid #F1F5F9; border-radius: 8px;">
            <tr>
              <td style="padding: 20px;">
                <p style="margin: 0 0 12px 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0F172A;">
                  Welcome — your first Brain Brief is below.
                </p>
                <p style="margin: 0 0 12px 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569;">
                  You'll get one like this every day for the next 7 days, covering the topics you selected. No filler, no noise. Just what's worth knowing.
                </p>
                <p style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569;">
                  If it earns a place in your morning, subscribing is easy. For now, enjoy the read.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `
    : "";

  // Build trial countdown footer based on trial day
  let footerCountdown = "";
  if (trialInfo && trialInfo.isTrialActive && !trialInfo.isSubscriber) {
    const day = trialInfo.trialDayNumber;
    if (day === 1) {
      footerCountdown = `
              <p style="margin: 0 0 20px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B;">
                Day 1 of 7 — your free trial is active &middot; <a href="https://www.brainbrief.app/dashboard" style="color: #64748B; text-decoration: underline;">Manage Topics</a> &middot; <a href="https://www.brainbrief.app/subscribe" style="color: #10B981; font-weight: 600; text-decoration: none;">Subscribe to keep your briefings &rarr;</a>
              </p>`;
    } else if (day >= 2 && day <= 5) {
      const daysLeft = 7 - day + 1;
      footerCountdown = `
              <p style="margin: 0 0 20px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B;">
                Day ${day} of 7 &middot; ${daysLeft} days left in your free trial &middot; <a href="https://www.brainbrief.app/subscribe" style="color: #10B981; font-weight: 600; text-decoration: none;">Subscribe to keep your briefings &rarr;</a>
              </p>`;
    } else if (day === 6) {
      footerCountdown = `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0;">
                <tr>
                  <td style="padding: 16px; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #F8FAFC; text-align: center;">
                    <p style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #334155;">
                      Day 6 of 7 &middot; Your last free briefing is tomorrow. &middot; <a href="https://www.brainbrief.app/subscribe" style="color: #10B981; font-weight: 600; text-decoration: none;">Keep your briefings going — $6/month &rarr;</a>
                    </p>
                  </td>
                </tr>
              </table>`;
    } else if (day === 7) {
      footerCountdown = `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0;">
                <tr>
                  <td style="padding: 16px; border: 1px solid #CBD5E1; border-radius: 8px; background-color: #F1F5F9; text-align: center;">
                    <p style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0F172A;">
                      Day 7 of 7 &middot; This is your last free briefing. Your briefings will pause after today. &middot; <a href="https://www.brainbrief.app/subscribe" style="color: #10B981; font-weight: 600; text-decoration: none;">Subscribe to Brain Brief Pro — $6/month &rarr;</a>
                    </p>
                  </td>
                </tr>
              </table>`;
    }
  }

  const topicBlocks = data.topics
    .map((topic, i) => {
      const isLast = i === data.topics.length - 1;

      const bulletItems = topic.bullets
        .map((bullet, bi) => {
          const bulletSourceList = topic.bulletSources?.[bi] ?? [];
          // Render inline source citations after the bullet text
          const citationHtml =
            bulletSourceList.length > 0
              ? ` <span style="font-size: 12px; color: #94A3B8;">[${bulletSourceList
                  .map(
                    (s) =>
                      `<a href="${escapeHtml(s.uri)}" style="color: #10B981; text-decoration: none; border-bottom: 1px solid #D1FAE5; font-size: 12px;" target="_blank">${escapeHtml(cleanSourceTitle(s.title))}</a>`
                  )
                  .join(", ")}]</span>`
              : "";
          return `
              <tr>
                <td style="padding: 0 0 8px 0; vertical-align: top; width: 20px;">
                  <span style="color: #10B981; font-size: 18px; line-height: 1;">&#8226;</span>
                </td>
                <td style="padding: 0 0 8px 8px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #334155;">
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
                    <td style="padding: 16px; background-color: #F8FAFC; border-left: 3px solid #10B981; border-radius: 0 6px 6px 0;">
                      <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-style: italic; color: #0F172A; line-height: 1.6;">
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
                          // Skip domain suffix if title IS the domain (avoids "formula1.com · formula1.com")
                          const domainSuffix = domain && displayTitle.toLowerCase() !== domain.toLowerCase()
                            ? `<span style="color: #94A3B8; font-size: 11px;"> · ${escapeHtml(domain)}</span>`
                            : "";
                          return `
                      <p style="margin: 0 0 4px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5;">
                        <a href="${escapeHtml(source.uri)}" style="color: #10B981; text-decoration: none; border-bottom: 1px solid #D1FAE5;" target="_blank">
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

      return `
          <!-- Topic: ${escapeHtml(topic.name)} -->
          <tr>
            <td style="padding: 24px 24px${isLast ? "" : "; border-bottom: 1px solid #F1F5F9"};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Badge -->
                <tr>
                  <td style="padding: 0 0 8px 0;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background-color: #F1F5F9; font-family: Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #E2E8F0;">
                      ${escapeHtml(topic.name)}
                    </span>
                  </td>
                </tr>
                <!-- Headline -->
                <tr>
                  <td style="padding: 0 0 12px 0;">
                    <h2 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #0F172A; line-height: 1.3;">
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
          </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0F172A !important; }
      .email-card { background-color: #1E293B !important; }
      .email-header { border-color: #334155 !important; }
      .email-intro { background-color: rgba(15, 23, 42, 0.6) !important; }
      .email-footer { background-color: rgba(30, 41, 59, 0.4) !important; border-color: #334155 !important; }
      .text-heading { color: #F8FAFC !important; }
      .text-body { color: #CBD5E1 !important; }
      .text-muted { color: #94A3B8 !important; }
      .topic-badge { background-color: #334155 !important; color: #F8FAFC !important; border-color: #475569 !important; }
      .bottom-line-bg { background-color: #0F172A !important; }
      .bottom-line-text { color: #F8FAFC !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; background-color: #FFFFFF;">
  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF;">

          ${welcomeHeader}

          <!-- ============ HEADER ============ -->
          <tr>
            <td class="email-header" style="padding: 28px 24px 20px 24px; border-bottom: 1px solid #F1F5F9;">
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

          <!-- ============ INTRO ============ -->
          <tr>
            <td class="email-intro" style="padding: 20px 24px; background-color: #FAFAFA;">
              <p class="text-body" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #475569;">
                ${escapeHtml(data.greeting)} Here's your personalized intelligence briefing on the topics that matter most today.
              </p>
            </td>
          </tr>

          <!-- ============ TOPICS ============ -->
          ${topicBlocks}

          ${grounded === false ? `
          <!-- ============ UNGROUNDED DISCLAIMER ============ -->
          <tr>
            <td style="padding: 12px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 16px; background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 6px;">
                    <p style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #92400E; line-height: 1.5;">
                      <strong>Note:</strong> This briefing could not be verified with live news sources. Some details may not reflect the very latest developments.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- ============ FOOTER ============ -->
          <tr>
            <td class="email-footer" style="padding: 28px 24px; background-color: #FAFAFA; border-top: 1px solid #F1F5F9; text-align: center;">
              ${footerCountdown}
              <p class="text-muted" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B; line-height: 1.6;">
                You're receiving this because you subscribed to topics on Brain Brief.
              </p>
              <p style="margin: 20px 0 0;">
                <a href="https://www.brainbrief.app/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #0F172A; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 6px; letter-spacing: 0.5px;">Manage Topics</a>
              </p>
              <p style="margin: 20px 0 0;">
                <a href="https://www.brainbrief.app/unsubscribe" class="text-muted" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; color: #94A3B8; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 16px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #94A3B8;">
                <a href="https://www.brainbrief.app/terms" style="color: #94A3B8; text-decoration: underline;">Terms</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.brainbrief.app/privacy" style="color: #94A3B8; text-decoration: underline;">Privacy</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Copyright below card -->
        <p class="text-muted" style="margin: 24px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #94A3B8; text-align: center;">
          &copy; ${year} Brain Brief. All rights reserved.<br>
          <span style="font-size: 10px; opacity: 0.7;">Powered by AI &bull; Grounded in Truth</span>
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

function buildLegacyEmailTemplate(contentHtml: string): string {
  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Add inline styles to HTML elements for email client compatibility
  const styledContent = addEmailInlineStyles(contentHtml);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
</head>
<body style="margin: 0; padding: 0; background-color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FFFFFF;">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 24px 20px 24px; border-bottom: 1px solid #F1F5F9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px;">
                      Brain<span style="color: #10B981;">Brief</span>
                    </h1>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">
                      ${escapeHtml(dateStr)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 24px; color: #334155; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6;">
              ${styledContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 28px 24px; background-color: #FAFAFA; border-top: 1px solid #F1F5F9; text-align: center;">
              <p style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B; line-height: 1.6;">
                You're receiving this because you subscribed to topics on Brain Brief.
              </p>
              <p style="margin: 20px 0 0;">
                <a href="https://www.brainbrief.app/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #0F172A; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 6px; letter-spacing: 0.5px;">Manage Topics</a>
              </p>
              <p style="margin: 20px 0 0;">
                <a href="https://www.brainbrief.app/dashboard" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; color: #94A3B8; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 16px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #94A3B8;">
                <a href="https://www.brainbrief.app/terms" style="color: #94A3B8; text-decoration: underline;">Terms</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.brainbrief.app/privacy" style="color: #94A3B8; text-decoration: underline;">Privacy</a>
              </p>
              <p style="margin: 24px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #94A3B8;">
                &copy; ${year} Brain Brief. All rights reserved.
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

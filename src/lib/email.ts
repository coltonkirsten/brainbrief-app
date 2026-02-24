/**
 * Email delivery module.
 *
 * Uses Resend when RESEND_API_KEY is set.
 * Falls back to console stub for local dev / when key isn't configured yet.
 *
 * Email template designed by Chelsea — "Premium Editorial Tech" aesthetic.
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
}

export async function sendBriefingEmail({
  to,
  subject,
  html,
  text,
  structured,
  trialInfo,
}: SendBriefingEmailParams): Promise<{
  success: boolean;
  messageId?: string;
}> {
  // Use Resend when configured
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const fromAddress =
        process.env.RESEND_FROM_EMAIL || "Brain Brief <onboarding@resend.dev>";

      const emailHtml = structured
        ? buildStructuredEmailTemplate(structured, trialInfo)
        : buildLegacyEmailTemplate(html);

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html: emailHtml,
        text,
        headers: {
          "List-Unsubscribe": "<https://brainbrief.app/dashboard>",
        },
      });

      if (error) {
        console.error("[email] Resend error:", error);
        return { success: false };
      }

      console.log(`[email] Sent to \${to}, messageId: \${data?.id}`);
      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error("[email] Failed to send via Resend:", err);
      return { success: false };
    }
  }

  // Stub: log to console when Resend isn't configured
  console.log(`[email-stub] Would send to: \${to}`);
  console.log(`[email-stub] Subject: \${subject}`);
  console.log(`[email-stub] HTML length: \${html.length} chars`);
  console.log(`[email-stub] Text preview: \${text.substring(0, 200)}...`);

  return { success: true, messageId: `stub-\${Date.now()}` };
}

// ---------------------------------------------------------------------------
// Structured email template — Chelsea's "Premium Editorial" design
// ---------------------------------------------------------------------------

function buildStructuredEmailTemplate(data: BriefingData, trialInfo?: TrialInfo): string {
  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

    const welcomeHeader = trialInfo && trialInfo.isTrialActive && !trialInfo.isSubscriber && trialInfo.trialDayNumber === 1
    ? `
      <!-- ============ WELCOME HEADER (DAY 1) ============ -->
      <tr>
        <td style="padding: 24px 0 0 0; background-color: transparent;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: transparent; border-bottom: 1px solid #E2E8F0; padding-bottom: 16px;">
            <tr>
              <td style="padding: 20px;">
                <p style="margin: 0 0 12px 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0F172A;">
                  Good morning — your first Brain Brief is below.
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

  let footerCountdown = "";
  if (trialInfo && trialInfo.isTrialActive && !trialInfo.isSubscriber) {
    const day = trialInfo.trialDayNumber;
    if (day === 1) {
      footerCountdown = `
              <p style="margin: 0 0 20px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B;">
                Day 1 of 7 — your free trial is active &middot; <a href="https://brainbrief.app/dashboard" style="color: #64748B; text-decoration: underline;">Manage Topics</a> &middot; <a href="https://brainbrief.app/subscribe" style="color: #10B981; font-weight: 600; text-decoration: none;">Subscribe to keep your briefings &rarr;</a>
              </p>`;
    } else if (day >= 2 && day <= 5) {
      const daysLeft = 7 - day + 1;
      footerCountdown = `
              <p style="margin: 0 0 20px 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B;">
                Day ${day} of 7 &middot; ${daysLeft} days left in your free trial &middot; <a href="https://brainbrief.app/subscribe" style="color: #10B981; font-weight: 600; text-decoration: none;">Subscribe to keep your briefings &rarr;</a>
              </p>`;
    } else if (day === 6) {
      footerCountdown = `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0;">
                <tr>
                  <td style="padding: 16px; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #F8FAFC; text-align: center;">
                    <p style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #334155;">
                      Day 6 of 7 &middot; Your last free briefing is tomorrow. &middot; <a href="https://brainbrief.app/subscribe" style="color: #10B981; font-weight: 600; text-decoration: none;">Keep your briefings going — $6/month &rarr;</a>
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
                      Day 7 of 7 &middot; This is your last free briefing. Your briefings will pause after today. &middot; <a href="https://brainbrief.app/subscribe" style="color: #10B981; font-weight: 600; text-decoration: none;">Subscribe to Brain Brief Pro — $6/month &rarr;</a>
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
        .map(
          (bullet) => `
              <tr>
                <td style="padding: 0 0 12px 0; vertical-align: top; width: 20px;">
                  <span style="color: #10B981; font-size: 18px; line-height: 1;">&#8226;</span>
                </td>
                <td style="padding: 0 0 12px 8px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #334155;">
                  \${escapeHtml(bullet)}
                </td>
              </tr>`
        )
        .join("");

      const bottomLineBlock = topic.bottomLine
        ? `
            <tr>
              <td style="padding: 16px 0 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 20px; background-color: #F8FAFC; border-left: 3px solid #10B981; border-radius: 0 6px 6px 0;">
                      <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-style: italic; color: #0F172A; line-height: 1.6;">
                        <strong style="font-style: normal; font-family: Helvetica, Arial, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #10B981; display: block; margin-bottom: 6px;">The Bottom Line</strong>
                        \${escapeHtml(topic.bottomLine)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
        : "";

      return `
          <!-- Topic: \${escapeHtml(topic.name)} -->
          <tr>
            <td style="padding: 36px 32px\${isLast ? "" : "; border-bottom: 1px solid #E2E8F0"};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Badge -->
                <tr>
                  <td style="padding: 0 0 16px 0;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background-color: #F1F5F9; font-family: Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #E2E8F0;">
                      \${escapeHtml(topic.name)}
                    </span>
                  </td>
                </tr>
                <!-- Headline -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <h2 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                      \${escapeHtml(topic.headline)}
                    </h2>
                  </td>
                </tr>
                <!-- Bullets -->
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      \${bulletItems}
                    </table>
                  </td>
                </tr>
                \${bottomLineBlock}
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
      .email-card { background-color: #1E293B !important; border-color: #334155 !important; }
      .email-header { border-color: #334155 !important; }
      .email-intro { background-color: rgba(15, 23, 42, 0.8) !important; border-color: #334155 !important; }
      .email-footer { background-color: rgba(30, 41, 59, 0.5) !important; border-color: #334155 !important; }
      .text-heading { color: #F8FAFC !important; }
      .text-body { color: #CBD5E1 !important; }
      .text-muted { color: #94A3B8 !important; }
      .topic-badge { background-color: #334155 !important; color: #F8FAFC !important; border-color: #475569 !important; }
      .bottom-line-bg { background-color: #0F172A !important; }
      .bottom-line-text { color: #F8FAFC !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; background-color: #F8FAFC;">
  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color: transparent;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: transparent;">

          \${welcomeHeader}

          <!-- ============ HEADER ============ -->
          <tr>
            <td class="email-header" style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #E2E8F0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <h1 class="text-heading" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px;">
                      Brain<span style="color: #10B981;">Brief</span>
                    </h1>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span class="text-muted" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">
                      \${escapeHtml(dateStr)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============ INTRO ============ -->
          <tr>
            <td class="email-intro" style="padding: 24px 32px; background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
              <p class="text-body" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #475569;">
                \${escapeHtml(data.greeting)} Here's your personalized intelligence briefing on the topics that matter most today.
              </p>
            </td>
          </tr>

          <!-- ============ TOPICS ============ -->
          \${topicBlocks}

          <!-- ============ FOOTER ============ -->
          <tr>
            <td class="email-footer" style="padding: 32px 0; background-color: transparent; border-top: 1px solid #E2E8F0; text-align: center;">
              ${footerCountdown}
              <p class="text-muted" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B; line-height: 1.6;">
                You're receiving this because you subscribed to topics on Brain Brief.
              </p>
              <p style="margin: 20px 0 0;">
                <a href="https://brainbrief.app/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #0F172A; color: #FFFFFF; font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 6px; letter-spacing: 0.5px;">Manage Topics</a>
              </p>
              <p style="margin: 20px 0 0;">
                <a href="https://brainbrief.app/dashboard" class="text-muted" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; color: #94A3B8; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Copyright below card -->
        <p class="text-muted" style="margin: 24px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #94A3B8; text-align: center;">
          &copy; \${year} Brain Brief. All rights reserved.<br>
          <span style="font-size: 10px; opacity: 0.7;">Powered by AI • Grounded in Truth</span>
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Brain Brief</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #E2E8F0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px;">
                      Brain<span style="color: #10B981;">Brief</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
              \${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.6;">
                You're receiving this because you subscribed to topics on Brain Brief.
              </p>
              <p style="margin: 20px 0 0;">
                <a href="https://brainbrief.app/dashboard" style="font-size: 12px; font-weight: 500; color: #94A3B8; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 24px 0 0; font-size: 12px; color: #94A3B8;">
                &copy; \${year} Brain Brief. All rights reserved.
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

/** Escape HTML special characters in text content */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

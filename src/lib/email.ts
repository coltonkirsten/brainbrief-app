/**
 * Email delivery module.
 *
 * Uses Resend when RESEND_API_KEY is set.
 * Falls back to console stub for local dev / when key isn't configured yet.
 *
 * Email template designed by Chelsea — "Premium Editorial Tech" aesthetic.
 */

import type { BriefingData } from "./gemini";

interface SendBriefingEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  structured?: BriefingData;
}

export async function sendBriefingEmail({
  to,
  subject,
  html,
  text,
  structured,
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
        ? buildStructuredEmailTemplate(structured)
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

// ---------------------------------------------------------------------------
// Topic badge color palette — cycles through for each topic
// ---------------------------------------------------------------------------

const BADGE_COLORS = [
  { bg: "#EEF2FF", text: "#4F46E5", accent: "#6366F1" }, // Indigo
  { bg: "#ECFDF5", text: "#047857", accent: "#059669" }, // Emerald
  { bg: "#FFF7ED", text: "#C2410C", accent: "#EA580C" }, // Orange
  { bg: "#ECFEFF", text: "#0E7490", accent: "#0891B2" }, // Cyan
  { bg: "#FDF2F8", text: "#BE185D", accent: "#DB2777" }, // Pink
  { bg: "#F5F3FF", text: "#6D28D9", accent: "#7C3AED" }, // Violet
];

// ---------------------------------------------------------------------------
// Structured email template — Chelsea's "Premium Editorial" design
// ---------------------------------------------------------------------------

function buildStructuredEmailTemplate(data: BriefingData): string {
  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const topicBlocks = data.topics
    .map((topic, i) => {
      const color = BADGE_COLORS[i % BADGE_COLORS.length];
      const isLast = i === data.topics.length - 1;

      const bulletItems = topic.bullets
        .map(
          (bullet) => `
              <tr>
                <td style="padding: 0 0 12px 0; vertical-align: top; width: 20px;">
                  <span style="color: ${color.accent}; font-size: 18px; line-height: 1;">&#8226;</span>
                </td>
                <td style="padding: 0 0 12px 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
                  ${escapeHtml(bullet)}
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
                    <td style="padding: 16px; background-color: #F8FAFC; border-left: 4px solid ${color.accent}; border-radius: 0 8px 8px 0;">
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-style: italic; color: #475569; line-height: 1.6;">
                        <strong style="font-style: normal;">The Bottom Line:</strong> ${escapeHtml(topic.bottomLine)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
        : "";

      return `
          <!-- Topic: ${escapeHtml(topic.name)} -->
          <tr>
            <td style="padding: 28px 32px${isLast ? "" : "; border-bottom: 1px solid #E2E8F0"};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Badge -->
                <tr>
                  <td style="padding: 0 0 12px 0;">
                    <span style="display: inline-block; padding: 3px 10px; border-radius: 4px; background-color: ${color.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; color: ${color.text}; text-transform: uppercase; letter-spacing: 0.05em;">
                      ${escapeHtml(topic.name)}
                    </span>
                  </td>
                </tr>
                <!-- Headline -->
                <tr>
                  <td style="padding: 0 0 16px 0;">
                    <h2 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #0F172A; line-height: 1.3;">
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
      .email-intro { background-color: rgba(30, 41, 59, 0.5) !important; }
      .email-footer { background-color: rgba(30, 41, 59, 0.5) !important; }
      .text-heading { color: #F1F5F9 !important; }
      .text-body { color: #CBD5E1 !important; }
      .text-muted { color: #94A3B8 !important; }
      .bottom-line-block { background-color: #1E293B !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  <table role="presentation" class="email-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBFBFD;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">

          <!-- ============ HEADER ============ -->
          <tr>
            <td class="email-header" style="padding: 24px 32px; border-bottom: 1px solid #E2E8F0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px;">
                      Brain<span style="color: #6366F1;">Brief</span>
                    </h1>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: 500; color: #64748B; text-transform: uppercase; letter-spacing: 1.5px;">
                      ${escapeHtml(dateStr)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============ INTRO ============ -->
          <tr>
            <td class="email-intro" style="padding: 24px 32px; background-color: rgba(248, 250, 252, 0.5);">
              <p class="text-body" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569;">
                ${escapeHtml(data.greeting)} Here's your personalized briefing on the topics that matter most today. Stay informed. Stay sharp.
              </p>
            </td>
          </tr>

          <!-- ============ TOPICS ============ -->
          ${topicBlocks}

          <!-- ============ FOOTER ============ -->
          <tr>
            <td class="email-footer" style="padding: 28px 32px; background-color: #F8FAFC; text-align: center;">
              <p class="text-muted" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #94A3B8; line-height: 1.6;">
                You're receiving this because you subscribed to topics on Brain Brief.
              </p>
              <p style="margin: 16px 0 0;">
                <a href="https://brainbrief.app/dashboard" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none;">Manage Topics</a>
                <span style="color: #E2E8F0; padding: 0 12px;">|</span>
                <a href="https://brainbrief.app/dashboard" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Copyright below card -->
        <p style="margin: 24px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #CBD5E1; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
          &copy; ${year} Brain Brief. All rights reserved.
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
<body style="margin: 0; padding: 0; background-color: #FBFBFD; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBFBFD;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #E2E8F0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px;">
                      Brain<span style="color: #6366F1;">Brief</span>
                    </h1>
                  </td>
                  <td align="right" style="font-size: 13px; color: #64748B;">
                    Your daily briefing
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 28px 32px; color: #0f172a; font-size: 15px; line-height: 1.7;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 28px 32px; background-color: #F8FAFC; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.6;">
                You're receiving this because you subscribed to topics on
                <a href="https://brainbrief.app" style="color: #6366f1; text-decoration: none;">Brain Brief</a>.
              </p>
              <p style="margin: 12px 0 0;">
                <a href="https://brainbrief.app/dashboard" style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none;">Manage Topics</a>
                <span style="color: #E2E8F0; padding: 0 12px;">|</span>
                <a href="https://brainbrief.app/dashboard" style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none;">Unsubscribe</a>
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #cbd5e1;">
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

/** Escape HTML special characters in text content */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

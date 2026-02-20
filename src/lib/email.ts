/**
 * Email delivery module.
 *
 * Uses Resend when RESEND_API_KEY is set.
 * Falls back to console stub for local dev / when key isn't configured yet.
 */

interface SendBriefingEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendBriefingEmail({
  to,
  subject,
  html,
  text,
}: SendBriefingEmailParams): Promise<{ success: boolean; messageId?: string }> {
  // Use Resend when configured
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: "Brain Brief <brief@brainbrief.app>",
        to,
        subject,
        html: wrapInEmailTemplate(html),
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

/**
 * Wraps briefing HTML content in a responsive, mobile-first email template.
 * Uses inline styles only (no external CSS) for maximum email client compatibility.
 */
function wrapInEmailTemplate(contentHtml: string): string {
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
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">
                      <span style="color: #6366f1;">Brain</span>Brief
                    </span>
                  </td>
                  <td align="right" style="font-size: 13px; color: #94a3b8;">
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
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                You received this because you signed up for
                <a href="https://brainbrief.app" style="color: #6366f1; text-decoration: none;">Brain Brief</a>.
              </p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                <a href="https://brainbrief.app/dashboard" style="color: #94a3b8; text-decoration: underline;">Manage topics</a>
                &nbsp;&middot;&nbsp;
                <a href="https://brainbrief.app/dashboard" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #cbd5e1;">
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

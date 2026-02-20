/**
 * Email delivery module.
 *
 * Currently stubbed — logs to console and returns success.
 * Will be wired to Resend once the API key is available.
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
  // Check if Resend is configured
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
  console.log(`[email-stub] Text length: ${text.length} chars`);

  return { success: true, messageId: `stub-${Date.now()}` };
}

/**
 * Wraps briefing HTML content in a responsive email template.
 */
function wrapInEmailTemplate(contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Brain Brief</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 20px; font-weight: 700; color: #0f172a;">
                <span style="color: #6366f1;">Brain</span>Brief
              </span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px; color: #0f172a; font-size: 15px; line-height: 1.7;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                You received this because you signed up for <a href="https://brainbrief.app" style="color: #6366f1; text-decoration: none;">Brain Brief</a>.
              </p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Brain Brief. All rights reserved.
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

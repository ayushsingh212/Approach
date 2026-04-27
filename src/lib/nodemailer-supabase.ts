import nodemailer from "nodemailer";

interface SendEmailWithLinksOptions {
  to: string;
  subject: string;
  html: string;
  companyName?: string;
  gmailUser: string;
  gmailPass: string;
  attachmentUrls?: Array<{
    filename: string;
    url: string;
  }>;
}

// ─── Build professional attachment cards ─────────────────────────────────────
function buildAttachmentsSection(
  attachmentUrls: Array<{ filename: string; url: string }>
): string {
  if (attachmentUrls.length === 0) return "";

  const cards = attachmentUrls
    .map(
      (att) => `
      <tr>
        <td style="padding: 6px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="
                background-color: #f8f9fa;
                border: 1px solid #e2e8f0;
                border-left: 4px solid #6366f1;
                border-radius: 8px;
                padding: 14px 18px;
              ">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td width="60%" style="vertical-align: middle;">
                      <span style="font-size: 18px; margin-right: 10px; vertical-align: middle;">📄</span>
                      <span style="
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                        font-size: 14px;
                        font-weight: 600;
                        color: #1e293b;
                        vertical-align: middle;
                      ">${att.filename}</span>
                    </td>
                    <td width="40%" style="text-align: right; vertical-align: middle; white-space: nowrap;">
                      <a href="${att.url}"
                         target="_blank"
                         style="
                           display: inline-block;
                           padding: 8px 20px;
                           background-color: #6366f1;
                           color: #ffffff;
                           text-decoration: none;
                           border-radius: 6px;
                           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                           font-size: 13px;
                           font-weight: 600;
                           letter-spacing: 0.3px;
                         ">
                        ↓ Download
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 6px;">
                      <span style="
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                        font-size: 11px;
                        color: #94a3b8;
                      ">Link expires in 7 days</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `
    <!-- Divider -->
    <tr>
      <td style="padding: 28px 0 0 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="border-top: 1px solid #e2e8f0;"></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Attachments heading -->
    <tr>
      <td style="padding: 20px 0 12px 0;">
        <span style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        ">📎 Attachments</span>
      </td>
    </tr>

    <!-- Attachment cards -->
    ${cards}
  `;
}

// ─── Wrap the user's plain-text / HTML body in a professional shell ──────────
function buildFinalHtml(
  bodyText: string,
  senderEmail: string,
  attachmentUrls: Array<{ filename: string; url: string }>
): string {
  const year = new Date().getFullYear();
  const attachmentsHtml = buildAttachmentsSection(attachmentUrls);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600"
               style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px;
                      box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">

          <!-- Header accent bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); height: 5px; padding: 0;"></td>
          </tr>

          <!-- Body padding -->
          <tr>
            <td style="padding: 40px 44px 32px 44px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                <!-- Email body (user's text — indentation preserved) -->
                <tr>
                  <td>
                    <div style="
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                      font-size: 15px;
                      line-height: 1.75;
                      color: #1e293b;
                      white-space: pre-wrap;
                      word-break: break-word;
                    ">${bodyText}</div>
                  </td>
                </tr>

                ${attachmentsHtml}

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background-color: #f8fafc;
              border-top: 1px solid #e2e8f0;
              padding: 20px 44px;
            ">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                    font-size: 12px;
                    color: #94a3b8;
                    line-height: 1.6;
                  ">
                    This email was sent by
                    <a href="mailto:${senderEmail}" style="color: #6366f1; text-decoration: none;">${senderEmail}</a>
                    &nbsp;·&nbsp; © ${year}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function sendEmailWithLinks(
  options: SendEmailWithLinksOptions
): Promise<string> {
  const {
    to,
    subject,
    html,
    companyName,
    gmailUser,
    gmailPass,
    attachmentUrls = [],
  } = options;

  try {
    if (!gmailUser || !gmailPass) {
      throw new Error("Gmail credentials not configured");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.verify();

    const finalHtml = buildFinalHtml(html, gmailUser, attachmentUrls);

    const info = await transporter.sendMail({
      from: `"Approach" <${gmailUser}>`,
      to,
      subject,
      html: finalHtml,
    });

    console.log(
      `✅ Email sent to ${to} (${companyName}) with ${attachmentUrls.length} download link(s) — Message ID: ${info.messageId}`
    );
    return info.messageId;
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

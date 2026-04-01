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

export async function sendEmailWithLinks(
  options: SendEmailWithLinksOptions
): Promise<string> {
  const { to, subject, html, companyName, gmailUser, gmailPass, attachmentUrls = [] } = options;

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

    let attachmentsSection = "";
    if (attachmentUrls.length > 0) {
      attachmentsSection = `
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e0e0e0;" />
        <h3 style="color: #333; margin-top: 20px;">📎 Attachments</h3>
        <p style="color: #666; margin-bottom: 10px;">Please download the following documents:</p>
        <ul style="list-style: none; padding: 0;">
          ${attachmentUrls.map((att) => `
            <li style="margin-bottom: 8px;">
              <a href="${att.url}"
                 style="display: inline-block; padding: 10px 16px; background-color: #f59e0b;
                        color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
                📥 Download ${att.filename}
              </a>
              <span style="color: #999; font-size: 12px; margin-left: 8px;">(Link expires in 7 days)</span>
            </li>
          `).join("")}
        </ul>
      `;
    }

    const finalHtml = `${html}${attachmentsSection}`;

    const info = await transporter.sendMail({
      from: gmailUser,
      to,
      subject,
      html: finalHtml,
    });

    console.log(`✅ Email sent to ${to} (${companyName}) with ${attachmentUrls.length} download link(s) - Message ID: ${info.messageId}`);
    return info.messageId;
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}
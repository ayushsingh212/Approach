// src/lib/verifyGmailCredentials.ts
// Reusable utility — call this before saving OR before sending
// Returns { valid: true } or { valid: false, error: string }

import nodemailer from "nodemailer";

interface VerifyResult {
  valid: boolean;
  error?: string;
}

export async function verifyGmailCredentials(
  senderEmail: string,
  plainAppPassword: string
): Promise<VerifyResult> {
  // ── Basic format checks first (fast, no network) ──────────────────────────
  if (!senderEmail || !plainAppPassword) {
    return { valid: false, error: "Sender email and App Password are required" };
  }

  if (!senderEmail.endsWith("@gmail.com")) {
    return { valid: false, error: "Sender email must be a Gmail address" };
  }

  const clean = plainAppPassword.replace(/\s/g, "");
  if (clean.length !== 16) {
    return {
      valid: false,
      error: "Google App Password must be exactly 16 characters (no spaces)",
    };
  }

  // ── Network check — actually connect to Gmail SMTP ────────────────────────
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: clean,
    },
    // Timeout so it doesn't hang forever
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });

  try {
    await transporter.verify();
    return { valid: true };
  } catch (err: any) {
    // Parse Gmail SMTP error codes into human-readable messages
    const msg: string = err?.message ?? "";

    if (msg.includes("Invalid login") || msg.includes("Username and Password not accepted")) {
      return {
        valid: false,
        error:
          "Gmail rejected the credentials. Make sure 2-Step Verification is ON and you are using an App Password — not your regular Gmail password.",
      };
    }

    if (msg.includes("Too many login attempts")) {
      return {
        valid: false,
        error: "Too many login attempts on this Gmail account. Wait a few minutes and try again.",
      };
    }

    if (msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT")) {
      return {
        valid: false,
        error: "Could not reach Gmail servers. Check your internet connection.",
      };
    }

    return {
      valid: false,
      error: `Gmail verification failed: ${msg}`,
    };
  } finally {
    transporter.close();
  }
}
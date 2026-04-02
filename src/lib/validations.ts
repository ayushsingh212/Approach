import { z } from "zod";

// ─── EMOJI REGEX (Safe Unicode Range) ───────────────────
export const NO_EMOJI_REGEX = /^[^(\u2700-\u27BF)|(\uE000-\uF8FF)|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|(\u2011-\u26FF)|\uD83E[\uDD10-\uDDFF]]*$/;

// ─── AUTH SCHEMAS ───────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(NO_EMOJI_REGEX, "Emojis are not allowed in name"),
  email: z.string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(10, "Password must be at least 10 characters for better security")
    .max(128, "Password too long"),
  senderEmail: z.string()
    .email("Invalid sender email")
    .regex(/@gmail\.com$/, "Only Gmail is supported for sender email")
    .toLowerCase()
    .trim(),
  googleAppPassword: z.string()
    .length(16, "Google App Password must be exactly 16 characters (no spaces)")
    .regex(/^[a-z]+$/, "App Password should be lowercase alphabetic characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

// ─── COMPANY SCHEMAS ────────────────────────────────────────────────────────

export const CompanySchemaValidation = z.object({
  name: z.string()
    .min(2, "Company name too short")
    .max(100, "Too long")
    .regex(NO_EMOJI_REGEX, "Emojis not allowed"),
  email: z.string().email("Invalid company email").toLowerCase().trim(),
  category: z.array(z.string()).min(1, "Select at least one category"),
  website: z.string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal("")),
  description: z.string()
    .max(500, "Description too long")
    .regex(NO_EMOJI_REGEX, "Emojis not allowed")
    .optional(),
  location: z.string()
    .max(100, "Location too long")
    .regex(NO_EMOJI_REGEX, "Emojis not allowed")
    .optional(),
  tags: z.array(z.string()).optional(),
});

// ─── EMAIL SCHEMAS ─────────────────────────────────────────────────────────

export const SendEmailSchema = z.object({
  subject: z.string()
    .min(1, "Subject is required")
    .max(150, "Subject too long")
    .regex(NO_EMOJI_REGEX, "Emojis not allowed in subject"),
  emailBody: z.string()
    .min(10, "Email body too short")
    .max(10000, "Email body too long (max 10,000 chars)")
    .regex(NO_EMOJI_REGEX, "Emojis not allowed in email body"),
  companyIds: z.array(z.string()).min(1, "Select at least one company"),
});

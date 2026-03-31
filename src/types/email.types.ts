// ─── Delivery Result (per company) ───────────────────────────────────────────
export type StatusType = "" | "completed" | "partial" | "all_failed";

export interface IDeliveryResult {
  company: string;                   // company ObjectId
  companyEmail: string;
  companyName: string;
  status: "sent" | "failed";
  errorMessage?: string;
  messageId?: string;
}

// ─── Email Log ────────────────────────────────────────────────────────────────

export interface IEmailLog {
  _id: string;
  sentBy: string;
  senderEmail: string;
  subject: string;
  body: string;
  companies: Array<{
    _id: string;
    name: string;
    email: string;
    category: string;
  }> | string[];
  deliveryResults: IDeliveryResult[];
  totalTargeted: number;
  totalSent: number;
  totalFailed: number;
  status: "completed" | "partial" | "all_failed";
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Send Email ───────────────────────────────────────────────────────────────

export interface SendEmailPayload {
  companyIds: string[];
  subject: string;
  emailBody: string;
}

export interface SendEmailSummary {
  totalTargeted: number;
  totalSent: number;
  totalFailed: number;
  status: "completed" | "partial" | "all_failed";
}

export interface SendEmailResponse {
  success: boolean;
  summary: SendEmailSummary;
  deliveryResults: IDeliveryResult[];
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface EmailLogFilters {
  status?: "completed" | "partial" | "all_failed" | "";
  page?: number;
  limit?: number;
}

// ─── Company search (public endpoint) ────────────────────────────────────────

export interface CompanySearchFilters {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}
// ─── Delivery Result (per company) ────────────────────────────────────────────
export type StatusType = "" | "completed" | "partial" | "all_failed";

export interface IDeliveryResult {
  company: string;        // company ObjectId
  companyEmail: string;
  companyName: string;
  status: "sent" | "failed";
  errorMessage?: string;
  messageId?: string;
}

// ─── Attachment ───────────────────────────────────────────────────────────────

export interface IAttachmentUrl {
  filename: string;
  url: string;
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
  attachmentUrls?: IAttachmentUrl[];
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Send Email ───────────────────────────────────────────────────────────────

export interface SendEmailSummary {
  totalTargeted: number;
  totalSent: number;
  totalFailed: number;
  status: "completed" | "partial" | "all_failed";
}

export interface SendEmailResponse {
  success: boolean;
  message?: string;
  summary?: SendEmailSummary;
  deliveryResults?: IDeliveryResult[];
  sentCount?: number;
  failedCount?: number;
}

export interface SendEmailPayload {
  subject: string;
  emailBody: string;
  companyIds: string[];
  attachments?: File[];
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface EmailLogFilters {
  status?: "completed" | "partial" | "all_failed" | "";
  page?: number;
  limit?: number;
}

// ─── Company search ───────────────────────────────────────────────────────────

export interface CompanySearchFilters {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface SearchCompaniesPayload {
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
}

export interface SearchCompaniesResponse {
  data: Company[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface Company {
  _id: string;
  name: string;
  email: string;
  category: string;
  website?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface EmailHistory {
  _id: string;
  subject: string;
  body: string;
  sentTo: Company[];
  sentAt: string;
  status: "sent" | "failed" | "pending";
}
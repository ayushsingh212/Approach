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

// src/types/email.types.ts

export interface SendEmailPayload {
  subject: string;
  emailBody: string;
  companyIds: string[];
  attachments?: File[]; // ✅ NEW - Optional attachments
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  sentCount?: number; // ✅ NEW - Number of emails sent
  failedCount?: number; // Optional - Number of failed sends
  data?: {
    sentTo?: string[];
    failedTo?: string[];
  };
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

export interface IAttachmentUrl {
  filename: string;
  url: string;
}

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
  attachmentUrls: IAttachmentUrl[]; // ✅ add this
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}
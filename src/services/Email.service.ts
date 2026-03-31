import { SendEmailPayload, SendEmailResponse, CompanySearchFilters } from "@/src/types/email.types";
import { ICompany, PaginatedResponse } from "@/src/types/admin.types";

// ─── Email Service ────────────────────────────────────────────────────────────

export const emailService = {
  /**
   * POST /api/email/send
   * Sends emails to target companies using the user's Gmail + App Password.
   * Decrypts credentials server-side, verifies SMTP, then sends in parallel.
   */
  sendEmail: async (payload: SendEmailPayload): Promise<SendEmailResponse> => {
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to send emails");
    return data;
  },

  /**
   * GET /api/companies
   * Public endpoint — searches active companies to populate the send-to selector.
   * Uses MongoDB full-text index on name, category, tags, location.
   */
  searchCompanies: async (
    filters?: CompanySearchFilters
  ): Promise<PaginatedResponse<ICompany>> => {
    const params = new URLSearchParams();
    if (filters?.search)   params.set("search",   filters.search);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.page)     params.set("page",     String(filters.page));
    if (filters?.limit)    params.set("limit",    String(filters.limit));

    const res = await fetch(`/api/companies?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to search companies");
    return data;
  },
};
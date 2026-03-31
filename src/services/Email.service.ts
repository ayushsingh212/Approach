import {
  SendEmailPayload,
  SendEmailResponse,
  CompanySearchFilters,
} from "@/src/types/email.types";
import { ICompany, PaginatedResponse } from "@/src/types/admin.types";
import api from "@/src/lib/axios";

// ─── Email Service ────────────────────────────────────────────────────────────

export const emailService = {
  /**
   * POST /api/email/send
   * Sends emails to target companies using the user's Gmail + App Password.
   * Decrypts credentials server-side, verifies SMTP, then sends in parallel.
   */
  sendEmail: async (payload: SendEmailPayload): Promise<SendEmailResponse> => {
    const { data } = await api.post<SendEmailResponse>("/email/send", payload);
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
    const { data } = await api.get<PaginatedResponse<ICompany>>(
      "/companies",
      { params: filters }
    );
    return data;
  },
};
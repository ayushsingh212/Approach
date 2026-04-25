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
   * ✅ NEW: Sends emails with attachments using FormData
   * FormData allows multipart/form-data for file upload
   */
  sendEmailWithAttachments: async (formData: FormData) => {
    const { data } = await api.post("/email/send-with-supabase", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /**
   * POST /api/email/send
   * Original method - for backward compatibility (without attachments)
   */
  sendEmail: async (payload: SendEmailPayload): Promise<SendEmailResponse> => {
    const { data } = await api.post<SendEmailResponse>(
      "/email/send",
      payload,
    );
    return data;
  },

  /**
   * GET /api/companies
   * Public endpoint — searches active companies to populate the send-to selector.
   * Supports pagination (page, limit) for infinite-scroll loading.
   * Uses MongoDB full-text index on name, category, tags, location.
   */
  searchCompanies: async (
    filters?: CompanySearchFilters,
  ): Promise<PaginatedResponse<ICompany>> => {
    const { data } = await api.get<PaginatedResponse<ICompany>>("/companies", {
      params: {
        ...filters,
        limit: filters?.limit ?? 20, // default page size = 20
      },
    });
    return data;
  },
};

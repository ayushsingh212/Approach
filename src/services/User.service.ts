import { IUser, UpdateCredentialsPayload } from "@/src/types/user.types";
import { PaginatedResponse } from "@/src/types/admin.types";
import { IEmailLog, EmailLogFilters } from "@/src/types/email.types";

// ─── User Service ─────────────────────────────────────────────────────────────

export const userService = {
  /**
   * GET /api/user
   * Returns the currently authenticated user's profile.
   */
  getProfile: async (): Promise<IUser> => {
    const res = await fetch("/api/user");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to fetch profile");
    return data.user;
  },

  /**
   * PUT /api/user/credentials
   * Updates senderEmail and/or googleAppPassword.
   * Verifies Gmail credentials against SMTP before saving.
   */
  updateCredentials: async (
    payload: UpdateCredentialsPayload
  ): Promise<{ message: string; user: IUser }> => {
    const res = await fetch("/api/user/credentials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to update credentials");
    return data;
  },

  /**
   * GET /api/user/sentEmails
   * Returns paginated email logs for the current user.
   */
  getSentEmails: async (
    filters?: EmailLogFilters
  ): Promise<PaginatedResponse<IEmailLog>> => {
    const params = new URLSearchParams();
    if (filters?.page)   params.set("page",   String(filters.page));
    if (filters?.limit)  params.set("limit",  String(filters.limit));
    if (filters?.status) params.set("status", filters.status);

    const res = await fetch(`/api/user/sentEmails?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to fetch sent emails");
    return data;
  },
};
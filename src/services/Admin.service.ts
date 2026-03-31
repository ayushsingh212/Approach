import {
  ICompany,
  IAdminUser,
  AddCompanyPayload,
  UpdateCompanyPayload,
  CompanyFilters,
  UserFilters,
  PaginatedResponse,
} from "@/src/types/admin.types";

// ─── Admin Service ────────────────────────────────────────────────────────────
// All routes are protected at middleware level (admin role required).

export const adminService = {
  // ── Companies ──────────────────────────────────────────────────────────────

  /**
   * GET /api/admin/companies
   * Supports search, category, active flag, and pagination.
   */
  getCompanies: async (
    filters?: CompanyFilters
  ): Promise<PaginatedResponse<ICompany>> => {
    const params = new URLSearchParams();
    if (filters?.search)   params.set("search",   filters.search);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.active)   params.set("active",   filters.active);
    if (filters?.page)     params.set("page",     String(filters.page));
    if (filters?.limit)    params.set("limit",    String(filters.limit));

    const res = await fetch(`/api/admin/companies?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to fetch companies");
    return data;
  },

  /**
   * GET /api/admin/companies/:id
   * Fetches a single company with addedBy populated.
   */
  getCompanyById: async (id: string): Promise<ICompany> => {
    const res = await fetch(`/api/admin/companies/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Company not found");
    return data.company;
  },

  /**
   * POST /api/admin/companies
   * Adds a new company. addedBy is resolved server-side from session.
   */
  addCompany: async (payload: AddCompanyPayload): Promise<ICompany> => {
    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to add company");
    return data.company;
  },

  /**
   * PUT /api/admin/companies/:id
   * Updates allowed fields only (mass-assignment safe on server).
   */
  updateCompany: async (
    id: string,
    payload: UpdateCompanyPayload
  ): Promise<ICompany> => {
    const res = await fetch(`/api/admin/companies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to update company");
    return data.company;
  },

  /**
   * DELETE /api/admin/companies/:id
   * Soft-deletes: sets isActive = false, does not remove the document.
   */
  deleteCompany: async (id: string): Promise<ICompany> => {
    const res = await fetch(`/api/admin/companies/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to delete company");
    return data.company;
  },

  // ── Users ──────────────────────────────────────────────────────────────────

  /**
   * GET /api/admin/users
   * Returns paginated user list. Supports name/email search and role filter.
   */
  getUsers: async (
    filters?: UserFilters
  ): Promise<PaginatedResponse<IAdminUser>> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.role)   params.set("role",   filters.role);
    if (filters?.page)   params.set("page",   String(filters.page));
    if (filters?.limit)  params.set("limit",  String(filters.limit));

    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to fetch users");
    return data;
  },

  /**
   * PATCH /api/admin/users
   * Toggles a user's role between "user" and "admin".
   */
  updateUserRole: async (
    userId: string,
    role: "user" | "admin"
  ): Promise<IAdminUser> => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to update role");
    return data.user;
  },
};
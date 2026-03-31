import {
  ICompany,
  IAdminUser,
  AddCompanyPayload,
  UpdateCompanyPayload,
  CompanyFilters,
  UserFilters,
  PaginatedResponse,
} from "@/src/types/admin.types";
import api from "@/src/lib/axios";

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
    const { data } = await api.get<PaginatedResponse<ICompany>>(
      "/admin/companies",
      { params: filters }
    );
    return data;
  },

  /**
   * GET /api/admin/companies/:id
   * Fetches a single company with addedBy populated.
   */
  getCompanyById: async (id: string): Promise<ICompany> => {
    const { data } = await api.get<{ company: ICompany }>(
      `/admin/companies/${id}`
    );
    return data.company;
  },

  /**
   * POST /api/admin/companies
   * Adds a new company. addedBy is resolved server-side from session.
   */
  addCompany: async (payload: AddCompanyPayload): Promise<ICompany> => {
    const { data } = await api.post<{ company: ICompany }>(
      "/admin/companies",
      payload
    );
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
    const { data } = await api.put<{ company: ICompany }>(
      `/admin/companies/${id}`,
      payload
    );
    return data.company;
  },

  /**
   * DELETE /api/admin/companies/:id
   * Soft-deletes: sets isActive = false, does not remove the document.
   */
  deleteCompany: async (id: string): Promise<ICompany> => {
    const { data } = await api.delete<{ company: ICompany }>(
      `/admin/companies/${id}`
    );
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
    const { data } = await api.get<PaginatedResponse<IAdminUser>>(
      "/admin/users",
      { params: filters }
    );
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
    const { data } = await api.patch<{ user: IAdminUser }>(
      "/admin/users",
      { userId, role }
    );
    return data.user;
  },
};
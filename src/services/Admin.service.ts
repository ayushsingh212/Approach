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

export const adminService = {
  // ═════════════════════════════════════════════════════════════════════════
  // COMPANIES ENDPOINTS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/admin/companies
   * Fetch list of companies with pagination and filters
   * 
   * @param filters - { page, limit, search, category, active }
   * @returns Paginated list of companies with multiple categories
   * 
   * @example
   * const result = await adminService.getCompanies({ 
   *   page: 1, 
   *   limit: 20,
   *   category: "Technology"  // Single category for filtering
   * });
   */
  getCompanies: async (
    filters?: CompanyFilters
  ): Promise<PaginatedResponse<ICompany>> => {
    try {
      const { data } = await api.get<PaginatedResponse<ICompany>>(
        "/admin/companies",
        { params: filters }
      );
      return data;
    } catch (error: any) {
      console.error("[adminService] getCompanies failed:", error.message);
      throw error;
    }
  },

  /**
   * POST /api/admin/companies
   * Create one or many new companies
   * 
   * @param payload - AddCompanyPayload | AddCompanyPayload[]
   * @returns Created company or array of created companies
   */
  addCompany: async (payload: AddCompanyPayload | AddCompanyPayload[]): Promise<ICompany | ICompany[]> => {
    try {
      const { data } = await api.post<{ company: ICompany; companies: ICompany[]; message: string }>(
        "/admin/companies",
        payload
      );
      return Array.isArray(payload) ? data.companies : data.company;
    } catch (error: any) {
      console.error("[adminService] addCompany failed:", error.message);
      throw error;
    }
  },


  /**
   * GET /api/admin/companies/:id
   * Fetch a single company with full details
   * 
   * @param id - Company ID
   * @returns Single company with array of categories
   */
  getCompanyById: async (id: string): Promise<ICompany> => {
    try {
      const { data } = await api.get<{ company: ICompany }>(
        `/admin/companies/${id}`
      );
      return data.company;
    } catch (error: any) {
      console.error("[adminService] getCompanyById failed:", error.message);
      throw error;
    }
  },

  /**
   * PUT /api/admin/companies/:id
   * Update company details including multiple categories
   * 
   * @param id - Company ID
   * @param payload - Partial company data to update (all fields optional)
   * @returns Updated company with array of categories
   * 
   * @example
   * // Update categories
   * const updated = await adminService.updateCompany(companyId, {
   *   category: ["Technology", "Education"]  // ✅ Replace with new categories
   * });
   * 
   * // Update other fields
   * const updated = await adminService.updateCompany(companyId, {
   *   name: "New Name",
   *   website: "https://newurl.com",
   *   isActive: false
   * });
   */
  updateCompany: async (
    id: string,
    payload: UpdateCompanyPayload
  ): Promise<ICompany> => {
    try {
      const { data } = await api.put<{ company: ICompany; message: string }>(
        `/admin/companies/${id}`,
        payload
      );
      return data.company;
    } catch (error: any) {
      console.error("[adminService] updateCompany failed:", error.message);
      throw error;
    }
  },

  /**
   * DELETE /api/admin/companies/:id
   * Soft-delete (deactivate) a company
   * 
   * @param id - Company ID
   * @returns Deleted (deactivated) company
   * 
   * Note: This is a soft delete — sets isActive to false
   * The company record remains in database
   */
  deleteCompany: async (id: string): Promise<ICompany> => {
    try {
      const { data } = await api.delete<{ company: ICompany; message: string }>(
        `/admin/companies/${id}`
      );
      return data.company;
    } catch (error: any) {
      console.error("[adminService] deleteCompany failed:", error.message);
      throw error;
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // USERS ENDPOINTS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/admin/users
   * Fetch list of users with pagination and filters
   * 
   * @param filters - { page, limit, search?, role? }
   * @returns Paginated list of users
   * 
   * @example
   * const result = await adminService.getUsers({
   *   page: 1,
   *   limit: 20,
   *   role: "admin"  // Filter by role
   * });
   */
  getUsers: async (
    filters?: UserFilters
  ): Promise<PaginatedResponse<IAdminUser>> => {
    try {
      const { data } = await api.get<PaginatedResponse<IAdminUser>>(
        "/admin/users",
        { params: filters }
      );
      return data;
    } catch (error: any) {
      console.error("[adminService] getUsers failed:", error.message);
      throw error;
    }
  },

  /**
   * PATCH /api/admin/users
   * Update a user's role (user ↔ admin)
   * 
   * @param userId - User ID
   * @param role - New role ("user" or "admin")
   * @returns Updated user
   * 
   * @example
   * const user = await adminService.updateUserRole(userId, "admin");
   * const user = await adminService.updateUserRole(userId, "user");
   */
  updateUserRole: async (
    userId: string,
    role: "user" | "admin"
  ): Promise<IAdminUser> => {
    try {
      const { data } = await api.patch<{ user: IAdminUser; message: string }>(
        "/admin/users",
        { userId, role }
      );
      return data.user;
    } catch (error: any) {
      console.error("[adminService] updateUserRole failed:", error.message);
      throw error;
    }
  },
};
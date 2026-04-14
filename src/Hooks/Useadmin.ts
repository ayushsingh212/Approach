"use client";

import { useCallback } from "react";
import { useAdminStore } from "@/src/store/Adminstore";
import { adminService } from "@/src/services/Admin.service";
import {
  AddCompanyPayload,
  UpdateCompanyPayload,
  CompanyFilters,
  UserFilters,
} from "@/src/types/admin.types";

/**
 * useAdmin Hook - Complete admin functionality
 * 
 * ✅ Properly stabilizes all state selections
 * ✅ Proper error handling without rethrowing on silent failures
 * ✅ Re-throws only for explicit user actions
 * ✅ All dependencies are primitives or stable functions
 */
export function useAdmin() {

  // ═════════════════════════════════════════════════════════════════════════
  // SELECT EACH PIECE INDIVIDUALLY — Zustand stabilizes these references
  // ❌ Never do: const store = useAdminStore() then use [store] as a dep
  // ✅ Always do: select each value/action separately
  // ═════════════════════════════════════════════════════════════════════════

  // ── Company state ──────────────────────────────────────────────────────
  const companies          = useAdminStore((s) => s.companies);
  const companyPagination  = useAdminStore((s) => s.companyPagination);
  const companyFilters     = useAdminStore((s) => s.companyFilters);
  const companiesLoading   = useAdminStore((s) => s.companiesLoading);
  const companiesError     = useAdminStore((s) => s.companiesError);

  // ── Company actions ────────────────────────────────────────────────────
  const setCompanies        = useAdminStore((s) => s.setCompanies);
  const setCompaniesLoading = useAdminStore((s) => s.setCompaniesLoading);
  const setCompaniesError   = useAdminStore((s) => s.setCompaniesError);
  const setCompanyFilters   = useAdminStore((s) => s.setCompanyFilters);
  const addCompanyToList    = useAdminStore((s) => s.addCompanyToList);
  const addCompaniesToList   = useAdminStore((s) => s.addCompaniesToList);
  const updateCompanyInList = useAdminStore((s) => s.updateCompanyInList);

  // ── User state ─────────────────────────────────────────────────────────
  const users          = useAdminStore((s) => s.users);
  const userPagination = useAdminStore((s) => s.userPagination);
  const userFilters    = useAdminStore((s) => s.userFilters);
  const usersLoading   = useAdminStore((s) => s.usersLoading);
  const usersError     = useAdminStore((s) => s.usersError);

  // ── User actions ───────────────────────────────────────────────────────
  const setUsers          = useAdminStore((s) => s.setUsers);
  const setUsersLoading   = useAdminStore((s) => s.setUsersLoading);
  const setUsersError     = useAdminStore((s) => s.setUsersError);
  const setUserFilters    = useAdminStore((s) => s.setUserFilters);
  const updateUserInList  = useAdminStore((s) => s.updateUserInList);

  // ═════════════════════════════════════════════════════════════════════════
  // COMPANIES OPERATIONS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * fetchCompanies - Fetch list of companies with pagination
   * ✅ Does NOT re-throw — stores error in state
   * ✅ Component should check companiesError state
   */
  const fetchCompanies = useCallback(
    async (filters?: CompanyFilters) => {
      setCompaniesLoading(true);
      setCompaniesError(null);
      try {
        const result = await adminService.getCompanies(filters ?? companyFilters);
        setCompanies(result.data, result.pagination);
        return result;
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Failed to fetch companies";
        setCompaniesError(msg);
        // ✅ Don't re-throw — error is in state
      } finally {
        setCompaniesLoading(false);
      }
    },
    [companyFilters, setCompanies, setCompaniesLoading, setCompaniesError]
  );

  /**
   * getCompanyById - Fetch single company
   * ✅ Re-throws because caller explicitly awaits
   */
  const getCompanyById = useCallback(
    async (id: string) => {
      try {
        return await adminService.getCompanyById(id);
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Failed to fetch company";
        setCompaniesError(msg);
        throw err;
      }
    },
    [setCompaniesError]
  );

  /**
   * addCompany - Create new company or companies
   * ✅ Re-throws so form can show inline feedback
   */
  const addCompany = useCallback(
    async (payload: AddCompanyPayload | AddCompanyPayload[]) => {
      setCompaniesLoading(true);
      setCompaniesError(null);
      try {
        const result = await adminService.addCompany(payload);
        if (Array.isArray(result)) {
          addCompaniesToList(result);
        } else {
          addCompanyToList(result);
        }
        return result;
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Failed to add company";
        setCompaniesError(msg);
        throw err; // ✅ Re-throw for form
      } finally {
        setCompaniesLoading(false);
      }
    },
    [addCompaniesToList, addCompanyToList, setCompaniesLoading, setCompaniesError]
  );


  /**
   * updateCompany - Update company details
   * ✅ Re-throws for explicit feedback
   */
  const updateCompany = useCallback(
    async (id: string, payload: UpdateCompanyPayload) => {
      setCompaniesError(null);
      try {
        const updated = await adminService.updateCompany(id, payload);
        updateCompanyInList(id, updated);
        return updated;
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Failed to update company";
        setCompaniesError(msg);
        throw err;
      }
    },
    [updateCompanyInList, setCompaniesError]
  );

  /**
   * deleteCompany - Soft-delete company
   * ✅ Re-throws for explicit feedback
   */
  const deleteCompany = useCallback(
    async (id: string) => {
      setCompaniesError(null);
      try {
        const result = await adminService.deleteCompany(id);
        updateCompanyInList(id, { isActive: false });
        return result;
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Failed to delete company";
        setCompaniesError(msg);
        throw err;
      }
    },
    [updateCompanyInList, setCompaniesError]
  );

  /**
   * applyCompanyFilters - Apply filters and refetch
   */
  const applyCompanyFilters = useCallback(
    async (filters: Partial<CompanyFilters>) => {
      setCompanyFilters(filters);
      await fetchCompanies({ ...companyFilters, ...filters });
    },
    [companyFilters, setCompanyFilters, fetchCompanies]
  );

  /**
   * clearCompaniesError - Clear error message
   */
  const clearCompaniesError = useCallback(() => {
    setCompaniesError(null);
  }, [setCompaniesError]);

  // ═════════════════════════════════════════════════════════════════════════
  // USERS OPERATIONS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * fetchUsers - Fetch list of users with pagination
   * ✅ Does NOT re-throw — stores error in state
   */
  const fetchUsers = useCallback(
    async (filters?: UserFilters) => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const result = await adminService.getUsers(filters ?? userFilters);
        setUsers(result.data, result.pagination);
        return result;
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Failed to fetch users";
        setUsersError(msg);
        // ✅ Don't re-throw
      } finally {
        setUsersLoading(false);
      }
    },
    [userFilters, setUsers, setUsersLoading, setUsersError]
  );

  /**
   * updateUserRole - Change user's role
   * ✅ Re-throws for explicit feedback
   */
  const updateUserRole = useCallback(
    async (userId: string, role: "user" | "admin") => {
      setUsersError(null);
      try {
        const updated = await adminService.updateUserRole(userId, role);
        updateUserInList(userId, updated);
        return updated;
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Failed to update user role";
        setUsersError(msg);
        throw err;
      }
    },
    [updateUserInList, setUsersError]
  );

  /**
   * applyUserFilters - Apply filters and refetch
   */
  const applyUserFilters = useCallback(
    async (filters: Partial<UserFilters>) => {
      setUserFilters(filters);
      await fetchUsers({ ...userFilters, ...filters });
    },
    [userFilters, setUserFilters, fetchUsers]
  );

  /**
   * clearUsersError - Clear error message
   */
  const clearUsersError = useCallback(() => {
    setUsersError(null);
  }, [setUsersError]);

  // ═════════════════════════════════════════════════════════════════════════
  // EXPOSED API
  // ═════════════════════════════════════════════════════════════════════════

  return {
    // Company state
    companies,
    companyPagination,
    companyFilters,
    companiesLoading,
    companiesError,

    // Company actions
    fetchCompanies,
    getCompanyById,
    addCompany,
    updateCompany,
    deleteCompany,
    applyCompanyFilters,
    clearCompaniesError,

    // User state
    users,
    userPagination,
    userFilters,
    usersLoading,
    usersError,

    // User actions
    fetchUsers,
    updateUserRole,
    applyUserFilters,
    clearUsersError,
  };
}
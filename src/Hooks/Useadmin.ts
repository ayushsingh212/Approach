"use client";

import { useCallback } from "react";
import { useAdminStore }  from "@/src/store/Adminstore";
import { adminService }   from "@/src/services/Admin.service";
import {
  AddCompanyPayload,
  UpdateCompanyPayload,
  CompanyFilters,
  UserFilters,
} from "@/src/types/admin.types";

// ─── useAdmin ─────────────────────────────────────────────────────────────────
// Exposes admin company management and user management.
// Only usable in components rendered inside an admin-protected route.
//
// Usage:
//   const { companies, fetchCompanies, addCompany, companiesLoading } = useAdmin();

export function useAdmin() {
  const store = useAdminStore();

  // ── Companies ──────────────────────────────────────────────────────────────

  /** Fetch (or re-fetch) the company list. Merges with stored filters if none passed. */
  const fetchCompanies = useCallback(async (filters?: CompanyFilters) => {
    store.setCompaniesLoading(true);
    store.setCompaniesError(null);
    try {
      const result = await adminService.getCompanies(
        filters ?? store.companyFilters
      );
      store.setCompanies(result.data, result.pagination);
      return result;
    } catch (err: any) {
      store.setCompaniesError(err.message);
      throw err;
    } finally {
      store.setCompaniesLoading(false);
    }
  }, [store]);

  /** Add a company and prepend it to the list. */
  const addCompany = useCallback(async (payload: AddCompanyPayload) => {
    store.setCompaniesLoading(true);
    store.setCompaniesError(null);
    try {
      const company = await adminService.addCompany(payload);
      store.addCompanyToList(company);
      return company;
    } catch (err: any) {
      store.setCompaniesError(err.message);
      throw err;
    } finally {
      store.setCompaniesLoading(false);
    }
  }, [store]);

  /** Update a company and reflect changes immediately in the list. */
  const updateCompany = useCallback(async (id: string, payload: UpdateCompanyPayload) => {
    store.setCompaniesError(null);
    try {
      const updated = await adminService.updateCompany(id, payload);
      store.updateCompanyInList(id, updated);
      return updated;
    } catch (err: any) {
      store.setCompaniesError(err.message);
      throw err;
    }
  }, [store]);

  /**
   * Soft-delete a company (sets isActive=false server-side).
   * Optimistically reflects the change in the list.
   */
  const deleteCompany = useCallback(async (id: string) => {
    store.setCompaniesError(null);
    try {
      const result = await adminService.deleteCompany(id);
      store.updateCompanyInList(id, { isActive: false });
      return result;
    } catch (err: any) {
      store.setCompaniesError(err.message);
      throw err;
    }
  }, [store]);

  /** Update local company filters and re-fetch. */
  const applyCompanyFilters = useCallback(async (filters: Partial<CompanyFilters>) => {
    store.setCompanyFilters(filters);
    await fetchCompanies({ ...store.companyFilters, ...filters });
  }, [store, fetchCompanies]);

  const clearCompaniesError = useCallback(() => store.setCompaniesError(null), [store]);

  // ── Users ──────────────────────────────────────────────────────────────────

  /** Fetch the admin user list with optional filters. */
  const fetchUsers = useCallback(async (filters?: UserFilters) => {
    store.setUsersLoading(true);
    store.setUsersError(null);
    try {
      const result = await adminService.getUsers(
        filters ?? store.userFilters
      );
      store.setUsers(result.data, result.pagination);
      return result;
    } catch (err: any) {
      store.setUsersError(err.message);
      throw err;
    } finally {
      store.setUsersLoading(false);
    }
  }, [store]);

  /** Toggle a user's role and reflect it immediately in the list. */
  const updateUserRole = useCallback(async (userId: string, role: "user" | "admin") => {
    store.setUsersError(null);
    try {
      const updated = await adminService.updateUserRole(userId, role);
      store.updateUserInList(userId, updated);
      return updated;
    } catch (err: any) {
      store.setUsersError(err.message);
      throw err;
    }
  }, [store]);

  /** Update local user filters and re-fetch. */
  const applyUserFilters = useCallback(async (filters: Partial<UserFilters>) => {
    store.setUserFilters(filters);
    await fetchUsers({ ...store.userFilters, ...filters });
  }, [store, fetchUsers]);

  const clearUsersError = useCallback(() => store.setUsersError(null), [store]);

  return {
    // ── Company state ────────────────────────────────────────────────────────
    companies:         store.companies,
    companyPagination: store.companyPagination,
    companyFilters:    store.companyFilters,
    companiesLoading:  store.companiesLoading,
    companiesError:    store.companiesError,

    // ── Company actions ──────────────────────────────────────────────────────
    fetchCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    applyCompanyFilters,
    clearCompaniesError,

    // ── User state ───────────────────────────────────────────────────────────
    users:          store.users,
    userPagination: store.userPagination,
    userFilters:    store.userFilters,
    usersLoading:   store.usersLoading,
    usersError:     store.usersError,

    // ── User actions ─────────────────────────────────────────────────────────
    fetchUsers,
    updateUserRole,
    applyUserFilters,
    clearUsersError,
  };
}
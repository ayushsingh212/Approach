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

export function useAdmin() {
  const store = useAdminStore();

  // ── Fetch Companies ────────────────────────────────────────────────────────
  const fetchCompanies = useCallback(async (filters?: CompanyFilters) => {
    store.setCompaniesLoading(true);
    store.setCompaniesError(null);
    try {
      console.log("📥 Fetching companies with filters:", filters);
      const result = await adminService.getCompanies(
        filters ?? store.companyFilters
      );
      console.log("✅ Companies fetched:", result.data.length);
      store.setCompanies(result.data, result.pagination);
      return result;
    } catch (err: any) {
      console.error("❌ Failed to fetch companies:", err);
      const errorMessage = err?.response?.data?.error || err.message || "Failed to fetch companies";
      store.setCompaniesError(errorMessage);
      throw err;
    } finally {
      store.setCompaniesLoading(false);
    }
  }, [store]);

  // ── Add Company ────────────────────────────────────────────────────────────
  const addCompany = useCallback(async (payload: AddCompanyPayload) => {
    store.setCompaniesLoading(true);
    store.setCompaniesError(null);
    try {
      console.log("➕ Adding company:", payload);
      const company = await adminService.addCompany(payload);
      console.log("✅ Company added:", company);
      store.addCompanyToList(company);
      return company;
    } catch (err: any) {
      console.error("❌ Failed to add company:", err);
      const errorMessage = err?.response?.data?.error || err.message || "Failed to add company";
      store.setCompaniesError(errorMessage);
      throw err;
    } finally {
      store.setCompaniesLoading(false);
    }
  }, [store]);

  // ── Update Company ─────────────────────────────────────────────────────────
  const updateCompany = useCallback(
    async (id: string, payload: UpdateCompanyPayload) => {
      store.setCompaniesError(null);
      try {
        console.log("✏️ Updating company:", id, payload);
        const updated = await adminService.updateCompany(id, payload);
        console.log("✅ Company updated:", updated);
        store.updateCompanyInList(id, updated);
        return updated;
      } catch (err: any) {
        console.error("❌ Failed to update company:", err);
        const errorMessage = err?.response?.data?.error || err.message || "Failed to update company";
        store.setCompaniesError(errorMessage);
        throw err;
      }
    },
    [store]
  );

  // ── Delete Company ─────────────────────────────────────────────────────────
  const deleteCompany = useCallback(async (id: string) => {
    store.setCompaniesError(null);
    try {
      console.log("🗑️ Deleting company:", id);
      const result = await adminService.deleteCompany(id);
      console.log("✅ Company deleted (soft-delete):", result);
      // Update the company in list to show isActive = false
      store.updateCompanyInList(id, { isActive: false });
      return result;
    } catch (err: any) {
      console.error("❌ Failed to delete company:", err);
      const errorMessage = err?.response?.data?.error || err.message || "Failed to delete company";
      store.setCompaniesError(errorMessage);
      throw err;
    }
  }, [store]);

  // ── Apply Filters ──────────────────────────────────────────────────────────
  const applyCompanyFilters = useCallback(
    async (filters: Partial<CompanyFilters>) => {
      console.log("🔍 Applying filters:", filters);
      store.setCompanyFilters(filters);
      await fetchCompanies({ ...store.companyFilters, ...filters });
    },
    [store, fetchCompanies]
  );

  // ── Clear Error ────────────────────────────────────────────────────────────
  const clearCompaniesError = useCallback(() => {
    store.setCompaniesError(null);
  }, [store]);

  // ── Fetch Users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (filters?: UserFilters) => {
    store.setUsersLoading(true);
    store.setUsersError(null);
    try {
      console.log("📥 Fetching users with filters:", filters);
      const result = await adminService.getUsers(
        filters ?? store.userFilters
      );
      console.log("✅ Users fetched:", result.data.length);
      store.setUsers(result.data, result.pagination);
      return result;
    } catch (err: any) {
      console.error("❌ Failed to fetch users:", err);
      const errorMessage = err?.response?.data?.error || err.message || "Failed to fetch users";
      store.setUsersError(errorMessage);
      throw err;
    } finally {
      store.setUsersLoading(false);
    }
  }, [store]);

  // ── Update User Role ───────────────────────────────────────────────────────
  const updateUserRole = useCallback(
    async (userId: string, role: "user" | "admin") => {
      store.setUsersError(null);
      try {
        console.log("👤 Updating user role:", userId, role);
        const updated = await adminService.updateUserRole(userId, role);
        console.log("✅ User role updated:", updated);
        store.updateUserInList(userId, updated);
        return updated;
      } catch (err: any) {
        console.error("❌ Failed to update user role:", err);
        const errorMessage = err?.response?.data?.error || err.message || "Failed to update user role";
        store.setUsersError(errorMessage);
        throw err;
      }
    },
    [store]
  );

  // ── Apply User Filters ─────────────────────────────────────────────────────
  const applyUserFilters = useCallback(
    async (filters: Partial<UserFilters>) => {
      console.log("🔍 Applying user filters:", filters);
      store.setUserFilters(filters);
      await fetchUsers({ ...store.userFilters, ...filters });
    },
    [store, fetchUsers]
  );

  // ── Clear User Error ───────────────────────────────────────────────────────
  const clearUsersError = useCallback(() => {
    store.setUsersError(null);
  }, [store]);

  return {
    // ── Company state ──────────────────────────────────────────────────────
    companies: store.companies,
    companyPagination: store.companyPagination,
    companyFilters: store.companyFilters,
    companiesLoading: store.companiesLoading,
    companiesError: store.companiesError,

    // ── Company actions ────────────────────────────────────────────────────
    fetchCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    applyCompanyFilters,
    clearCompaniesError,

    // ── User state ─────────────────────────────────────────────────────────
    users: store.users,
    userPagination: store.userPagination,
    userFilters: store.userFilters,
    usersLoading: store.usersLoading,
    usersError: store.usersError,

    // ── User actions ───────────────────────────────────────────────────────
    fetchUsers,
    updateUserRole,
    applyUserFilters,
    clearUsersError,
  };
}
import { create } from "zustand";
import {
  ICompany,
  IAdminUser,
  Pagination,
  CompanyFilters,
  UserFilters,
} from "@/src/types/admin.types";

// ─── Admin Store ──────────────────────────────────────────────────────────────

interface AdminState {
  // ── Companies ──────────────────────────────────────────────────────────────
  companies:        ICompany[];
  companyPagination: Pagination | null;
  companyFilters:   CompanyFilters;
  companiesLoading: boolean;
  companiesError:   string | null;

  // ── Users ──────────────────────────────────────────────────────────────────
  users:          IAdminUser[];
  userPagination: Pagination | null;
  userFilters:    UserFilters;
  usersLoading:   boolean;
  usersError:     string | null;

  // ── Company Actions ────────────────────────────────────────────────────────
  setCompanies:          (companies: ICompany[], pagination: Pagination) => void;
  setCompanyFilters:     (filters: Partial<CompanyFilters>) => void;
  setCompaniesLoading:   (loading: boolean) => void;
  setCompaniesError:     (error: string | null) => void;
  addCompanyToList:      (company: ICompany) => void;
  updateCompanyInList:   (id: string, updated: Partial<ICompany>) => void;
  removeCompanyFromList: (id: string) => void;

  // ── User Actions ───────────────────────────────────────────────────────────
  setUsers:          (users: IAdminUser[], pagination: Pagination) => void;
  setUserFilters:    (filters: Partial<UserFilters>) => void;
  setUsersLoading:   (loading: boolean) => void;
  setUsersError:     (error: string | null) => void;
  updateUserInList:  (id: string, updated: Partial<IAdminUser>) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // ── Companies initial state ────────────────────────────────────────────────
  companies:         [],
  companyPagination: null,
  companyFilters:    { page: 1, limit: 20 },
  companiesLoading:  false,
  companiesError:    null,

  // ── Users initial state ────────────────────────────────────────────────────
  users:          [],
  userPagination: null,
  userFilters:    { page: 1, limit: 20 },
  usersLoading:   false,
  usersError:     null,

  // ── Company actions ────────────────────────────────────────────────────────
  setCompanies: (companies, pagination) =>
    set({ companies, companyPagination: pagination }),

  setCompanyFilters: (filters) =>
    set((state) => ({
      companyFilters: { ...state.companyFilters, ...filters },
    })),

  setCompaniesLoading: (companiesLoading) => set({ companiesLoading }),
  setCompaniesError:   (companiesError)   => set({ companiesError }),

  addCompanyToList: (company) =>
    set((state) => ({ companies: [company, ...state.companies] })),

  updateCompanyInList: (id, updated) =>
    set((state) => ({
      companies: state.companies.map((c) =>
        c._id === id ? { ...c, ...updated } : c
      ),
    })),

  removeCompanyFromList: (id) =>
    set((state) => ({
      companies: state.companies.filter((c) => c._id !== id),
    })),

  // ── User actions ───────────────────────────────────────────────────────────
  setUsers: (users, pagination) =>
    set({ users, userPagination: pagination }),

  setUserFilters: (filters) =>
    set((state) => ({
      userFilters: { ...state.userFilters, ...filters },
    })),

  setUsersLoading: (usersLoading) => set({ usersLoading }),
  setUsersError:   (usersError)   => set({ usersError }),

  updateUserInList: (id, updated) =>
    set((state) => ({
      users: state.users.map((u) =>
        u._id === id ? { ...u, ...updated } : u
      ),
    })),
}));
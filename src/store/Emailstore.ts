import { create } from "zustand";
import { IEmailLog, SendEmailResponse, EmailLogFilters } from "@/src/types/email.types";
import { ICompany, Pagination } from "@/src/types/admin.types";

// ─── Email Store ──────────────────────────────────────────────────────────────

interface EmailState {
  // ── Company search results (used in company selector) ─────────────────────
  companySearchResults:     ICompany[];
  companySearchPagination:  Pagination | null;
  companySearchLoading:     boolean;

  // ── Selected companies for sending ────────────────────────────────────────
  selectedCompanies: ICompany[];

  // ── Email composition ─────────────────────────────────────────────────────
  subject:   string;
  emailBody: string;

  // ── Send state ────────────────────────────────────────────────────────────
  isSending:  boolean;
  sendResult: SendEmailResponse | null;
  sendError:  string | null;

  // ── Email logs ────────────────────────────────────────────────────────────
  emailLogs:       IEmailLog[];
  logsPagination:  Pagination | null;
  logsFilters:     EmailLogFilters;
  logsLoading:     boolean;
  logsError:       string | null;

  // ── Company search actions ─────────────────────────────────────────────────
  setCompanySearchResults:  (results: ICompany[], pagination: Pagination) => void;
  setCompanySearchLoading:  (loading: boolean) => void;

  // ── Selection actions ─────────────────────────────────────────────────────
  setSelectedCompanies:   (companies: ICompany[]) => void;
  addSelectedCompany:     (company: ICompany) => void;
  removeSelectedCompany:  (id: string) => void;
  clearSelectedCompanies: () => void;

  // ── Composition actions ───────────────────────────────────────────────────
  setSubject:   (subject: string)   => void;
  setEmailBody: (body: string)      => void;
  clearCompose: ()                  => void;

  // ── Send actions ──────────────────────────────────────────────────────────
  setIsSending:   (sending: boolean)              => void;
  setSendResult:  (result: SendEmailResponse | null) => void;
  setSendError:   (error: string | null)          => void;
  clearSendState: ()                              => void;

  // ── Log actions ───────────────────────────────────────────────────────────
  setEmailLogs:    (logs: IEmailLog[], pagination: Pagination) => void;
  setLogsFilters:  (filters: Partial<EmailLogFilters>) => void;
  setLogsLoading:  (loading: boolean) => void;
  setLogsError:    (error: string | null) => void;
}

export const useEmailStore = create<EmailState>((set) => ({
  // ── Initial state ─────────────────────────────────────────────────────────
  companySearchResults:    [],
  companySearchPagination: null,
  companySearchLoading:    false,

  selectedCompanies: [],

  subject:   "",
  emailBody: "",

  isSending:  false,
  sendResult: null,
  sendError:  null,

  emailLogs:      [],
  logsPagination: null,
  logsFilters:    { page: 1, limit: 10 },
  logsLoading:    false,
  logsError:      null,

  // ── Implementations ───────────────────────────────────────────────────────
  setCompanySearchResults: (results, pagination) =>
    set({ companySearchResults: results, companySearchPagination: pagination }),

  setCompanySearchLoading: (companySearchLoading) =>
    set({ companySearchLoading }),

  setSelectedCompanies: (selectedCompanies) => set({ selectedCompanies }),

  addSelectedCompany: (company) =>
    set((state) => ({
      selectedCompanies: state.selectedCompanies.some((c) => c._id === company._id)
        ? state.selectedCompanies
        : [...state.selectedCompanies, company],
    })),

  removeSelectedCompany: (id) =>
    set((state) => ({
      selectedCompanies: state.selectedCompanies.filter((c) => c._id !== id),
    })),

  clearSelectedCompanies: () => set({ selectedCompanies: [] }),

  setSubject:   (subject)   => set({ subject }),
  setEmailBody: (emailBody) => set({ emailBody }),
  clearCompose: ()          => set({ subject: "", emailBody: "", selectedCompanies: [] }),

  setIsSending:   (isSending)   => set({ isSending }),
  setSendResult:  (sendResult)  => set({ sendResult }),
  setSendError:   (sendError)   => set({ sendError }),
  clearSendState: ()            => set({ isSending: false, sendResult: null, sendError: null }),

  setEmailLogs: (emailLogs, pagination) =>
    set({ emailLogs, logsPagination: pagination }),

  setLogsFilters: (filters) =>
    set((state) => ({
      logsFilters: { ...state.logsFilters, ...filters },
    })),

  setLogsLoading: (logsLoading) => set({ logsLoading }),
  setLogsError:   (logsError)   => set({ logsError }),
}));
"use client";

import { useCallback } from "react";
import { useEmailStore } from "@/src/store/Emailstore";
import { emailService }  from "@/src/services/Email.service";
import { userService }   from "@/src/services/User.service";
import { ICompany }      from "@/src/types/admin.types";
import {
  SendEmailPayload,
  EmailLogFilters,
  CompanySearchFilters,
} from "@/src/types/email.types";

// ─── useEmails ────────────────────────────────────────────────────────────────
// Manages the full email-send flow:
//   1. Search companies  →  searchCompanies()
//   2. Select targets    →  addSelectedCompany() / removeSelectedCompany()
//   3. Compose message   →  setSubject() / setEmailBody()
//   4. Send              →  sendEmail()
//   5. View history      →  fetchEmailLogs()
//
// Usage:
//   const {
//     companySearchResults, searchCompanies,
//     selectedCompanies, addSelectedCompany,
//     sendEmail, isSending, sendResult,
//     emailLogs, fetchEmailLogs,
//   } = useEmails();

export function useEmails() {
  const store = useEmailStore();

  // ── Company search ────────────────────────────────────────────────────────

  const searchCompanies = useCallback(async (filters?: CompanySearchFilters) => {
    store.setCompanySearchLoading(true);
    try {
      const result = await emailService.searchCompanies(filters);
      store.setCompanySearchResults(result.data, result.pagination);
      return result;
    } catch {
      // Keep previous results on error — UI shows empty state naturally
      store.setCompanySearchResults([], {
        page: 1, limit: 20, total: 0, totalPages: 0,
      });
    } finally {
      store.setCompanySearchLoading(false);
    }
  }, [store]);

  // ── Send email ────────────────────────────────────────────────────────────

  /**
   * Send emails to the provided company IDs.
   * Clears selected companies on success.
   * Throws on error so the caller can show a toast/alert.
   */
  const sendEmail = useCallback(async (payload: SendEmailPayload) => {
    store.setIsSending(true);
    store.setSendError(null);
    store.setSendResult(null);
    try {
      const result = await emailService.sendEmail(payload);
      store.setSendResult(result);
      store.clearSelectedCompanies();
      return result;
    } catch (err: any) {
      store.setSendError(err.message);
      throw err;
    } finally {
      store.setIsSending(false);
    }
  }, [store]);

  /** Convenience: send to currently selected companies using stored subject/body. */
  const sendToSelected = useCallback(async () => {
    const payload: SendEmailPayload = {
      companyIds: store.selectedCompanies.map((c) => c._id),
      subject:    store.subject,
      emailBody:  store.emailBody,
    };
    return sendEmail(payload);
  }, [store, sendEmail]);

  // ── Email logs ────────────────────────────────────────────────────────────

  const fetchEmailLogs = useCallback(async (filters?: EmailLogFilters) => {
    store.setLogsLoading(true);
    store.setLogsError(null);
    try {
      const result = await userService.getSentEmails(
        filters ?? store.logsFilters
      );
      store.setEmailLogs(result.data, result.pagination);
      return result;
    } catch (err: any) {
      store.setLogsError(err.message);
      throw err;
    } finally {
      store.setLogsLoading(false);
    }
  }, [store]);

  /** Update log filters and immediately re-fetch. */
  const applyLogsFilters = useCallback(async (filters: Partial<EmailLogFilters>) => {
    store.setLogsFilters(filters);
    await fetchEmailLogs({ ...store.logsFilters, ...filters });
  }, [store, fetchEmailLogs]);

  return {
    // ── Company search ────────────────────────────────────────────────────
    companySearchResults:    store.companySearchResults,
    companySearchPagination: store.companySearchPagination,
    companySearchLoading:    store.companySearchLoading,
    searchCompanies,

    // ── Selection ─────────────────────────────────────────────────────────
    selectedCompanies:     store.selectedCompanies,
    addSelectedCompany:    store.addSelectedCompany,
    removeSelectedCompany: store.removeSelectedCompany,
    clearSelectedCompanies: store.clearSelectedCompanies,

    // ── Composition ───────────────────────────────────────────────────────
    subject:      store.subject,
    emailBody:    store.emailBody,
    setSubject:   store.setSubject,
    setEmailBody: store.setEmailBody,
    clearCompose: store.clearCompose,

    // ── Send ──────────────────────────────────────────────────────────────
    isSending:      store.isSending,
    sendResult:     store.sendResult,
    sendError:      store.sendError,
    sendEmail,
    sendToSelected,
    clearSendState: store.clearSendState,

    // ── Logs ──────────────────────────────────────────────────────────────
    emailLogs:      store.emailLogs,
    logsPagination: store.logsPagination,
    logsFilters:    store.logsFilters,
    logsLoading:    store.logsLoading,
    logsError:      store.logsError,
    fetchEmailLogs,
    applyLogsFilters,
  };
}
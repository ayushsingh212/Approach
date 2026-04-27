import useSWR from "swr";
import { useCallback } from "react";
import api from "@/src/lib/axios";

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetcher = (url: string): Promise<string[]> =>
  api.get<{ companyIds: string[] }>(url).then((r) => r.data.companyIds);

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useSentEmails
 *
 * Bulk-fetches (once on mount) all company IDs the current user has emailed.
 * Also exposes `markAsSent(companyId)` which:
 *  1. Optimistically mutates the local SWR cache (badge appears instantly)
 *  2. Persists the record to the DB via POST /api/sent-emails (fire-and-forget)
 */
export function useSentEmails() {
  const { data, mutate, isLoading } = useSWR<string[]>(
    "/sent-emails",
    fetcher,
    {
      revalidateOnFocus: false,   // no need to re-fetch on tab focus
      revalidateOnReconnect: false,
      dedupingInterval: 60_000,   // 1 min — data changes only after sending
    },
  );

  /**
   * Optimistically add a companyId to the local cache, then persist.
   * Calling this for an already-sent company is a no-op (Set dedup).
   */
  const markAsSent = useCallback(
    async (companyId: string) => {
      // 1. Optimistic update — rerender immediately
      mutate(
        (prev = []) =>
          prev.includes(companyId) ? prev : [...prev, companyId],
        false, // do NOT revalidate from server after the optimistic update
      );

      // 2. Persist to DB (best-effort — we don't block the UI on this)
      try {
        await api.post("/sent-emails", { companyId });
      } catch (err) {
        console.error("Failed to persist sent-email record:", err);
        // Silently ignore — the badge still shows; next page load will reflect DB truth
      }
    },
    [mutate],
  );

  // O(1) membership test — convert array → Set once
  const sentSet = new Set<string>(data ?? []);

  return { sentSet, markAsSent, isLoading };
}

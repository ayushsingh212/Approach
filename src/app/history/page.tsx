"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmailStore } from "@/src/store/Emailstore";
import { userService } from "@/src/services/User.service";
import { StatusType } from "@/src/types/email.types";

export default function HistoryPage() {
  const router = useRouter();
  const store = useEmailStore();

  const { emailLogs, logsLoading, logsFilters } = store;

  useEffect(() => {
    const fetchLogs = async () => {
      store.setLogsLoading(true);
      try {
        const res = await userService.getSentEmails(logsFilters);
        store.setEmailLogs(res.data, res.pagination);
      } finally {
        store.setLogsLoading(false);
      }
    };

    fetchLogs();
  }, [logsFilters]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Email History</h1>

      {/* FILTER */}
      <select
        onChange={(e) =>
          store.setLogsFilters({
            status: e.target.value as StatusType
          })
        }
        className="mb-6 px-4 py-2 border rounded-lg"
      >
        <option value="">All</option>
        <option value="completed">Completed</option>
        <option value="partial">Partial</option>
        <option value="all_failed">Failed</option>
      </select>

      {/* LIST */}
      {logsLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {emailLogs.map((log) => (
            <div
              key={log._id}
              onClick={() => router.push(`/history/${log._id}`)}
              className="p-5 bg-white rounded-xl shadow hover:shadow-md cursor-pointer transition"
            >
              <div className="font-semibold text-lg">{log.subject}</div>

              <div className="text-sm text-gray-500 mt-1">
                {log.totalSent} sent • {log.totalFailed} failed
              </div>

              <div className="text-xs mt-2">
                Status: <span className="font-medium">{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmailStore } from "@/src/store/Emailstore";
import { userService } from "@/src/services/User.service";
import { StatusType } from "@/src/types/email.types";
import { Mail, CheckCircle, XCircle, AlertCircle, ChevronRight, Filter } from "lucide-react";

const statusConfig = {
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: CheckCircle },
  partial: { label: "Partial", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertCircle },
  all_failed: { label: "Failed", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsFilters]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Email History</h1>
            <p className="text-slate-500 text-sm mt-0.5">Track all your sent campaigns</p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 hidden sm:block" />
            <select
              value={logsFilters?.status ?? ""}
              onChange={(e) => store.setLogsFilters({ status: e.target.value as StatusType })}
              className="text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white
                focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="partial">Partial</option>
              <option value="all_failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {logsLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          </div>
        ) : emailLogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Mail size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No emails sent yet</p>
            <p className="text-slate-400 text-sm mt-1">Your campaign history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emailLogs.map((log) => {
              const cfg = statusConfig[log.status as keyof typeof statusConfig] ?? statusConfig.partial;
              const Icon = cfg.icon;
              return (
                <div
                  key={log._id}
                  onClick={() => router.push(`/history/${log._id}`)}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200
                    hover:border-amber-300 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-xl border flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={16} className={cfg.color} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                          {log.subject}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-xs text-slate-400">{formatDate(log.sentAt)}</span>
                          <span className="text-xs text-green-600 font-medium">{log.totalSent} sent</span>
                          {log.totalFailed > 0 && (
                            <span className="text-xs text-red-500 font-medium">{log.totalFailed} failed</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 flex-shrink-0 mt-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
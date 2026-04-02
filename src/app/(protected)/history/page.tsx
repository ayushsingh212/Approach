"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmailStore } from "@/src/store/Emailstore";
import { userService } from "@/src/services/User.service";
import { StatusType } from "@/src/types/email.types";
import { Mail, CheckCircle, XCircle, AlertCircle, ChevronRight, Paperclip, SlidersHorizontal } from "lucide-react";

const statusConfig = {
  completed: {
    label: "Completed",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle,
  },
  partial: {
    label: "Partial",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: AlertCircle,
  },
  all_failed: {
    label: "Failed",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: XCircle,
  },
};

export default function HistoryPage() {
  const router = useRouter();
  const store = useEmailStore();
  const { emailLogs, logsLoading, logsFilters } = store;

  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => { e.preventDefault(); };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      store.setLogsLoading(true);
      try {
        const res = await userService.getSentEmails(logsFilters);
        store.setEmailLogs(res.data, res.pagination);
      } catch (err: any) {
        console.error("Failed to fetch email logs:", err.message);
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Email History</h1>
            <p className="text-slate-400 text-xs mt-0.5">Track all your sent campaigns</p>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              value={logsFilters?.status ?? ""}
              onChange={(e) => store.setLogsFilters({ status: e.target.value as StatusType })}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white
                text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="partial">Partial</option>
              <option value="all_failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {logsLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-200 border-t-amber-500" />
            <p className="text-xs text-slate-400">Loading campaigns...</p>
          </div>
        ) : emailLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 mx-0">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Mail size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold text-sm">No emails sent yet</p>
            <p className="text-slate-400 text-xs mt-1">Your campaign history will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {emailLogs.map((log) => {
              const cfg = statusConfig[log.status as keyof typeof statusConfig] ?? statusConfig.partial;
              const Icon = cfg.icon;
              const hasAttachments = log.attachmentUrls && log.attachmentUrls.length > 0;

              return (
                <div
                  key={log._id}
                  onClick={() => router.push(`/history/${log._id}`)}
                  className="bg-white rounded-xl border border-slate-200 hover:border-amber-300
                    hover:shadow-sm cursor-pointer transition-all duration-150 group overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* Status stripe */}
                    <div className={`w-1 flex-shrink-0 ${cfg.dot}`} />

                    {/* Main content */}
                    <div className="flex items-center justify-between flex-1 px-4 py-3.5 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                          <Icon size={14} className={cfg.color} />
                        </div>

                        {/* Text */}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate leading-tight">
                            {log.subject}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1">
                            <span className="text-xs text-slate-400">{formatDate(log.sentAt)}</span>
                            <span className="text-slate-300 text-xs">·</span>
                            <span className="text-xs text-emerald-600 font-medium">{log.totalSent} sent</span>
                            {log.totalFailed > 0 && (
                              <>
                                <span className="text-slate-300 text-xs">·</span>
                                <span className="text-xs text-red-500 font-medium">{log.totalFailed} failed</span>
                              </>
                            )}
                            {hasAttachments && (
                              <>
                                <span className="text-slate-300 text-xs">·</span>
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <Paperclip size={10} />
                                  {log.attachmentUrls.length}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`hidden sm:inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        <ChevronRight size={15} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                      </div>
                    </div>
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
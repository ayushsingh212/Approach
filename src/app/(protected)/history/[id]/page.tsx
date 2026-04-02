"use client";
import type { IAttachmentUrl } from "@/src/types/email.types";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userService } from "@/src/services/User.service";
import {
  ArrowLeft, CheckCircle, XCircle, Users, Mail,
  Paperclip, Download, Calendar, Send
} from "lucide-react";

export default function EmailDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => { e.preventDefault(); };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const res = await userService.getSentEmailById(id as string);
        setLog(res);
      } catch (err: any) {
        console.error("Failed to fetch log:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-200 border-t-amber-500" />
        <p className="text-xs text-slate-400">Loading campaign details...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <p className="text-slate-500 font-medium text-sm">Email log not found.</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-amber-600 hover:underline font-medium"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const hasAttachments = log.attachmentUrls && log.attachmentUrls.length > 0;
  const statusColor = log.status === "completed"
    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : log.status === "partial"
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-600 bg-red-50 border-red-200";

  const statusLabel = log.status === "completed" ? "Completed"
    : log.status === "partial" ? "Partial" : "Failed";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600
            transition-colors font-medium"
        >
          <ArrowLeft size={14} />
          Back to History
        </button>
      </div>

      {/* Subject hero */}
      <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1.5">Subject</p>
            <h1 className="text-lg font-bold text-slate-900 leading-snug break-words">
              {log.subject}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <Calendar size={11} />
              <span>{formatDate(log.sentAt)}</span>
              <span className="text-slate-200">·</span>
              <span>From: {log.senderEmail}</span>
            </div>
          </div>
          <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Targeted", value: log.totalTargeted ?? (log.totalSent + log.totalFailed), color: "text-slate-800", border: "border-slate-200", bg: "bg-white" },
            { label: "Sent",     value: log.totalSent,    color: "text-emerald-600", border: "border-emerald-100", bg: "bg-emerald-50" },
            { label: "Failed",   value: log.totalFailed,  color: "text-red-500",     border: "border-red-100",     bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl border ${s.border} py-3 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Attachments */}
        {hasAttachments && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <Paperclip size={13} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">
                Attachments
              </span>
              <span className="ml-auto text-xs text-slate-400 font-medium">
                {log.attachmentUrls.length} file{log.attachmentUrls.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {log.attachmentUrls.map((att: IAttachmentUrl, idx: number) => (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between px-4 py-3
                    hover:bg-amber-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Paperclip size={13} className="text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{att.filename}</p>
                      <p className="text-xs text-slate-400">PDF · Expires in 7 days</p>
                    </div>
                  </div>
                  <Download size={14} className="text-slate-400 group-hover:text-amber-600
                    flex-shrink-0 ml-3 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Email body */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
            <Mail size={13} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Email Content</span>
          </div>
          <div className="px-4 py-4">
            <div
              className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: log.body }}
            />
          </div>
        </div>

        {/* Recipients */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
            <Users size={13} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Recipients</span>
            <span className="ml-auto text-xs text-slate-400 font-medium">
              {log.deliveryResults?.length ?? 0} total
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {log.deliveryResults?.map((r: any) => (
              <div
                key={r.companyEmail}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    r.status === "sent" ? "bg-emerald-500" : "bg-red-500"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{r.companyName}</p>
                    <p className="text-xs text-slate-400 truncate">{r.companyEmail}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold flex-shrink-0 ml-3 ${
                  r.status === "sent" ? "text-emerald-600" : "text-red-500"
                }`}>
                  {r.status === "sent"
                    ? <><CheckCircle size={12} /> Sent</>
                    : <><XCircle size={12} /> Failed</>}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
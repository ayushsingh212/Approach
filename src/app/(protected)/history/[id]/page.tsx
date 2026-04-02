"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userService } from "@/src/services/User.service";
import { ArrowLeft, CheckCircle, XCircle, Users, Mail } from "lucide-react";

export default function EmailDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await userService.getSentEmails();
        const found = res.data.find((l: any) => l._id === id);
        setLog(found);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Email log not found.</p>
        <button onClick={() => router.back()} className="mt-3 text-sm text-amber-600 hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  const totalTargeted = log.totalSent + log.totalFailed;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-amber-600
            mb-6 transition font-medium"
        >
          <ArrowLeft size={16} />
          Back to History
        </button>

        {/* Subject */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 leading-tight">
          {log.subject}
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{totalTargeted}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <Users size={11} /> Targeted
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-green-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{log.totalSent}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <CheckCircle size={11} /> Sent
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-red-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{log.totalFailed}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <XCircle size={11} /> Failed
            </p>
          </div>
        </div>

        {/* Email body preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={15} className="text-slate-400" />
            <h2 className="font-semibold text-slate-700 text-sm">Email Content</h2>
          </div>
          <div
            className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: log.body }}
          />
        </div>

        {/* Recipients */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-slate-400" />
            <h2 className="font-semibold text-slate-700 text-sm">Recipients</h2>
          </div>
          <div className="space-y-2">
            {log.deliveryResults.map((r: any) => (
              <div
                key={r.companyEmail}
                className="flex items-center justify-between py-2.5 px-3
                  rounded-xl bg-slate-50 border border-slate-100 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-700 truncate">{r.companyName}</p>
                  <p className="text-xs text-slate-400 truncate">{r.companyEmail}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold flex-shrink-0 ml-3 ${
                  r.status === "sent" ? "text-green-600" : "text-red-500"
                }`}>
                  {r.status === "sent"
                    ? <><CheckCircle size={13} /> Sent</>
                    : <><XCircle size={13} /> Failed</>
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
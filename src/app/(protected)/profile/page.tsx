"use client";

import { useAuth } from "@/src/Hooks/Useauth";
import { useEffect, useState } from "react";
import { User, Mail, Key, CheckCircle, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading, error, fetchProfile, updateCredentials } = useAuth();

  const [senderEmail, setSenderEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile().catch((err) => console.error("Profile fetch failed:", err.message));
  }, [fetchProfile]);

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateSuccess(false);
    setUpdateError(null);
    try {
      await updateCredentials({ senderEmail, googleAppPassword: appPassword });
      setSenderEmail("");
      setAppPassword("");
      setUpdateSuccess(true);
      await fetchProfile();
      setTimeout(() => setUpdateSuccess(false), 4000);
    } catch (err: any) {
      setUpdateError(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dash-Board</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account and email credentials</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600
              flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900 text-lg truncate">{user?.name || "—"}</h2>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5
                ${user?.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-slate-100 text-slate-600"}`}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <User size={15} className="text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Name</p>
                <p className="font-medium text-slate-700 truncate">{user?.name || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail size={15} className="text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Login Email</p>
                <p className="font-medium text-slate-700 truncate">{user?.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail size={15} className="text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Sender Gmail</p>
                <p className="font-medium text-slate-700 truncate">{user?.senderEmail || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail size={15} className="text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Emails Sent</p>
                <p className="font-medium text-slate-700">{user?.emailsSentCount ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Update credentials card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Key size={18} className="text-amber-500" />
            <h2 className="font-semibold text-slate-900">Update Sender Credentials</h2>
          </div>

          {updateSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl
              flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle size={16} />
              Credentials updated successfully!
            </div>
          )}

          {updateError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl
              flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              {updateError}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Sender Gmail Address
              </label>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Google App Password
              </label>
              <input
                type="password"
                placeholder="16-character app password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">
                Generate at myaccount.google.com → Security → App passwords
              </p>
            </div>

            <button
              onClick={handleUpdate}
              disabled={updating || !senderEmail || !appPassword}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white
                rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/30
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Verifying & Updating..." : "Update Credentials"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/src/Hooks/Useauth";

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    const toastId = toast.loading("Authenticating…");

    try {
      await login(email.trim(), password);
      toast.success("Welcome back! Redirecting…", { id: toastId });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Login failed.", { id: toastId });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Email */}
      <div>
        <label className="text-sm flex items-center gap-2 text-slate-600 mb-2">
          <Mail size={14} /> Corporate Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-400"
          placeholder="executive@company.com"
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-sm flex justify-between items-center text-slate-600 mb-2">
          <span className="flex items-center gap-2">
            <Lock size={14} /> Security Key
          </span>
          <span className="text-xs text-amber-600 cursor-pointer">Forgot?</span>
        </label>

        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 pr-12"
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Remember */}
      <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          checked={remember}
          onChange={() => setRemember(!remember)}
        />
        Remember this workstation
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Authenticating…
          </>
        ) : (
          <>
            Initialize Session
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, ChevronRight, Loader2,
  Mail, Lock, User, KeyRound
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/src/Hooks/Useauth";
import { RegisterPayload } from "@/src/types/user.types";
import { stripEmojis } from "@/src/utils/sanitization";

export default function RegisterForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const router = useRouter();
  const { register, login, isLoading } = useAuth();

  const [showPass, setShowPass] = useState(false);
  const [showAppPass, setShowAppPass] = useState(false);

  const [form, setForm] = useState<RegisterPayload & { confirmPassword: string }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === "name") val = stripEmojis(val);
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error("All fields are required.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const toastId = toast.loading("Creating your account…");

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      toast.loading("Signing you in…", { id: toastId });
      await login(form.email.trim(), form.password);

      toast.success("Welcome aboard! Redirecting…", { id: toastId });
      router.push("/profile");
    } catch (err: any) {
      toast.error(err.message ?? "Registration failed.", { id: toastId });
    }
  };

  const inputClass =
  "w-full px-4 py-3 text-black lg:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm disabled:opacity-60 [&:-webkit-autofill]:bg-slate-50 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(248,250,252)]";
  
  const labelClass =
    "text-xs lg:text-sm text-black font-medium text-slate-700 flex items-center gap-2";
    
  return (
    <form className="flex flex-col gap-4 lg:gap-5" onSubmit={handleSubmit}>

      {/* Name */}
      <div className="space-y-2">
        <label className={labelClass}>
          <User size={14} className="text-slate-400" />
          Full Name
        </label>
        <input
          type="text"
          maxLength={50}
          value={form.name}
          onChange={set("name")}
          disabled={isLoading}
          className={inputClass}
          placeholder="Jonathan Doe"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className={labelClass}>
          <Mail size={14} className="text-slate-400" />
          Login Email
        </label>
        <input
          type="email"
          maxLength={100}
          value={form.email}
          onChange={set("email")}
          disabled={isLoading}
          className={inputClass}
          placeholder="you@company.com"
        />
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className={labelClass}>
            <Lock size={14} className="text-slate-400" />
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              maxLength={128}
              value={form.password}
              onChange={set("password")}
              disabled={isLoading}
              className={`${inputClass} pr-10`}
              placeholder="Min 10 chars"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>
            <Lock size={14} className="text-slate-400" />
            Confirm
          </label>
          <input
            type="password"
            maxLength={128}
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            disabled={isLoading}
            className={inputClass}
            placeholder="Repeat"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="group relative inline-flex items-center justify-center px-8 py-3.5 font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <span className="relative flex items-center gap-3">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating Account…
            </>
          ) : (
            <>
              Create Account
              <ChevronRight size={16} />
            </>
          )}
        </span>
      </button>

      <p className="text-center text-sm text-slate-500">
        Already registered?{" "}
        <button
          type="button"
          onClick={onSwitchTab}
          className="text-amber-600 hover:text-amber-700"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, ArrowRight, Shield, Sparkles,
  Building2, Mail, Lock, User, ChevronRight,
  Menu, X, KeyRound, Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/src/Hooks/Useauth";
import { RegisterPayload } from "@/src/types/user.types";

// ─────────────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [tab, setTab]                     = useState<"login" | "register">("login");
  const [mounted, setMounted]             = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-slate-50">

      {/* Toast container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
            borderRadius: "12px",
            padding: "12px 16px",
          },
          success: {
            style: { background: "#fefce8", border: "1px solid #fbbf24", color: "#92400e" },
            iconTheme: { primary: "#f59e0b", secondary: "#fff" },
          },
          error: {
            style: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b" },
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      {/* ── Mobile Header ────────────────────────────────────────────────────── */}
      <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
        <img
          src="./logo.png"
          alt="MailBulk Logo"
          className="h-10 w-auto object-contain"
        />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Left Panel ───────────────────────────────────────────────────────── */}
      <div
        className={`
          ${mobileMenuOpen ? "flex" : "hidden"}
          lg:flex lg:w-[42%]
          flex-col p-8 lg:p-14 text-white
          bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
          relative overflow-hidden
          min-h-[50vh] lg:min-h-screen
        `}
      >
        {/* Ambient blobs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0),
              repeating-linear-gradient(45deg,
                transparent,
                transparent 24px,
                rgba(200, 136, 42, 0.03) 24px,
                rgba(200, 136, 42, 0.03) 48px
              )
            `,
            backgroundSize: "40px 40px, 100% 100%",
          }}
        />

        {/* Logo — desktop only (mobile shows in header) */}
        <div className="hidden lg:block mb-14">
          <img
            src="./logo.png"
            alt="MailBulk Logo"
            className="h-14 xl:h-16 w-auto object-contain"
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[400px] mx-auto lg:mx-0">
          <div className="mb-4 inline-flex">
            <span className="inline-flex items-center gap-2 text-amber-400 text-xs tracking-wider bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
              <Sparkles size={12} />
              Premium Enterprise Solution
            </span>
          </div>

          <h1
            className="text-4xl lg:text-5xl xl:text-6xl leading-[1.1] mb-5 text-white"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            Excellence in
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              Communication.
            </span>
          </h1>

          <p className="text-sm leading-relaxed text-slate-400 mb-8 max-w-xs">
            Elevate your corporate outreach with our precision-engineered bulk
            mailing architecture. Designed for the discerning enterprise.
          </p>

          <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <Shield size={16} className="text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  99.9%
                </div>
              </div>
              <div className="text-[10px] tracking-wider uppercase text-slate-500">
                Deliverability Rate
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <Building2 size={16} className="text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Tier 1
                </div>
              </div>
              <div className="text-[10px] tracking-wider uppercase text-slate-500">
                Global Infrastructure
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 hidden lg:flex justify-between items-center pt-10 border-t border-white/5">
          <div className="text-[10px] tracking-wider text-slate-600">© 2024 MailBulk Global.</div>
          <div className="flex gap-6 text-[10px] text-slate-600">
            {["Privacy", "Terms", "Security"].map((item) => (
              <span key={item} className="hover:text-amber-400 cursor-pointer transition-colors">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-5 sm:px-10 lg:px-20 py-10 lg:py-12 bg-white/80 backdrop-blur-sm">
        <div className="max-w-[460px] w-full mx-auto animate-fade-up">
          {/* Heading */}
          <div className="mb-8 lg:mb-10">
            <h2
              className="text-3xl lg:text-4xl mb-2 text-slate-800"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {tab === "login" ? "Welcome Back" : "Begin Journey"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
              <Shield size={14} className="text-amber-500 flex-shrink-0" />
              {tab === "login"
                ? "Enter your credentials to access the dashboard."
                : "Create your enterprise account to get started."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mb-8 lg:mb-10 border-b border-slate-200">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-4 text-sm font-medium transition-all duration-300 relative ${
                  tab === t ? "text-amber-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
                {tab === t && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Forms */}
          {tab === "login"
            ? <LoginForm />
            : <RegisterForm onSwitchTab={() => setTab("login")} />
          }
        </div>
      </div>

      <style jsx>{`
        .animate-fade-up { animation: fadeUp 0.5s ease-out; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.6; }
        }
        .animate-pulse { animation: pulse 4s ease-in-out infinite; }
        .delay-1000    { animation-delay: 1s; }
      `}</style>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [remember,    setRemember]    = useState(false);

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
      router.push("/");
    } catch (err: any) {
      toast.error(err.message ?? "Login failed. Please try again.", { id: toastId });
    }
  };

  return (
    <form className="flex flex-col gap-5 lg:gap-6" onSubmit={handleSubmit}>
      {/* Email */}
      <div className="space-y-2">
        <label className="text-xs lg:text-sm font-medium text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Mail size={14} className="text-slate-400" />
            Corporate Email
          </span>
          <span className="text-[10px] text-slate-400">required</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 lg:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm disabled:opacity-60"
          placeholder="executive@company.com"
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-xs lg:text-sm font-medium text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lock size={14} className="text-slate-400" />
            Security Key
          </span>
          <button
            type="button"
            className="text-[10px] lg:text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            Forgot?
          </button>
        </label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 lg:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 pr-12 text-sm disabled:opacity-60"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors"
          >
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {/* Remember */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() => setRemember(!remember)}
            className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
              remember
                ? "bg-gradient-to-r from-amber-400 to-amber-600 border-amber-400"
                : "border-slate-300 hover:border-amber-400"
            }`}
          >
            {remember && (
              <svg width="10" height="7" viewBox="0 0 12 9" fill="none">
                <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <span className="text-sm text-slate-600">Remember this workstation</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="group relative inline-flex items-center justify-center px-8 py-3.5 lg:py-4 font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl overflow-hidden shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 mt-2 text-sm lg:text-base disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center gap-3">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Authenticating…
            </>
          ) : (
            <>
              Initialize Session
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
      </button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] lg:text-xs">
          <span className="px-4 bg-white text-slate-500">Enterprise Authentication</span>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500">
        Need assistance?{" "}
        <button type="button" className="font-medium text-amber-600 hover:text-amber-700 transition-colors relative group">
          Contact Concierge
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </button>
      </p>
    </form>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const router = useRouter();
  const { register, login, isLoading } = useAuth();

  const [showPass,    setShowPass]    = useState(false);
  const [showAppPass, setShowAppPass] = useState(false);

  const [form, setForm] = useState<RegisterPayload & { confirmPassword: string }>({
    name:              "",
    email:             "",
    password:          "",
    confirmPassword:   "",
    senderEmail:       "",
    googleAppPassword: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Client-side validation ────────────────────────────────────────────
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.senderEmail.trim() || !form.googleAppPassword.trim()) {
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
    if (!form.senderEmail.endsWith("@gmail.com")) {
      toast.error("Sender email must be a Gmail address.");
      return;
    }
    const cleanApp = form.googleAppPassword.replace(/\s/g, "");
    if (cleanApp.length !== 16) {
      toast.error("Google App Password must be exactly 16 characters.");
      return;
    }

    const toastId = toast.loading("Creating your account…");
    try {
      await register({
        name:              form.name.trim(),
        email:             form.email.trim(),
        password:          form.password,
        senderEmail:       form.senderEmail.trim(),
        googleAppPassword: cleanApp,
      });

      // Auto-login after registration
      toast.loading("Account created! Signing you in…", { id: toastId });
      await login(form.email.trim(), form.password);
      toast.success("Welcome aboard! Redirecting…", { id: toastId });
      router.push("/");
    } catch (err: any) {
      toast.error(err.message ?? "Registration failed. Please try again.", { id: toastId });
    }
  };

  const inputClass =
    "w-full px-4 py-3 lg:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm disabled:opacity-60";

  const labelClass =
    "text-xs lg:text-sm font-medium text-slate-700 flex items-center gap-2";

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
          value={form.name}
          onChange={set("name")}
          disabled={isLoading}
          className={inputClass}
          placeholder="Jonathan Doe"
          autoComplete="name"
        />
      </div>

      {/* Login email */}
      <div className="space-y-2">
        <label className={labelClass}>
          <Mail size={14} className="text-slate-400" />
          Login Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={set("email")}
          disabled={isLoading}
          className={inputClass}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>

      {/* Password row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className={labelClass}>
            <Lock size={14} className="text-slate-400" />
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              disabled={isLoading}
              className={`${inputClass} pr-10`}
              placeholder="Min 8 chars"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors"
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
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            disabled={isLoading}
            className={inputClass}
            placeholder="Repeat"
            autoComplete="new-password"
          />
        </div>
      </div>

      {/* Sender Gmail */}
      <div className="space-y-2">
        <label className={labelClass}>
          <Mail size={14} className="text-slate-400" />
          Sender Gmail
          <span className="ml-auto text-[10px] text-slate-400 font-normal">emails sent FROM this</span>
        </label>
        <input
          type="email"
          value={form.senderEmail}
          onChange={set("senderEmail")}
          disabled={isLoading}
          className={inputClass}
          placeholder="yourname@gmail.com"
        />
      </div>

      {/* Google App Password */}
      <div className="space-y-2">
        <label className={labelClass}>
          <KeyRound size={14} className="text-slate-400" />
          Google App Password
          <a
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[10px] text-amber-600 hover:underline font-normal"
          >
            Get one →
          </a>
        </label>
        <div className="relative">
          <input
            type={showAppPass ? "text" : "password"}
            value={form.googleAppPassword}
            onChange={set("googleAppPassword")}
            disabled={isLoading}
            className={`${inputClass} pr-10 tracking-widest`}
            placeholder="xxxx xxxx xxxx xxxx"
            maxLength={19}
          />
          <button
            type="button"
            onClick={() => setShowAppPass(!showAppPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors"
          >
            {showAppPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 pl-1">
          16-char app password from your Google account (not your Gmail password).
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="group relative inline-flex items-center justify-center px-8 py-3.5 lg:py-4 font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl overflow-hidden shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 mt-1 text-sm lg:text-base disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center gap-3">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating Account…
            </>
          ) : (
            <>
              Create Account
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
      </button>

      <p className="text-center text-sm text-slate-500 mt-1">
        Already registered?{" "}
        <button
          type="button"
          onClick={onSwitchTab}
          className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
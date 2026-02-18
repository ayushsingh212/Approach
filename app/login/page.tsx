"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-[42%] dark-grid-bg relative flex flex-col p-12 text-white overflow-hidden">
        {/* Cross-hatch overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(255,255,255,0.015) 28px, rgba(255,255,255,0.015) 30px)",
          }}
        />

        {/* Logo */}
        <div >
          <img src="./logo.png" alt="Logo"/>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[340px]">
          <h1
            className="text-5xl leading-[1.1] mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            Excellence in Communication.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#909090" }}>
            Elevate your corporate outreach with our precision-engineered bulk
            mailing architecture. Designed for the discerning enterprise.
          </p>

          {/* Stats */}
          <div className="mt-12 flex gap-10">
            <div>
              <div
                className="text-2xl font-semibold"
                style={{ color: "#c8882a", fontFamily: "'DM Sans', sans-serif" }}
              >
                99.9%
              </div>
              <div
                className="text-[10px] tracking-[0.18em] uppercase mt-1"
                style={{ color: "#606060" }}
              >
                Deliverability Rate
              </div>
            </div>
            <div>
              <div
                className="text-2xl font-semibold"
                style={{ color: "#c8882a", fontFamily: "'DM Sans', sans-serif" }}
              >
                Tier 1
              </div>
              <div
                className="text-[10px] tracking-[0.18em] uppercase mt-1"
                style={{ color: "#606060" }}
              >
                Global Infrastructure
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative z-10 text-[10px] tracking-[0.15em] uppercase"
          style={{ color: "#404040" }}
        >
          © 2024 Est. Mailbulk Global.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-20 py-12 bg-white">
        <div className="max-w-[420px] w-full mx-auto animate-fade-up">
          <h2
            className="text-4xl mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Sign In
          </h2>
          <p className="text-sm mb-10" style={{ color: "#9a9a9a" }}>
            Please enter your professional credentials.
          </p>

          {/* Tabs */}
          <div
            className="flex gap-6 border-b mb-10"
            style={{ borderColor: "#e8e8e8" }}
          >
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm transition-colors duration-200 capitalize ${
                  tab === t
                    ? "tab-active font-medium"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <LoginForm
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              remember={remember}
              setRemember={setRemember}
            />
          ) : (
            <RegisterForm />
          )}
        </div>
      </div>
    </div>
  );
}

function LoginForm({
  showPassword,
  setShowPassword,
  remember,
  setRemember,
}: {
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  remember: boolean;
  setRemember: (v: boolean) => void;
}) {
  return (
    <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
      {/* Email */}
      <div>
        <label className="form-label">Corporate Email</label>
        <input
          type="email"
          className="form-input"
          placeholder="executive@company.com"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label" style={{ marginBottom: 0 }}>
            Security Key
          </label>
          <button
            type="button"
            className="text-[10px] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "#c8882a" }}
          >
            Recovery?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="form-input pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2"
            style={{ color: "#b0b0b0" }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Remember */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setRemember(!remember)}
          className="w-4 h-4 border flex items-center justify-center transition-colors"
          style={{
            borderColor: remember ? "#c8882a" : "#d0d0d0",
            background: remember ? "#c8882a" : "transparent",
          }}
        >
          {remember && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path
                d="M1 3L3 5L7 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
        <span className="text-xs" style={{ color: "#6b6b6b" }}>
          Remember this workstation
        </span>
      </div>

      {/* Submit */}
      <Link
        href="/compose"
        className="btn-gold w-full justify-center text-center py-4"
      >
        Initialize Session
        <ArrowRight size={14} />
      </Link>

      {/* Integrated Auth */}
      <div className="relative">
        <div
          className="absolute inset-y-1/2 left-0 right-0 border-t"
          style={{ borderColor: "#eeeeee" }}
        />
        <div className="relative flex justify-center">
          <span
            className="bg-white px-4 text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "#b0b0b0" }}
          >
            Integrated Auth
          </span>
        </div>
      </div>

      {/* SSO Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {["Enterprise", "Azure"].map((provider) => (
          <button
            key={provider}
            type="button"
            className="btn-outline justify-center py-3 text-[11px]"
          >
            <span
              className="w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold text-white"
              style={{ background: "#2a2a2a" }}
            >
              {provider[0]}
            </span>
            {provider}
          </button>
        ))}
      </div>

      {/* Concierge */}
      <p className="text-center text-xs" style={{ color: "#9a9a9a" }}>
        Technical assistance required?{" "}
        <span
          className="cursor-pointer font-medium"
          style={{ color: "#c8882a" }}
        >
          Contact Concierge
        </span>
      </p>
    </form>
  );
}

function RegisterForm() {
  return (
    <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="form-label">First Name</label>
          <input type="text" className="form-input" placeholder="Jonathan" />
        </div>
        <div>
          <label className="form-label">Last Name</label>
          <input type="text" className="form-input" placeholder="Doe" />
        </div>
      </div>
      <div>
        <label className="form-label">Corporate Email</label>
        <input
          type="email"
          className="form-input"
          placeholder="executive@company.com"
        />
      </div>
      <div>
        <label className="form-label">Organization</label>
        <input
          type="text"
          className="form-input"
          placeholder="Global Logistics Corp."
        />
      </div>
      <div>
        <label className="form-label">Access Key</label>
        <input type="password" className="form-input" placeholder="••••••••" />
      </div>
      <Link
        href="/compose"
        className="btn-gold w-full justify-center text-center py-4"
      >
        Create Account
        <ArrowRight size={14} />
      </Link>
    </form>
  );
}

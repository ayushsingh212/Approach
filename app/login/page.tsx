"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Shield, Sparkles, Building2, Mail, Lock, User, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-[42%] relative flex flex-col p-12 text-white overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
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
            backgroundSize: '40px 40px, 100% 100%'
          }}
        />

        {/* <div className="relative z-20 flex items-center gap-3 mb-16 group">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-2xl shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="text-2xl font-bold text-white">MB</span>
          </div>
          <div>
            <span className="text-2xl font-light tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
              Mail<span className="font-bold text-amber-400">Bulk</span>
            </span>
            <div className="text-[10px] tracking-wider text-amber-400/60 uppercase">Enterprise Suite</div>
          </div>
        </div> */}
        <div>
          <img src="./logo.png" alt="MailBulk Logo"  />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[380px]">
          <div className="mb-4 inline-flex">
            <span className="inline-flex items-center gap-2 text-amber-400 text-xs tracking-wider bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
              <Sparkles size={12} />
              Premium Enterprise Solution
            </span>
          </div>
          
          <h1
            className="text-5xl leading-[1.1] mb-6 text-white"
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

          <div className="grid grid-cols-2 gap-6 mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <Shield size={16} className="text-amber-400" />
                </div>
                <div
                  className="text-3xl font-bold text-amber-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
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
                <div
                  className="text-3xl font-bold text-amber-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Tier 1
                </div>
              </div>
              <div className="text-[10px] tracking-wider uppercase text-slate-500">
                Global Infrastructure
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-center pt-12 border-t border-white/5">
          <div className="text-[10px] tracking-wider text-slate-600">
            © 2024 MailBulk Global.
          </div>
          <div className="flex gap-6 text-[10px] text-slate-600">
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Security</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-20 py-12 bg-white/80 backdrop-blur-sm">
        <div className="max-w-[440px] w-full mx-auto animate-fade-up">
          <div className="mb-10">
            <h2
              className="text-4xl mb-2 text-slate-800"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {tab === "login" ? "Welcome Back" : "Begin Journey"}
            </h2>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Shield size={14} className="text-amber-500" />
              {tab === "login" ? "Enter your credentials to access the dashboard." : "Create your enterprise account."}
            </p>
          </div>

          <div className="flex gap-8 mb-10 border-b border-slate-200">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-4 text-sm font-medium transition-all duration-300 relative ${
                  tab === t
                    ? "text-amber-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
                {tab === t && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                )}
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

      <style jsx>{`
        .animate-fade-up {
          animation: fadeUp 0.6s ease-out;
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
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
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Mail size={14} className="text-slate-400" />
            Corporate Email
          </span>
          <span className="text-xs text-slate-400">required</span>
        </label>
        <input
          type="email"
          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm"
          placeholder="executive@company.com"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Lock size={14} className="text-slate-400" />
            Security Key
          </label>
          <button
            type="button"
            className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            Forgot?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 pr-12 text-sm"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() => setRemember(!remember)}
            className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
              remember 
                ? "bg-gradient-to-r from-amber-400 to-amber-600 border-amber-400" 
                : "border-slate-300 hover:border-amber-400"
            }`}
          >
            {remember && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path
                  d="M1 4L4.5 7.5L11 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
          <span className="text-sm text-slate-600">Remember this workstation</span>
        </label>
      </div>

      <Link
        href="/compose"
        className="group relative inline-flex items-center justify-center px-8 py-4 font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl overflow-hidden shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 mt-4"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center gap-3">
          Initialize Session
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-4 bg-white text-slate-500">Enterprise Authentication</span>
        </div>
      </div>

      {/* <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Enterprise", icon: "🏢", bg: "from-blue-500 to-blue-600" },
          { name: "Azure", icon: "☁️", bg: "from-sky-500 to-sky-600" },
          { name: "Google", icon: "G", bg: "from-red-500 to-red-600" },
          { name: "Okta", icon: "🔐", bg: "from-green-500 to-green-600" }
        ].map((provider) => (
          <button
            key={provider.name}
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-300 group"
          >
            <span className={`w-6 h-6 rounded-md bg-gradient-to-br ${provider.bg} flex items-center justify-center text-white text-xs font-bold`}>
              {provider.icon}
            </span>
            <span className="text-xs font-medium text-slate-600 group-hover:text-amber-600">
              {provider.name}
            </span>
          </button>
        ))}
      </div> */}

      <p className="text-center text-sm text-slate-500 mt-6">
        Need assistance?{' '}
        <button
          type="button"
          className="font-medium text-amber-600 hover:text-amber-700 transition-colors relative group"
        >
          Contact Concierge
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </button>
      </p>
    </form>
  );
}

function RegisterForm() {
  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <User size={14} className="text-slate-400" />
            First Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm"
            placeholder="Jonathan"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <User size={14} className="text-slate-400" />
            Last Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Mail size={14} className="text-slate-400" />
          Corporate Email
        </label>
        <input
          type="email"
          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm"
          placeholder="executive@company.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Building2 size={14} className="text-slate-400" />
          Organization
        </label>
        <input
          type="text"
          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm"
          placeholder="Global Logistics Corp."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Lock size={14} className="text-slate-400" />
          Access Key
        </label>
        <input
          type="password"
          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm"
          placeholder="••••••••"
        />
      </div>

      <Link
        href="/compose"
        className="group relative inline-flex items-center justify-center px-8 py-4 font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl overflow-hidden shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 mt-4"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center gap-3">
          Create Account
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>

      <p className="text-center text-sm text-slate-500 mt-4">
        Already registered?{' '}
        <button
          type="button"
          className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
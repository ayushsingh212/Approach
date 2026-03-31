"use client";

import { Sparkles, Shield, Building2 } from "lucide-react";

export default function LeftPanel({
  mobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
}) {
  return (
    <div
      className={`
        ${mobileMenuOpen ? "flex" : "hidden"}
        lg:flex lg:w-[45%]
        flex-col justify-between
        px-8 lg:px-16 py-10
        bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]
        text-white relative overflow-hidden
      `}
    >
      {/* 🔥 BIG LOGO */}
      <div className="absolute top-10 left-10 z-10">
        <img
          src="/logo.png"
          alt="Approach"
          className="h-20 lg:h-32 object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]"
        />
      </div>

      {/* 🔥 CENTER CONTENT */}
      <div className="flex flex-col justify-center h-full max-w-lg mx-auto lg:mx-0">
        {/* Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 text-amber-400 text-xs tracking-wider bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20">
            <Sparkles size={12} />
            Premium Enterprise Solution
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-5xl lg:text-6xl leading-tight mb-6"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
          }}
        >
          Excellence in{" "}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
            Communication.
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-10">
          Elevate your corporate outreach with precision-engineered bulk mailing
          architecture.
        </p>

        {/* Stats */}
        <div className="flex gap-6 bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
          <div>
            <div className="text-3xl font-bold text-amber-400">99.9%</div>
            <div className="text-xs text-slate-500 uppercase">
              Deliverability
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400">Tier 1</div>
            <div className="text-xs text-slate-500 uppercase">
              Infrastructure
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-slate-500">© 2026 Approach</div>
    </div>
  );
}

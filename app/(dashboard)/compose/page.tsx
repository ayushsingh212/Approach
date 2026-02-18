"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image,
  Send,
  X,
  Upload,
  AlignRight,
  Mail,
  Key,
  Settings,
  ChevronDown,
  Paperclip,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";

const SUGGESTED_RECIPIENTS = [
  "Global Logistics Corp.",
  "Nordic Capital Group",
  "Sovereign Tech",
  "Apex Ventures",
  "Meridian Solutions",
];

export default function ComposePage() {
  const [recipients, setRecipients] = useState([
    "Global Logistics Corp.",
    "Nordic Capital Group",
    "Sovereign Tech",
  ]);
  const [searchInput, setSearchInput] = useState("");
  const [trackEngagement, setTrackEngagement] = useState(false);
  const [priorityDelivery, setPriorityDelivery] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [useCustomEmail, setUseCustomEmail] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showAppPassword, setShowAppPassword] = useState(false);

  const removeRecipient = (name: string) => {
    setRecipients((prev) => prev.filter((r) => r !== name));
  };

  const addRecipient = (name: string) => {
    if (!recipients.includes(name)) {
      setRecipients((prev) => [...prev, name]);
    }
    setSearchInput("");
  };

  const filtered = SUGGESTED_RECIPIENTS.filter(
    (r) =>
      !recipients.includes(r) &&
      r.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 lg:py-5 border-b bg-white/80 backdrop-blur-sm"
        style={{ borderColor: "#e8e8e8" }}
      >
        <div className="flex items-center gap-3 lg:gap-6">
          <h1
            className="text-xl sm:text-2xl lg:text-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            New Transmission
          </h1>
          <span className="hidden sm:inline-block w-px h-6 bg-slate-200" />
          <span
            className="hidden sm:block text-[10px] lg:text-xs tracking-[0.15em] uppercase"
            style={{ color: "#b0b0b0" }}
          >
            <Clock size={14} className="inline mr-1" />
            Autosaved 14:32
          </span>
        </div>
        <div className="flex items-center gap-3 lg:gap-6">
          <button
            className="text-[10px] lg:text-xs font-semibold tracking-[0.15em] uppercase px-3 lg:px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            style={{ color: "#6b6b6b" }}
          >
            Discard
          </button>
          <button
            onClick={() => setShowEmailSettings(!showEmailSettings)}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            style={{ color: "#6b6b6b" }}
          >
            <Settings size={18} className="lg:w-5 lg:h-5" />
            {useCustomEmail && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Email Settings Panel */}
      {showEmailSettings && (
        <div className="border-b bg-white/95 backdrop-blur-sm animate-slideDown">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 lg:py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <Mail size={16} className="text-amber-500" />
                Sender Configuration
              </h3>
              <button
                onClick={() => setShowEmailSettings(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setUseCustomEmail(!useCustomEmail)}
                  className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                    useCustomEmail 
                      ? "bg-gradient-to-r from-amber-400 to-amber-600 border-amber-400" 
                      : "border-slate-300 hover:border-amber-400"
                  }`}
                >
                  {useCustomEmail && (
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
                <span className="text-sm text-slate-700">Use custom email sender</span>
              </label>

              {useCustomEmail && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 animate-fadeIn">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 text-sm"
                      placeholder="your@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-2">
                      <Key size={14} className="text-slate-400" />
                      App Password
                    </label>
                    <div className="relative">
                      <input
                        type={showAppPassword ? "text" : "password"}
                        value={appPassword}
                        onChange={(e) => setAppPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all duration-300 pr-10 text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAppPassword(!showAppPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600"
                      >
                        {showAppPassword ? <Key size={16} /> : <Key size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 flex flex-col gap-6 lg:gap-8">
        {/* To */}
        <div>
          <label
            className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3 block flex items-center gap-2"
            style={{ color: "#9a9a9a" }}
          >
            <Mail size={14} />
            To
          </label>
          <div
            className="flex flex-wrap items-center gap-2 pb-3 border-b min-h-[48px]"
            style={{ borderColor: "#e0e0e0" }}
          >
            {recipients.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-50 border rounded-lg"
                style={{ borderColor: "#e0e0e0", color: "#1a1a1a" }}
              >
                {r}
                <button
                  onClick={() => removeRecipient(r)}
                  className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <div className="relative flex-1 min-w-[200px]">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full text-sm outline-none bg-transparent py-2"
                placeholder="Search corporate entities..."
                style={{ color: "#9a9a9a" }}
              />
              {searchInput && filtered.length > 0 && (
                <div
                  className="absolute top-10 left-0 bg-white border shadow-lg rounded-xl z-20 min-w-[240px] overflow-hidden"
                  style={{ borderColor: "#e8e8e8" }}
                >
                  {filtered.map((r) => (
                    <button
                      key={r}
                      onClick={() => addRecipient(r)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label
            className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3 block"
            style={{ color: "#9a9a9a" }}
          >
            Subject
          </label>
          <input
            className="w-full text-sm outline-none pb-3 border-b bg-transparent focus:border-amber-400 transition-colors"
            style={{ borderColor: "#e0e0e0", color: "#1a1a1a" }}
            placeholder="Quarterly Performance Overview & Strategic Roadmap"
            defaultValue="Quarterly Performance Overview & Strategic Roadmap"
          />
        </div>

        {/* Editor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-6">
          {/* Toolbar */}
          <div
            className="flex flex-wrap items-center gap-1 pb-4 border-b mb-4"
            style={{ borderColor: "#e8e8e8" }}
          >
            <div className="flex items-center gap-0.5">
              {[
                { icon: Bold, title: "Bold" },
                { icon: Italic, title: "Italic" },
                { icon: Underline, title: "Underline" },
              ].map(({ icon: Icon, title }) => (
                <button
                  key={title}
                  title={title}
                  className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
                  style={{ color: "#4a4a4a" }}
                >
                  <Icon size={14} className="lg:hidden" />
                  <Icon size={15} className="hidden lg:block" />
                </button>
              ))}
            </div>
            <div
              className="w-px h-4 mx-1 lg:mx-2"
              style={{ background: "#e0e0e0" }}
            />
            <div className="flex items-center gap-0.5">
              {[
                { icon: List, title: "Bullet List" },
                { icon: ListOrdered, title: "Ordered List" },
              ].map(({ icon: Icon, title }) => (
                <button
                  key={title}
                  title={title}
                  className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
                  style={{ color: "#4a4a4a" }}
                >
                  <Icon size={14} className="lg:hidden" />
                  <Icon size={15} className="hidden lg:block" />
                </button>
              ))}
            </div>
            <div
              className="w-px h-4 mx-1 lg:mx-2"
              style={{ background: "#e0e0e0" }}
            />
            <div className="flex items-center gap-0.5">
              {[
                { icon: Link2, title: "Insert Link" },
                { icon: Image, title: "Insert Image" },
              ].map(({ icon: Icon, title }) => (
                <button
                  key={title}
                  title={title}
                  className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
                  style={{ color: "#4a4a4a" }}
                >
                  <Icon size={14} className="lg:hidden" />
                  <Icon size={15} className="hidden lg:block" />
                </button>
              ))}
            </div>
            <button
              className="ml-auto w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
              style={{ color: "#b0b0b0" }}
              title="Align Right"
            >
              <AlignRight size={14} className="lg:hidden" />
              <AlignRight size={15} className="hidden lg:block" />
            </button>
          </div>

          {/* Content area */}
          <div
            className="min-h-[200px] lg:min-h-[260px] text-sm leading-relaxed outline-none p-2"
            contentEditable
            suppressContentEditableWarning
            style={{ color: "#2a2a2a", fontFamily: "DM Sans, sans-serif" }}
          >
            <p>Dear Stakeholders,</p>
            <p className="mt-4">
              Please find the comprehensive transmission regarding our
              operational adjustments for the upcoming fiscal quarter.
            </p>
            <p className="mt-4">
              We have integrated several key performance indicators that
              demonstrate the resilience of our current infrastructure...
            </p>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label
            className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3 block flex items-center gap-2"
            style={{ color: "#9a9a9a" }}
          >
            <Paperclip size={14} />
            Attachments
          </label>
          <div
            className="border-2 border-dashed rounded-2xl p-6 lg:p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors group"
            style={{ borderColor: "#d0d0d0" }}
          >
            <Upload size={24} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
            <p className="text-xs lg:text-sm text-slate-500">
              Drag and drop corporate assets or{" "}
              <span className="text-amber-600 font-medium hover:underline cursor-pointer">
                browse files
              </span>
            </p>
            <p className="text-[10px] text-slate-400">
              Supported: PDF, DOCX, XLSX (Max 25MB)
            </p>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <footer
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 px-4 sm:px-6 lg:px-10 py-4 border-t bg-white/80 backdrop-blur-sm"
        style={{ borderColor: "#e8e8e8" }}
      >
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
          {[
            {
              label: "Track Engagement",
              value: trackEngagement,
              set: setTrackEngagement,
              icon: Shield,
            },
            {
              label: "Priority Delivery",
              value: priorityDelivery,
              set: setPriorityDelivery,
              icon: Sparkles,
            },
          ].map(({ label, value, set, icon: Icon }) => (
            <label
              key={label}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <button
                type="button"
                onClick={() => set(!value)}
                className={`w-4 h-4 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                  value 
                    ? "bg-gradient-to-r from-amber-400 to-amber-600 border-amber-400" 
                    : "border-slate-300 group-hover:border-amber-400"
                }`}
              >
                {value && (
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
              <span className="flex items-center gap-1.5 text-[10px] lg:text-xs font-semibold tracking-[0.15em] uppercase text-slate-500">
                <Icon size={12} className="text-slate-400" />
                {label}
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 lg:gap-4 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none text-[10px] lg:text-xs font-medium tracking-[0.1em] uppercase px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            style={{ color: "#8a8a8a" }}
          >
            <Clock size={14} className="inline mr-1" />
            Schedule
          </button>
          <Link
            href="/transmissions"
            className="flex-1 sm:flex-none btn-primary py-2.5 lg:py-3.5 px-4 lg:px-8 flex items-center justify-center gap-2 text-xs lg:text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg shadow-amber-500/25"
          >
            Execute Send
            <Send size={12} className="lg:hidden" />
            <Send size={13} className="hidden lg:block" />
          </Link>
        </div>
      </footer>

      <style jsx>{`
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
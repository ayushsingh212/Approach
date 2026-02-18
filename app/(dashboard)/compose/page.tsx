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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between px-10 py-5 border-b"
        style={{ borderColor: "#e8e8e8" }}
      >
        <h1
          className="text-3xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          New Transmission
        </h1>
        <div className="flex items-center gap-6">
          <span
            className="text-xs tracking-[0.15em] uppercase"
            style={{ color: "#b0b0b0" }}
          >
            Autosaved at 14:32
          </span>
          <button
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: "#6b6b6b" }}
          >
            Discard
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-8">
        {/* To */}
        <div>
          <label
            className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3 block"
            style={{ color: "#9a9a9a" }}
          >
            To
          </label>
          <div
            className="flex flex-wrap items-center gap-2 pb-3 border-b"
            style={{ borderColor: "#e0e0e0" }}
          >
            {recipients.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border"
                style={{ borderColor: "#e0e0e0", color: "#1a1a1a" }}
              >
                {r}
                <button
                  onClick={() => removeRecipient(r)}
                  className="hover:opacity-60 transition-opacity"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <div className="relative">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="text-sm outline-none bg-transparent min-w-[200px]"
                placeholder="Search corporate entities..."
                style={{ color: "#9a9a9a" }}
              />
              {searchInput && filtered.length > 0 && (
                <div
                  className="absolute top-8 left-0 bg-white border shadow-lg z-20 min-w-[220px]"
                  style={{ borderColor: "#e8e8e8" }}
                >
                  {filtered.map((r) => (
                    <button
                      key={r}
                      onClick={() => addRecipient(r)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
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
            className="w-full text-sm outline-none pb-3 border-b bg-transparent"
            style={{ borderColor: "#e0e0e0", color: "#b0b0b0" }}
            placeholder="Quarterly Performance Overview & Strategic Roadmap"
            defaultValue="Quarterly Performance Overview & Strategic Roadmap"
          />
        </div>

        {/* Editor */}
        <div>
          {/* Toolbar */}
          <div
            className="flex items-center gap-1 pb-4 border-b mb-6"
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
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                  style={{ color: "#4a4a4a" }}
                >
                  <Icon size={15} strokeWidth={2} />
                </button>
              ))}
            </div>
            <div
              className="w-px h-4 mx-2"
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
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                  style={{ color: "#4a4a4a" }}
                >
                  <Icon size={15} strokeWidth={2} />
                </button>
              ))}
            </div>
            <div
              className="w-px h-4 mx-2"
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
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                  style={{ color: "#4a4a4a" }}
                >
                  <Icon size={15} strokeWidth={2} />
                </button>
              ))}
            </div>
            <button
              className="ml-auto w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
              style={{ color: "#b0b0b0" }}
              title="Align Right"
            >
              <AlignRight size={15} />
            </button>
          </div>

          {/* Content area */}
          <div
            className="min-h-[260px] text-sm leading-relaxed outline-none"
            contentEditable
            suppressContentEditableWarning
            style={{ color: "#2a2a2a", fontFamily: "DM Sans, sans-serif" }}
          >
            <p>Dear Stakeholders,</p>
            <p className="mt-2">
              Please find the comprehensive transmission regarding our
              operational adjustments for the upcoming fiscal quarter.
            </p>
            <p className="mt-2">
              We have integrated several key performance indicators that
              demonstrate the resilience of our current infrastructure...
            </p>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label
            className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3 block"
            style={{ color: "#9a9a9a" }}
          >
            Attachments
          </label>
          <div
            className="border border-dashed rounded-sm p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: "#d0d0d0" }}
          >
            <Upload size={24} style={{ color: "#c0c0c0" }} />
            <p className="text-sm" style={{ color: "#b0b0b0" }}>
              Drag and drop corporate assets or{" "}
              <span style={{ color: "#1a1a1a", textDecoration: "underline" }}>
                browse files
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <footer
        className="flex items-center justify-between px-10 py-4 border-t"
        style={{ borderColor: "#e8e8e8" }}
      >
        <div className="flex items-center gap-8">
          {[
            {
              label: "Track Engagement",
              value: trackEngagement,
              set: setTrackEngagement,
            },
            {
              label: "Priority Delivery",
              value: priorityDelivery,
              set: setPriorityDelivery,
            },
          ].map(({ label, value, set }) => (
            <label
              key={label}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <button
                type="button"
                onClick={() => set(!value)}
                className="w-4 h-4 border flex items-center justify-center transition-colors"
                style={{
                  borderColor: value ? "#c8882a" : "#c0c0c0",
                  background: value ? "#c8882a" : "transparent",
                }}
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
              <span
                className="text-[10px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: "#8a8a8a" }}
              >
                {label}
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            className="text-xs font-medium tracking-[0.1em] uppercase"
            style={{ color: "#8a8a8a" }}
          >
            Schedule
          </button>
          <Link
            href="/transmissions"
            className="btn-primary py-3.5 px-8 flex items-center gap-2"
          >
            Execute Send
            <Send size={13} />
          </Link>
        </div>
      </footer>
    </div>
  );
}

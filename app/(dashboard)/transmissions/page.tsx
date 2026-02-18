"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Download, X } from "lucide-react";
import { transmissions } from "@/lib/data";
import type { Transmission } from "@/types";

export default function TransmissionsPage() {
  const [selected, setSelected] = useState<Transmission>(transmissions[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = transmissions.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recipients.some((r) =>
        r.toLowerCase().includes(searchQuery.toLowerCase())
      )
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
          Sent Transmissions
        </h1>
        <div className="flex items-center gap-4 flex-1 ml-10">
          <div className="relative flex-1 max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#b0b0b0" }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transmissions by recipient or subject..."
              className="w-full pl-9 py-2 text-sm outline-none bg-transparent"
              style={{ color: "#6b6b6b" }}
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button style={{ color: "#9a9a9a" }}>
              <SlidersHorizontal size={16} />
            </button>
            <button style={{ color: "#9a9a9a" }}>
              <Download size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {/* Table header */}
          <div
            className="grid px-10 py-3 border-b"
            style={{
              gridTemplateColumns: "1fr 2fr 1.2fr 0.8fr",
              borderColor: "#e8e8e8",
            }}
          >
            {["Recipient(s)", "Subject", "Date/Time", "Status"].map((col) => (
              <span
                key={col}
                className="text-[10px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: "#9a9a9a" }}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelected(t)}
              className="grid px-10 py-5 border-b cursor-pointer transition-colors hover:bg-gray-50"
              style={{
                gridTemplateColumns: "1fr 2fr 1.2fr 0.8fr",
                borderColor: "#f0f0f0",
                background:
                  selected.id === t.id ? "#fafafa" : undefined,
              }}
            >
              {/* Recipient */}
              <div>
                <div className="text-sm font-medium" style={{ color: "#1a1a1a" }}>
                  {t.recipients[0]}{" "}
                  {t.recipients.length > 1 && (
                    <span style={{ color: "#9a9a9a" }}>
                      +{t.recipients.length - 1}
                    </span>
                  )}
                </div>
                {t.recipientCategory && (
                  <div
                    className="text-[10px] tracking-[0.12em] uppercase mt-0.5"
                    style={{ color: "#b0b0b0" }}
                  >
                    {t.recipientCategory}
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="text-sm pr-4" style={{ color: "#3a3a3a" }}>
                {t.subject}
              </div>

              {/* Date */}
              <div>
                <div className="text-sm" style={{ color: "#4a4a4a" }}>
                  {t.date}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "#b0b0b0" }}
                >
                  {t.time}
                </div>
              </div>

              {/* Status */}
              <div>
                <span
                  className={
                    t.status === "DELIVERED"
                      ? "badge-delivered"
                      : "badge-pending"
                  }
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div
            className="w-[340px] border-l overflow-y-auto flex flex-col"
            style={{ borderColor: "#e8e8e8" }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: "#f0f0f0" }}
            >
              <span
                className="text-[10px] font-semibold tracking-[0.2em] uppercase"
                style={{ color: "#c8882a" }}
              >
                Transmission Summary
              </span>
              <button style={{ color: "#b0b0b0" }}>
                <X size={14} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 flex-1">
              {/* Title */}
              <h3
                className="text-xl leading-snug"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {selected.subject}
              </h3>

              {/* Status */}
              <div className="flex items-center gap-3">
                <span
                  className={
                    selected.status === "DELIVERED"
                      ? "badge-delivered"
                      : "badge-pending"
                  }
                >
                  {selected.status}
                </span>
                {selected.sentVia && (
                  <span
                    className="text-[10px] tracking-[0.1em] uppercase"
                    style={{ color: "#9a9a9a" }}
                  >
                    • Sent via {selected.sentVia}
                  </span>
                )}
              </div>

              {/* Primary Recipient */}
              <div>
                <div
                  className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2"
                  style={{ color: "#9a9a9a" }}
                >
                  Primary Recipient
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: "#1a1a1a" }}
                >
                  {selected.recipients[0]} (Tier 1 Entity)
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#b0b0b0" }}>
                  contact@global-logistics.int
                </div>
              </div>

              {/* Metrics */}
              {(selected.openRate || selected.avgReadTime) && (
                <div>
                  <div
                    className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-3"
                    style={{ color: "#9a9a9a" }}
                  >
                    Engagement Metrics
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.openRate && (
                      <div
                        className="p-4"
                        style={{ background: "#f8f8f8" }}
                      >
                        <div
                          className="text-2xl font-semibold"
                          style={{ fontFamily: "DM Sans, sans-serif" }}
                        >
                          {selected.openRate}%
                        </div>
                        <div
                          className="text-[10px] tracking-[0.12em] uppercase mt-1"
                          style={{ color: "#9a9a9a" }}
                        >
                          Open Rate
                        </div>
                      </div>
                    )}
                    {selected.avgReadTime && (
                      <div
                        className="p-4"
                        style={{ background: "#f8f8f8" }}
                      >
                        <div
                          className="text-2xl font-semibold"
                          style={{ fontFamily: "DM Sans, sans-serif" }}
                        >
                          {selected.avgReadTime}
                        </div>
                        <div
                          className="text-[10px] tracking-[0.12em] uppercase mt-1"
                          style={{ color: "#9a9a9a" }}
                        >
                          Avg. Read Time
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assets */}
              {selected.assets && selected.assets.length > 0 && (
                <div>
                  <div
                    className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-3"
                    style={{ color: "#9a9a9a" }}
                  >
                    Included Assets
                  </div>
                  <div className="flex flex-col gap-2">
                    {selected.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between px-3 py-2.5"
                        style={{ background: "#1a1a1a" }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5"
                            style={{
                              background:
                                asset.type === "PDF" ? "#c8882a" : "#2a7a2a",
                              color: "white",
                            }}
                          >
                            {asset.type}
                          </span>
                          <span className="text-xs" style={{ color: "#d0d0d0" }}>
                            {asset.name}
                          </span>
                        </div>
                        <Download size={12} style={{ color: "#7a7a7a" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              {selected.preview && (
                <div>
                  <div
                    className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2"
                    style={{ color: "#9a9a9a" }}
                  >
                    Message Preview
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      color: "#6b6b6b",
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: "italic",
                    }}
                  >
                    {selected.preview}
                  </p>
                  <button
                    className="text-[10px] font-semibold tracking-[0.12em] uppercase mt-3"
                    style={{ color: "#c8882a" }}
                  >
                    View Full Transmission
                  </button>
                </div>
              )}
            </div>

            {/* Re-transmit */}
            <div className="p-4">
              <button className="btn-primary w-full justify-center py-4 flex items-center gap-2">
                Re-Transmit
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 7H12M8 3l4 4-4 4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

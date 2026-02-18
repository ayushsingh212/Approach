"use client";

import { useState } from "react";
import { Download, Globe, RefreshCcw, Shield } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { hourlyData, analyticsTopTransmissions } from "@/lib/data";

const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Custom"];

const reachData = [
  { region: "NORTH AMERICA", pct: 42 },
  { region: "WESTERN EUROPE", pct: 31 },
  { region: "APAC", pct: 18 },
  { region: "OTHER", pct: 9 },
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("Last 30 Days");

  return (
    <div className="h-screen overflow-y-auto">
      {/* Header */}
      <header
        className="flex items-center justify-between px-10 py-5 border-b sticky top-0 bg-white z-10"
        style={{ borderColor: "#e8e8e8" }}
      >
        <h1
          className="text-3xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Transmission Analytics
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold tracking-[0.15em] uppercase"
              style={{ color: "#9a9a9a" }}
            >
              Date Range
            </span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm font-medium outline-none bg-transparent cursor-pointer"
              style={{ color: "#1a1a1a" }}
            >
              {DATE_RANGES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <button
            className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase"
            style={{ color: "#3a3a3a" }}
          >
            <Download size={13} />
            Export Report
          </button>
        </div>
      </header>

      <div className="px-10 py-8 flex flex-col gap-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-5">
          {/* Total Transmissions */}
          <div className="card">
            <div
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#9a9a9a" }}
            >
              Total Transmissions
            </div>
            <div
              className="text-4xl font-semibold mb-1"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              142,804
            </div>
            <div
              className="text-xs font-semibold mb-4"
              style={{ color: "#16a34a" }}
            >
              +12.4%{" "}
              <span className="font-normal" style={{ color: "#b0b0b0" }}>
                vs last month
              </span>
            </div>
            <div
              className="h-0.5"
              style={{ background: "#1a1a1a", width: "55%" }}
            />
          </div>

          {/* Average Open Rate */}
          <div className="card">
            <div
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#9a9a9a" }}
            >
              Average Open Rate
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="text-4xl font-semibold mb-1"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  34.2%
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: "#16a34a" }}
                >
                  +2.1%{" "}
                  <span className="font-normal" style={{ color: "#b0b0b0" }}>
                    vs industry avg
                  </span>
                </div>
              </div>
              <MiniDonut value={34} color="#c8882a" />
            </div>
          </div>

          {/* CTR */}
          <div className="card">
            <div
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#9a9a9a" }}
            >
              Click-Through Rate
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="text-4xl font-semibold mb-1"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  8.9%
                </div>
                <div className="text-xs" style={{ color: "#9a9a9a" }}>
                  <span className="font-semibold" style={{ color: "#6b6b6b" }}>
                    Stable
                  </span>{" "}
                  from last period
                </div>
              </div>
              <MiniDonut value={9} color="#1a1a1a" />
            </div>
          </div>
        </div>

        {/* Engagement Velocity Chart */}
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3
                className="text-xl mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Engagement Velocity
              </h3>
              <div
                className="text-[10px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: "#b0b0b0" }}
              >
                Hourly Performance for the Last 24 Hours
              </div>
            </div>
            <div className="flex items-center gap-5">
              <Legend color="#1a1a1a" label="Opens" />
              <Legend color="#c8882a" label="Clicks" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={hourlyData} margin={{ left: -30 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#b0b0b0" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "none",
                  borderRadius: 0,
                  fontSize: 11,
                  color: "white",
                }}
              />
              <Bar dataKey="opens" fill="#e8e8e8" barSize={60} />
              <Line
                type="monotone"
                dataKey="opens"
                stroke="#6b6b6b"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#c8882a"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Top Transmissions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Top Transmissions
              </h3>
              <button
                className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: "#c8882a" }}
              >
                View All
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {analyticsTopTransmissions.map((t) => (
                <div key={t.name}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div
                        className="text-sm font-medium mb-0.5"
                        style={{ color: "#1a1a1a" }}
                      >
                        {t.name}
                      </div>
                      <div
                        className="text-[10px] tracking-[0.1em] uppercase"
                        style={{ color: "#b0b0b0" }}
                      >
                        {t.age} • {t.recipients}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>
                        {t.openRate}%
                      </div>
                      <div
                        className="text-[10px] tracking-[0.1em] uppercase"
                        style={{ color: "#b0b0b0" }}
                      >
                        Open
                      </div>
                      <div className="text-xs font-semibold mt-1" style={{ color: "#1a1a1a" }}>
                        {t.ctr}%
                      </div>
                      <div
                        className="text-[10px] tracking-[0.1em] uppercase"
                        style={{ color: "#b0b0b0" }}
                      >
                        CTR
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transmission Reach */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Transmission Reach
              </h3>
              <Globe size={16} style={{ color: "#b0b0b0" }} />
            </div>
            <div className="flex flex-col gap-4">
              {reachData.map((r) => (
                <div key={r.region}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-semibold tracking-[0.15em] uppercase"
                      style={{ color: "#6b6b6b" }}
                    >
                      {r.region}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#1a1a1a" }}
                    >
                      {r.pct}%
                    </span>
                  </div>
                  <div
                    className="h-1 w-full"
                    style={{ background: "#f0f0f0" }}
                  >
                    <div
                      className="h-1 transition-all duration-700"
                      style={{
                        width: `${r.pct}%`,
                        background: "#1a1a1a",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-10 py-4 border-t sticky bottom-0 bg-white"
        style={{ borderColor: "#e8e8e8" }}
      >
        <div className="flex items-center gap-2">
          <Shield size={13} style={{ color: "#c8882a" }} />
          <span
            className="text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "#6b6b6b" }}
          >
            All Data Verified via Blockchain Ledger
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ color: "#9a9a9a" }}
          >
            Settings
          </button>
          <button className="btn-primary py-3 px-6 flex items-center gap-2">
            Refresh Insights
            <RefreshCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span
        className="text-[10px] font-semibold tracking-[0.12em] uppercase"
        style={{ color: "#9a9a9a" }}
      >
        {label}
      </span>
    </div>
  );
}

function MiniDonut({ value, color }: { value: number; color: string }) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const stroke = (value / 100) * circumference;

  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="#f0f0f0" strokeWidth="5" />
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${stroke} ${circumference - stroke}`}
        strokeLinecap="round"
        transform="rotate(-90 30 30)"
      />
      <text
        x="30"
        y="34"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#1a1a1a"
        fontFamily="DM Sans, sans-serif"
      >
        {value}%
      </text>
    </svg>
  );
}

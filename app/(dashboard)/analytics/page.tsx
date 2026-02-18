"use client";

import { useState } from "react";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { engagementTrends, topCampaigns } from "@/lib/data";

const TIMEFRAMES = ["Last 7 Days", "Last 30 Days", "Last Quarter", "YTD"];

const deviceData = [
  { name: "Desktop", value: 72, color: "#1a1a1a" },
  { name: "Mobile", value: 24, color: "#c8882a" },
  { name: "Other", value: 4, color: "#e8e8e8" },
];

export default function PerformanceAnalyticsPage() {
  const [timeframe, setTimeframe] = useState("Last 30 Days");

  return (
    <div className="h-screen overflow-y-auto">
      {/* Header */}
      <header
        className="flex items-center justify-between px-10 py-5 border-b sticky top-0 bg-white z-10"
        style={{ borderColor: "#e8e8e8" }}
      >
        <div className="flex items-center gap-6">
          <h1
            className="text-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Performance Analytics
          </h1>
          <div
            className="w-px h-6 self-center"
            style={{ background: "#e0e0e0" }}
          />
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold tracking-[0.12em] uppercase"
              style={{ color: "#9a9a9a" }}
            >
              Timeframe:
            </span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs font-semibold outline-none bg-transparent cursor-pointer"
              style={{ color: "#1a1a1a" }}
            >
              {TIMEFRAMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase"
          style={{ color: "#3a3a3a" }}
        >
          <Download size={13} />
          Export Data
        </button>
      </header>

      <div className="px-10 py-8 flex flex-col gap-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-5">
          <StatCard
            label="Average Open Rate"
            value="24.8%"
            change={1.2}
            changeLabel=""
            color="#c8882a"
          />
          <StatCard
            label="Total Transmissions"
            value="142.5k"
            unit="MTD"
            color="#1a1a1a"
          />
          <StatCard
            label="Click-Through Rate"
            value="4.12%"
            change={-0.3}
            changeLabel=""
            color="#1a1a1a"
          />
        </div>

        {/* Engagement Trends Chart */}
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div
                className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1"
                style={{ color: "#9a9a9a" }}
              >
                Engagement Trends
              </div>
              <p className="text-xs" style={{ color: "#b0b0b0" }}>
                Comparison of delivery success vs. recipient engagement
              </p>
            </div>
            <div className="flex items-center gap-5">
              <Legend color="#1a1a1a" label="Opens" />
              <Legend color="#c8882a" label="Clicks" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={engagementTrends} margin={{ left: -30 }}>
              <CartesianGrid
                strokeDasharray="0"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#b0b0b0", letterSpacing: "0.08em" }}
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
              <Line
                type="monotone"
                dataKey="opens"
                stroke="#1a1a1a"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#c8882a"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Top Campaigns */}
          <div className="card">
            <div
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-6"
              style={{ color: "#9a9a9a" }}
            >
              Top Performing Campaigns
            </div>
            <div className="flex flex-col gap-5">
              {topCampaigns.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "#1a1a1a" }}
                      >
                        {c.name}
                      </div>
                      <div
                        className="text-[10px] tracking-[0.1em] uppercase mt-0.5"
                        style={{ color: "#b0b0b0" }}
                      >
                        {c.sentDate} • {c.recipients}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-medium"
                        style={{ color: "#1a1a1a" }}
                      >
                        {c.openRate}% Open
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-0.5 w-full"
                    style={{ background: "#f0f0f0" }}
                  >
                    <div
                      className="h-0.5 transition-all duration-700"
                      style={{
                        width: `${c.openRate}%`,
                        background: "#1a1a1a",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Distribution */}
          <div className="card">
            <div
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-6"
              style={{ color: "#9a9a9a" }}
            >
              Device Distribution
            </div>
            <div className="flex items-center gap-8 justify-center">
              <div className="relative">
                <PieChart width={140} height={140}>
                  <Pie
                    data={deviceData}
                    cx={65}
                    cy={65}
                    innerRadius={48}
                    outerRadius={65}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    className="text-sm font-medium"
                    style={{ color: "#1a1a1a" }}
                  >
                    Desktop
                  </div>
                  <div
                    className="text-[10px] tracking-[0.1em] uppercase"
                    style={{ color: "#9a9a9a" }}
                  >
                    Primary
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {deviceData.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-xs" style={{ color: "#4a4a4a" }}>
                      {d.name.toUpperCase()} ({d.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div
        className="flex items-center justify-between px-10 py-4 border-t sticky bottom-0 bg-white"
        style={{ borderColor: "#e8e8e8" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#16a34a" }}
          />
          <span
            className="text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ color: "#6b6b6b" }}
          >
            System Status: Operational
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] tracking-[0.1em] uppercase" style={{ color: "#b0b0b0" }}>
            Reports generated every 15 minutes
          </span>
          <button
            className="text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ color: "#1a1a1a" }}
          >
            Support Center
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  change,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  change?: number;
  changeLabel?: string;
  color: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="card">
      <div
        className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3"
        style={{ color: "#9a9a9a" }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className="text-4xl font-semibold"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-xs tracking-[0.1em] uppercase"
            style={{ color: "#b0b0b0" }}
          >
            {unit}
          </span>
        )}
        {change !== undefined && (
          <span
            className="flex items-center gap-0.5 text-xs font-semibold"
            style={{ color: isPositive ? "#16a34a" : "#dc2626" }}
          >
            {isPositive ? (
              <TrendingUp size={11} />
            ) : (
              <TrendingDown size={11} />
            )}
            {isPositive ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <div
        className="h-0.5 w-20 mt-4"
        style={{ background: color }}
      />
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

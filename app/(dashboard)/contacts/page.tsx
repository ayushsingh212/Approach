"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { corporateEntities } from "@/lib/data";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const filtered = corporateEntities.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
    setSelectAll(!selectAll);
  };

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
          Corporate Entity Directory
        </h1>
        <div className="flex items-center gap-3">
          <button className="btn-outline">Import List</button>
          <button className="btn-primary py-2.5 flex items-center gap-2">
            <span className="text-lg leading-none">+</span>
            Add Company
          </button>
        </div>
      </header>

      <div className="px-10 py-6 flex flex-col gap-6 flex-1 overflow-hidden">
        {/* Search + Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#c0c0c0" }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entities by name or industry..."
              className="w-full pl-9 py-2.5 text-sm outline-none bg-transparent"
              style={{ color: "#6b6b6b" }}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="btn-outline flex items-center gap-2"
              style={{ fontSize: "11px" }}
            >
              Industry
              <ChevronLeft size={12} className="rotate-[-90deg]" />
            </button>
            <button
              className="btn-outline flex items-center gap-2"
              style={{ fontSize: "11px" }}
            >
              Region
              <ChevronLeft size={12} className="rotate-[-90deg]" />
            </button>
            <div
              className="w-px h-5 mx-1"
              style={{ background: "#e0e0e0" }}
            />
            <button style={{ color: "#9a9a9a" }}>
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {/* Table Header */}
          <div
            className="grid items-center px-4 py-3 border-b"
            style={{
              gridTemplateColumns: "40px 280px 1fr 1fr 120px 1fr",
              borderColor: "#e8e8e8",
            }}
          >
            <button
              onClick={toggleAll}
              className="w-4 h-4 border flex items-center justify-center"
              style={{
                borderColor: selectAll ? "#1a1a1a" : "#d0d0d0",
                background: selectAll ? "#1a1a1a" : "transparent",
              }}
            >
              {selectAll && (
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
            {["Entity Name", "Industry", "Region", "Primary Contacts", "Last Interaction"].map(
              (col) => (
                <span
                  key={col}
                  className="text-[10px] font-semibold tracking-[0.18em] uppercase"
                  style={{ color: "#9a9a9a" }}
                >
                  {col}
                </span>
              )
            )}
          </div>

          {/* Rows */}
          {filtered.map((entity) => (
            <div
              key={entity.id}
              className="grid items-center px-4 py-5 border-b hover:bg-gray-50 transition-colors cursor-pointer"
              style={{
                gridTemplateColumns: "40px 280px 1fr 1fr 120px 1fr",
                borderColor: "#f2f2f2",
              }}
            >
              <button
                onClick={() => toggleSelect(entity.id)}
                className="w-4 h-4 border flex items-center justify-center"
                style={{
                  borderColor: selectedIds.has(entity.id) ? "#1a1a1a" : "#d0d0d0",
                  background: selectedIds.has(entity.id) ? "#1a1a1a" : "transparent",
                }}
              >
                {selectedIds.has(entity.id) && (
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

              {/* Entity Name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ background: "#f0f0f0", color: "#6b6b6b" }}
                >
                  {entity.initial}
                </div>
                <span className="text-sm font-medium" style={{ color: "#1a1a1a" }}>
                  {entity.name}
                </span>
              </div>

              {/* Industry */}
              <span
                className="text-[11px] tracking-[0.1em] uppercase"
                style={{ color: "#9a9a9a" }}
              >
                {entity.industry}
              </span>

              {/* Region */}
              <span className="text-sm" style={{ color: "#4a4a4a" }}>
                {entity.region}
              </span>

              {/* Contacts */}
              <div className="flex items-center">
                <span
                  className="w-8 h-6 flex items-center justify-center text-xs font-medium"
                  style={{ background: "#f0f0f0", color: "#4a4a4a" }}
                >
                  {String(entity.primaryContacts).padStart(2, "0")}
                </span>
              </div>

              {/* Last Interaction */}
              <span
                className="text-[11px] tracking-[0.08em] uppercase"
                style={{ color: "#9a9a9a" }}
              >
                {entity.lastInteraction}
              </span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: "#e8e8e8" }}
        >
          <span
            className="text-[10px] font-medium tracking-[0.12em] uppercase"
            style={{ color: "#9a9a9a" }}
          >
            Showing 1-10 of 248 Entities
          </span>
          <div className="flex items-center gap-3">
            <button style={{ color: "#9a9a9a" }}>
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold px-3 py-1"
                style={{ background: "#1a1a1a", color: "white" }}
              >
                01
              </span>
              <span className="text-xs" style={{ color: "#b0b0b0" }}>
                /
              </span>
              <span className="text-xs" style={{ color: "#b0b0b0" }}>
                25
              </span>
            </div>
            <button style={{ color: "#9a9a9a" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

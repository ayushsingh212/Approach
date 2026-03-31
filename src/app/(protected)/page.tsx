"use client";

import { useEffect, useState } from "react";
import { useEmailStore } from "@/src/store/Emailstore";
import { emailService } from "@/src/services/Email.service";
import { Search, X, Paperclip } from "lucide-react";

const categories = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "E-Commerce",
  "Logistics",
  "Media",
  "Real Estate",
  "Manufacturing",
  "Consulting",
  "Other",
];

export default function HomePage() {
  const store = useEmailStore();

  const {
    companySearchResults,
    selectedCompanies,
    subject,
    emailBody,
    isSending,
  } = store;

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  // 🔥 FETCH COMPANIES WITH FILTERS
  useEffect(() => {
    const fetch = async () => {
      store.setCompanySearchLoading(true);
      try {
        const res = await emailService.searchCompanies({
          search,
          category: selectedCategories[0],
        });
        store.setCompanySearchResults(res.data, res.pagination);
      } finally {
        store.setCompanySearchLoading(false);
      }
    };

    fetch();
  }, [search, selectedCategories]);

  // 🔥 SEND EMAIL
  const handleSend = async () => {
    store.setIsSending(true);
    try {
      const res = await emailService.sendEmail({
        subject,
        emailBody: emailBody,
        companyIds: selectedCompanies.map((c) => c._id),
      });

      store.setSendResult(res);
      store.clearCompose();
      setAttachments([]);
    } catch (err: any) {
      store.setSendError(err.message);
    } finally {
      store.setIsSending(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [cat]
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">

      {/* LEFT PANEL */}
      <div className="w-[45%] border-r bg-white p-6 overflow-y-auto">

        {/* 🔍 SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50"
          />
        </div>

        {/* 🔥 CATEGORY FILTER */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs border ${
                selectedCategories.includes(cat)
                  ? "bg-amber-500 text-white"
                  : "bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🏢 COMPANY LIST */}
        <div className="space-y-2">
          {companySearchResults.map((c) => {
            const selected = selectedCompanies.some((sc) => sc._id === c._id);

            return (
              <div
                key={c._id}
                onClick={() =>
                  selected
                    ? store.removeSelectedCompany(c._id)
                    : store.addSelectedCompany(c)
                }
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selected
                    ? "bg-amber-50 border-amber-400"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.category}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-8">

        {/* SELECTED COMPANIES */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCompanies.map((c) => (
            <div
              key={c._id}
              className="flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full text-sm"
            >
              {c.name}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => store.removeSelectedCompany(c._id)}
              />
            </div>
          ))}
        </div>

        {/* SUBJECT */}
        <input
          placeholder="Email subject"
          value={subject}
          onChange={(e) => store.setSubject(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl border bg-white"
        />

        {/* 🔥 RICH TEXT (BASIC) */}
        <textarea
          placeholder="Write your email (HTML supported)"
          value={emailBody}
          onChange={(e) => store.setEmailBody(e.target.value)}
          className="w-full h-64 mb-4 p-4 border rounded-xl"
        />

        {/* 📎 ATTACHMENTS */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Paperclip size={16} />
            Add Attachment
            <input
              type="file"
              hidden
              multiple
              onChange={(e) =>
                setAttachments(Array.from(e.target.files || []))
              }
            />
          </label>

          <div className="text-sm mt-2 text-gray-500">
            {attachments.map((f) => f.name).join(", ")}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={isSending || selectedCompanies.length === 0}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl"
        >
          {isSending ? "Sending..." : "Send Emails"}
        </button>
      </div>
    </div>
  );
}
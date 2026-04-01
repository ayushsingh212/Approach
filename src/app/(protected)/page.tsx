"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEmailStore } from "@/src/store/Emailstore";
import { emailService } from "@/src/services/Email.service";
import { Search, X, Paperclip, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const store = useEmailStore();

  const {
    companySearchResults,
    selectedCompanies,
    subject,
    emailBody,
    isSending,
    sendResult,
    sendError,
  } = store;

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // 🔐 AUTHORIZATION CHECK
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  // 🔥 FETCH COMPANIES WITH FILTERS
  // useEffect(() => {
  //   const fetch = async () => {
  //     setIsSearchLoading(true);
  //     try {
  //       const res = await emailService.searchCompanies({
  //         search,
  //         category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
  //       });
  //       store.setCompanySearchResults(res.data, res.pagination);
  //     } catch (error: any) {
  //       toast.error("Failed to search companies");
  //       console.error("Search error:", error);
  //     } finally {
  //       setIsSearchLoading(false);
  //     }
  //   };

  //   // Debounce search
  //   const timer = setTimeout(fetch, 300);
  //   return () => clearTimeout(timer);
  // }, [search, selectedCategories, store]);

  // 🔥 SEND EMAIL
  const handleSend = async () => {
    // Validate before sending
    if (!subject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }

    if (!emailBody.trim()) {
      toast.error("Please write an email body");
      return;
    }

    if (selectedCompanies.length === 0) {
      toast.error("Please select at least one company");
      return;
    }

    store.setIsSending(true);
    const toastId = toast.loading("Sending emails...");

    try {
      const res = await emailService.sendEmail({
        subject: subject.trim(),
        emailBody: emailBody.trim(),
        companyIds: selectedCompanies.map((c) => c._id),
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      store.setSendResult(res);
      store.clearCompose();
      setAttachments([]);

      // ✅ Use sentCount from response or fallback to selectedCompanies length
      const sentCount = res.sentCount || selectedCompanies.length;
      toast.success(`Successfully sent to ${sentCount} company(ies)!`, {
        id: toastId,
      });
    } catch (err: any) {
      const errorMsg = err.message || "Failed to send emails";
      store.setSendError(errorMsg);
      toast.error(errorMsg, { id: toastId });
      console.error("Send error:", err);
    } finally {
      store.setIsSending(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [cat]
    );
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const newFiles = Array.from(files);

    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirect is happening
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* LEFT PANEL - COMPANY SELECTION */}
      <div className="w-[25%] border-r bg-white p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Select Companies</h2>

        {/* 🔍 SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* 🔥 CATEGORY FILTER */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-600 mb-2">CATEGORIES</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedCategories.includes(cat)
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 🏢 COMPANY LIST */}
        <div className="space-y-2">
          {isSearchLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto"></div>
            </div>
          ) : companySearchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No companies found. Try adjusting your search.
            </div>
          ) : (
            companySearchResults.map((c) => {
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
                      ? "bg-amber-50 border-amber-400 shadow-md"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{c.category}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL - COMPOSE EMAIL */}
      <div className="flex-1 p-8 flex flex-col">
        {/* SELECTED COMPANIES CHIPS */}
        {selectedCompanies.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              SELECTED COMPANIES ({selectedCompanies.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCompanies.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-900 rounded-full text-sm font-medium"
                >
                  {c.name}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-amber-700"
                    onClick={() => store.removeSelectedCompany(c._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUCCESS MESSAGES */}
        {sendResult && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Emails sent successfully!</p>
              <p className="text-sm text-green-800 mt-1">
                {sendResult.sentCount || selectedCompanies.length} email(s) sent
              </p>
            </div>
          </div>
        )}

        {/* ERROR MESSAGES */}
        {sendError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{sendError}</p>
          </div>
        )}

        {/* SUBJECT */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Subject
          </label>
          <input
            placeholder="e.g., Partnership Opportunity"
            value={subject}
            onChange={(e) => store.setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* EMAIL BODY */}
        <div className="mb-4 flex-1 flex flex-col">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Body
          </label>
          <textarea
            placeholder="Write your email message here... (HTML supported)"
            value={emailBody}
            onChange={(e) => store.setEmailBody(e.target.value)}
            className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            {emailBody.length} characters
          </p>
        </div>

        {/* 📎 ATTACHMENTS */}
        <div className="mb-6">
          <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition">
            <Paperclip size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Add Attachments
            </span>
            <input
              type="file"
              hidden
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>

          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Paperclip size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)}KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEND BUTTON */}
        <button
          onClick={handleSend}
          disabled={
            isSending ||
            selectedCompanies.length === 0 ||
            !subject.trim() ||
            !emailBody.trim()
          }
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
              Sending emails...
            </span>
          ) : (
            `Send to ${selectedCompanies.length} Company${selectedCompanies.length !== 1 ? "ies" : ""}`
          )}
        </button>
      </div>
    </div>
  );
}
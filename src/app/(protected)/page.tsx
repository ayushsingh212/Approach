"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEmailStore } from "@/src/store/Emailstore";
import { emailService } from "@/src/services/Email.service";
import { Search, X, Paperclip, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const categories = [
  "Technology", "Finance", "Healthcare", "Education", "Marketing",
  "E-Commerce", "Logistics", "Media", "Real Estate", "Manufacturing",
  "Consulting", "Other",
];

const ALLOWED_PDF_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const store = useEmailStore();

  const {
    companySearchResults, selectedCompanies, subject,
    emailBody, isSending, sendResult, sendError,
  } = store;

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔐 AUTHORIZATION CHECK
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // ✅ CLEAR ERROR/SUCCESS ON MOUNT (handles page reload)
  useEffect(() => {
    store.setSendError(null);
    store.setSendResult(null);
  }, []);

  // 🔥 FETCH COMPANIES WITH FILTERS
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsSearchLoading(true);
      try {
        const res = await emailService.searchCompanies({
          search: search || undefined,
          category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
        });
        store.setCompanySearchResults(res.data, res.pagination);
      } catch (error: any) {
        toast.error("Failed to search companies");
      } finally {
        setIsSearchLoading(false);
      }
    };
    const timer = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategories]);

  // ✅ AUTO-DISMISS after 5 seconds
  useEffect(() => {
    if (!sendError && !sendResult) return;
    const timer = setTimeout(() => {
      store.setSendError(null);
      store.setSendResult(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [sendError, sendResult]);

  const clearErrorState = () => {
    store.setSendError(null);
    store.setSendResult(null);
  };

  // 🔥 SEND EMAIL
  const handleSend = async () => {
    if (!subject.trim()) { toast.error("Please enter an email subject"); return; }
    if (!emailBody.trim()) { toast.error("Please write an email body"); return; }
    if (selectedCompanies.length === 0) { toast.error("Please select at least one company"); return; }

    clearErrorState(); // ✅ Clear before each new send attempt

    store.setIsSending(true);
    const toastId = toast.loading("Sending emails...");

    try {
      const formData = new FormData();
      formData.append("subject", subject.trim());
      formData.append("emailBody", emailBody.trim());
      selectedCompanies.forEach((company) => formData.append("companyIds", company._id));
      attachments.forEach((file) => formData.append("attachments", file));

      const res = await emailService.sendEmailWithAttachments(formData);

      store.setSendResult(res);
      store.clearCompose();
      setAttachments([]);

      toast.success(`Successfully sent to ${res?.summary?.totalSent ?? selectedCompanies.length} company(ies)!`, { id: toastId });
    } catch (err: any) {
      const errorMsg = err.message || "Failed to send emails";
      store.setSendError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    } finally {
      store.setIsSending(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [cat]
    );
  };

  const handleAttachClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    Array.from(files).forEach((file) => {
      if (!ALLOWED_PDF_TYPES.includes(file.type)) { toast.error(`${file.name} is not a PDF.`); return; }
      if (file.size > MAX_FILE_SIZE) { toast.error(`${file.name} exceeds 5MB limit`); return; }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      if (attachments.length + validFiles.length > 10) { toast.error("Maximum 10 attachments allowed"); return; }
      setAttachments((prev) => [...prev, ...validFiles]);
      toast.success(`Added ${validFiles.length} PDF(s)`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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

  if (!session) return null;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* LEFT PANEL */}
      <div className="w-[25%] border-r bg-white p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Select Companies</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

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

        <div className="space-y-2">
          {isSearchLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto"></div>
            </div>
          ) : companySearchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No companies found.</div>
          ) : (
            companySearchResults.map((c) => {
              const selected = selectedCompanies.some((sc) => sc._id === c._id);
              return (
                <div
                  key={c._id}
                  onClick={() => selected ? store.removeSelectedCompany(c._id) : store.addSelectedCompany(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selected ? "bg-amber-50 border-amber-400 shadow-md" : "bg-white border-gray-200 hover:border-gray-300"
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

      {/* RIGHT PANEL */}
      <div className="flex-1 p-8 flex flex-col">
        {selectedCompanies.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              SELECTED COMPANIES ({selectedCompanies.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCompanies.map((c) => (
                <div key={c._id} className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-900 rounded-full text-sm font-medium">
                  {c.name}
                  <X size={14} className="cursor-pointer hover:text-amber-700" onClick={() => store.removeSelectedCompany(c._id)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ SUCCESS — click anywhere on banner to dismiss */}
        {sendResult && (
          <div
            onClick={clearErrorState}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 cursor-pointer"
          >
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900">Emails sent successfully!</p>
              <p className="text-sm text-green-800 mt-1">
                {sendResult?.summary?.totalSent ?? 0} email(s) sent
                {sendResult?.summary?.totalFailed > 0 && (
                  <span className="text-orange-700"> · {sendResult.summary.totalFailed} failed</span>
                )}
              </p>
            </div>
            <X size={16} className="text-green-600 flex-shrink-0" />
          </div>
        )}

        {/* ✅ ERROR — click anywhere on banner to dismiss */}
        {sendError && (
          <div
            onClick={clearErrorState}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 cursor-pointer"
          >
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 flex-1">{sendError}</p>
            <X size={16} className="text-red-600 flex-shrink-0" />
          </div>
        )}

        {/* SUBJECT */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Subject</label>
          <input
            placeholder="e.g., Partnership Opportunity"
            value={subject}
            onChange={(e) => store.setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* EMAIL BODY */}
        <div className="mb-4 flex-1 flex flex-col">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Body</label>
          <textarea
            placeholder="Write your email message here... (HTML supported)"
            value={emailBody}
            onChange={(e) => store.setEmailBody(e.target.value)}
            className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">{emailBody.length} characters</p>
        </div>

        {/* ATTACHMENTS */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none", overflow: "hidden" }}
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={handleAttachClick}
            className="w-full flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition"
          >
            <Paperclip size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Add PDF Attachments {attachments.length > 0 && `(${attachments.length})`}
            </span>
          </button>
          <p className="text-xs text-gray-500 mt-1">PDFs only • Max 5MB per file • Max 10 files</p>

          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Paperclip size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">({(file.size / 1024).toFixed(1)}KB)</span>
                  </div>
                  <button type="button" onClick={() => removeAttachment(idx)} className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700">
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
          disabled={isSending || selectedCompanies.length === 0 || !subject.trim() || !emailBody.trim()}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
              Sending emails...
            </span>
          ) : (
            `Send to ${selectedCompanies.length} Compan${selectedCompanies.length !== 1 ? "ies" : "y"}`
          )}
        </button>
      </div>
    </div>
  );
}
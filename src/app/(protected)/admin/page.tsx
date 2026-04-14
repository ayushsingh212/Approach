"use client";

import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/src/Hooks/Useadmin";
import { AddCompanyPayload, CompanyCategory, COMPANY_CATEGORIES } from "@/src/types/admin.types";
import { Plus, X, Building2, Users, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useDebounce } from "@/src/Hooks/useDebounce";
import { SkeletonCard, SkeletonRow } from "@/src/components/ui/Skeleton";

export default function AdminPanel() {
  const {
    companies, companyPagination, companiesLoading, companiesError,
    fetchCompanies, addCompany, updateCompany, deleteCompany, clearCompaniesError,
    users, usersLoading, usersError, fetchUsers, updateUserRole, clearUsersError,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<"companies" | "users">("companies");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchCompany, setSearchCompany] = useState("");
  const debouncedSearchCompany = useDebounce(searchCompany, 500);
  const [searchUser, setSearchUser] = useState("");
  const debouncedSearchUser = useDebounce(searchUser, 500);

  const [filterCategory, setFilterCategory] = useState<CompanyCategory | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchData, setBatchData] = useState<AddCompanyPayload[]>([
    { name: "", email: "", category: [] },
  ]);

  const hasFetchedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    fetchCompanies({
      search: debouncedSearchCompany || undefined,
      category: filterCategory || undefined,
      page: 1,
    });
  }, [debouncedSearchCompany, filterCategory, fetchCompanies]);

  useEffect(() => {
    fetchUsers({
      search: debouncedSearchUser || undefined,
      page: 1,
    });
  }, [debouncedSearchUser, fetchUsers]);

  const handleAddRow = () => {
    if (batchData.length < 15) {
      setBatchData([...batchData, { name: "", email: "", category: [] }]);
    }
  };

  const removeBatchRow = (index: number) => {
    if (batchData.length > 1) {
      const updated = [...batchData];
      updated.splice(index, 1);
      setBatchData(updated);
    }
  };

  const updateBatchRow = (index: number, field: keyof AddCompanyPayload, value: string) => {
    const updated = [...batchData];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-add a new empty row when the user starts typing in the LAST row's name field
    if (field === "name" && index === updated.length - 1 && updated.length < 15) {
      if (value.trim() !== "") {
        updated.push({ name: "", email: "", category: [] });
      }
    }

    setBatchData(updated);
  };

  const toggleBatchCategory = (index: number, cat: CompanyCategory) => {
    const updated = [...batchData];
    const currentCategories = updated[index].category;
    const isSelected = currentCategories.includes(cat);

    updated[index].category = isSelected
      ? currentCategories.filter((c) => c !== cat)
      : [...currentCategories, cat];

    setBatchData(updated);
  };

  const handleBulkSubmit = async () => {
    // Filter out completely empty rows
    const validRows = batchData.filter(row => row.name.trim() !== "" && row.email.trim() !== "");
    
    if (validRows.length === 0) {
      alert("Please enter at least one company with name and email");
      return;
    }

    // Check if any valid row is missing categories
    const incompleteRow = validRows.find(row => row.category.length === 0);
    if (incompleteRow) {
      alert(`Please select at least one category for "${incompleteRow.name}"`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addCompany(validRows);
      // Reset to one empty row
      setBatchData([{ name: "", email: "", category: [] }]);
      setShowAddForm(false);
    } catch (err: any) {
      // Error is already handled by useAdmin and stored in state
      console.error("Bulk submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage companies and users</p>
        </div>
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6">
            {[
              { id: "companies", label: "Companies", icon: Building2 },
              { id: "users", label: "Users", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* ── COMPANIES TAB ── */}
        {activeTab === "companies" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-800">Companies</h2>
              <button
                onClick={() => {
                  if (showAddForm) {
                    // Reset when closing
                    setBatchData([{ name: "", email: "", category: [] }]);
                  }
                  setShowAddForm(!showAddForm);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
                  ${showAddForm
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"}`}
              >
                {showAddForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add Company</>}
              </button>
            </div>

            {/* Bulk Add Form */}
            {showAddForm && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg overflow-hidden transition-all">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Plus size={18} className="text-amber-500" />
                    Add Multiple Companies
                  </h3>
                  <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-600 rounded-lg">
                    Max 15 rows
                  </span>
                </div>

                <div className="overflow-x-auto -mx-5 px-5 mb-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">#</th>
                        <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest px-2 min-w-[200px]">Name *</th>
                        <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest px-2 min-w-[250px]">Email *</th>
                        <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest px-2 min-w-[300px]">Categories *</th>
                        <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest px-2 w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {batchData.map((row, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-2 text-xs font-medium text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-2">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => updateBatchRow(idx, "name", e.target.value)}
                              placeholder="Company name"
                              className="w-full bg-transparent border-0 focus:ring-0 text-sm py-1 placeholder:text-slate-300 font-medium"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="email"
                              value={row.email}
                              onChange={(e) => updateBatchRow(idx, "email", e.target.value.toLowerCase().trim())}
                              placeholder="email@example.com"
                              className="w-full bg-transparent border-0 focus:ring-0 text-sm py-1 placeholder:text-slate-300"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-wrap gap-1">
                              {COMPANY_CATEGORIES.map((cat) => {
                                const selected = row.category.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleBatchCategory(idx, cat)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                      selected
                                        ? "bg-amber-500 text-white border-amber-500"
                                        : "bg-white text-slate-400 border-slate-200 hover:border-amber-300"
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            {batchData.length > 1 && (
                              <button
                                onClick={() => removeBatchRow(idx)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    disabled={batchData.length >= 15}
                    className="flex-1 py-1.5 border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold
                      rounded-xl hover:border-amber-300 hover:text-amber-500 transition disabled:opacity-30 uppercase tracking-widest"
                  >
                    + Add Row Manually
                  </button>
                  <button
                    onClick={handleBulkSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm
                      hover:bg-amber-500 shadow-md hover:shadow-amber-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Saving Companies...
                      </span>
                    ) : (
                      <>Submit {batchData.filter(r => r.name && r.email).length} Companies</>
                    )}
                  </button>
                </div>
              </div>
            )}


            {/* Error */}
            {companiesError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex justify-between items-start text-sm text-red-700">
                <span>{companiesError}</span>
                <button onClick={clearCompaniesError} className="ml-3 flex-shrink-0 text-red-500 hover:text-red-700">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                    focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as CompanyCategory | "")}
                className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                  focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">All Categories</option>
                {COMPANY_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <button
                onClick={() => { setSearchCompany(""); setFilterCategory(""); fetchCompanies({ page: 1, limit: 20 }); }}
                className="px-4 py-2.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium transition"
              >
                Reset
              </button>
            </div>

            {/* Companies list */}
            {companiesLoading ? (
              <div className="grid gap-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <Building2 size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No companies yet</p>
                <p className="text-slate-400 text-sm mt-1">Add your first company above</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {companies.map((company) => (
                  <div key={company._id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{company.name}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            company.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}>
                            {company.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">{company.email}</p>
                        {company.category?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {company.category.map((cat) => (
                              <span key={cat} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                        {company.location && <p className="text-xs text-slate-400 mt-1">📍 {company.location}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateCompany(company._id, { isActive: !company.isActive })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                            company.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                              : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                          }`}
                        >
                          {company.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete "${company.name}"?`)) deleteCompany(company._id); }}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-600
                            hover:bg-red-100 border border-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {companyPagination && companyPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  disabled={companyPagination.page <= 1}
                  onClick={() => fetchCompanies({ page: companyPagination.page - 1 })}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400
                    disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-slate-600 font-medium px-2">
                  {companyPagination.page} / {companyPagination.totalPages}
                </span>
                <button
                  disabled={companyPagination.page >= companyPagination.totalPages}
                  onClick={() => fetchCompanies({ page: companyPagination.page + 1 })}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400
                    disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Users</h2>

            {usersError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex justify-between items-start text-sm text-red-700">
                <span>{usersError}</span>
                <button onClick={clearUsersError}><X size={16} /></button>
              </div>
            )}

            {usersLoading ? (
              <div className="grid gap-3">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <Users size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No users found</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {users.map((user) => (
                  <div key={user._id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{user.name}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {user.role}
                          </span>
                          {user.isVerified && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Emails sent: {user.emailsSentCount || 0}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {user.role !== "admin" ? (
                          <button
                            onClick={() => { if (confirm("Make this user admin?")) updateUserRole(user._id, "admin"); }}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-50 text-purple-700
                              hover:bg-purple-100 border border-purple-200 transition"
                          >
                            Make Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => { if (confirm("Remove admin role?")) updateUserRole(user._id, "user"); }}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-600
                              hover:bg-slate-200 border border-slate-200 transition"
                          >
                            Remove Admin
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
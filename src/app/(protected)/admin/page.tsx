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
  const [formData, setFormData] = useState<AddCompanyPayload>({
    name: "", email: "", category: [],
  });

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

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.category.length === 0) {
      alert("Please fill in name, email, and at least one category");
      return;
    }
    setIsSubmitting(true);
    try {
      await addCompany(formData);
      setFormData({ name: "", email: "", category: [] });
      setShowAddForm(false);
    } catch (err: any) {
      alert(`Error: ${err?.response?.data?.error || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (cat: CompanyCategory) => {
    const isSelected = formData.category.includes(cat);
    setFormData({
      ...formData,
      category: isSelected ? formData.category.filter((c) => c !== cat) : [...formData.category, cat],
    });
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
                onClick={() => setShowAddForm(!showAddForm)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
                  ${showAddForm
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"}`}
              >
                {showAddForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add Company</>}
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">New Company</h3>
                <form onSubmit={handleAddCompany} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Acme Corp"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
                        placeholder="contact@company.com"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Categories * <span className="font-normal normal-case">(select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMPANY_CATEGORIES.map((cat) => {
                        const sel = formData.category.includes(cat);
                        return (
                          <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                              sel ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
                            }`}>
                            {sel && "✓ "}{cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>


                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white
                      rounded-xl font-semibold text-sm hover:shadow-lg transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Adding..." : "Add Company"}
                  </button>
                </form>
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
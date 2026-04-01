"use client";

import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/src/Hooks/Useadmin";
import {
  AddCompanyPayload,
  CompanyCategory,
  COMPANY_CATEGORIES,
} from "@/src/types/admin.types";

export default function AdminPanel() {
  const {
    companies,
    companyPagination,
    companiesLoading,
    companiesError,
    fetchCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    clearCompaniesError,
    //
    users,
    usersLoading,
    usersError,
    fetchUsers,
    updateUserRole,
    clearUsersError,
  } = useAdmin();

  // ═════════════════════════════════════════════════════════════════════════
  // STATE
  // ═════════════════════════════════════════════════════════════════════════

  const [activeTab, setActiveTab] = useState<"companies" | "users">(
    "companies",
  );
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [searchCompany, setSearchCompany] = useState("");
  const [filterCategory, setFilterCategory] = useState<CompanyCategory | "">("");

  // Form states - ✅ category is ALWAYS an array
  const [formData, setFormData] = useState<AddCompanyPayload>({
    name: "",
    email: "",
    category: [], // ✅ Array, never empty string
    website: "",
    description: "",
    location: "",
    tags: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ═════════════════════════════════════════════════════════════════════════
  // FETCH DATA ON MOUNT - ONCE ONLY ✅
  // ═════════════════════════════════════════════════════════════════════════
  const hasFetchedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    // Companies tab
    if (activeTab === "companies" && !hasFetchedRef.current.companies) {
      hasFetchedRef.current.companies = true;
      console.log("📥 Loading companies (first time)...");
      fetchCompanies();
    }
    // Users tab
    else if (activeTab === "users" && !hasFetchedRef.current.users) {
      hasFetchedRef.current.users = true;
      console.log("📥 Loading users (first time)...");
      fetchUsers();
    }
  }, [activeTab, fetchCompanies, fetchUsers]);

  // ═════════════════════════════════════════════════════════════════════════
  // COMPANY HANDLERS
  // ═════════════════════════════════════════════════════════════════════════

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Validate that at least one category is selected
    if (!formData.name || !formData.email || formData.category.length === 0) {
      alert("Please fill in name, email, and select at least one category");
      return;
    }

    setIsSubmitting(true);
    try {
      await addCompany(formData);
      
      // ✅ Reset form with empty array for category
      setFormData({
        name: "",
        email: "",
        category: [],
        website: "",
        description: "",
        location: "",
        tags: [],
      });
      
      setShowAddCompanyForm(false);
      alert("✅ Company added successfully");
    } catch (err: any) {
      alert(`❌ Error: ${err?.response?.data?.error || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (!confirm(`Delete company "${name}"?`)) return;

    try {
      await deleteCompany(id);
      alert("✅ Company deleted");
    } catch (err: any) {
      alert(`❌ Error: ${err?.response?.data?.error || err.message}`);
    }
  };

  const handleUpdateCompanyRole = async (id: string, active: boolean) => {
    try {
      await updateCompany(id, { isActive: !active });
      alert(`✅ Company ${!active ? "activated" : "deactivated"}`);
    } catch (err: any) {
      alert(`❌ Error: ${err?.response?.data?.error || err.message}`);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // USER HANDLERS
  // ═════════════════════════════════════════════════════════════════════════

  const handleUpdateUserRole = async (
    userId: string,
    newRole: "user" | "admin",
  ) => {
    if (!confirm(`Change user role to "${newRole}"?`)) return;

    try {
      await updateUserRole(userId, newRole);
      alert(`✅ User role updated to ${newRole}`);
    } catch (err: any) {
      alert(`❌ Error: ${err?.response?.data?.error || err.message}`);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // HELPER: Category buttons toggle logic ✅
  // ═════════════════════════════════════════════════════════════════════════

  const toggleCategory = (cat: CompanyCategory) => {
    const isSelected = formData.category.includes(cat);
    const updatedCategories = isSelected
      ? formData.category.filter((c) => c !== cat)
      : [...formData.category, cat];
    
    setFormData({ ...formData, category: updatedCategories });
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: COMPANIES TAB
  // ═════════════════════════════════════════════════════════════════════════

  const renderCompaniesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
        <button
          onClick={() => setShowAddCompanyForm(!showAddCompanyForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          {showAddCompanyForm ? "Cancel" : "➕ Add Company"}
        </button>
      </div>

      {/* Add Company Form */}
      {showAddCompanyForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
          <h3 className="text-lg font-semibold mb-4">Add New Company</h3>
          <form onSubmit={handleAddCompany} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Acme Corp"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="company@example.com"
              />
            </div>

            {/* Category - ✅ Multiple selection with array */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category * <span className="text-gray-400 font-normal">(select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMPANY_CATEGORIES.map((cat) => {
                  const isSelected = formData.category.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition text-left ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {isSelected && "✓ "}
                      {cat}
                    </button>
                  );
                })}
              </div>
              {formData.category.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please select at least one category
                </p>
              )}
              {formData.category.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.category.join(", ")}
                </p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Company description..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="San Francisco, CA"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
            >
              {isSubmitting ? "Adding..." : "Add Company"}
            </button>
          </form>
        </div>
      )}

      {/* Errors */}
      {companiesError && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center">
          <span>{companiesError}</span>
          <button
            onClick={clearCompaniesError}
            className="text-red-600 hover:text-red-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Companies List */}
      <div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as CompanyCategory | "")}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {COMPANY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchCompany("");
              setFilterCategory("");
              fetchCompanies({ page: 1, limit: 20 });
            }}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium whitespace-nowrap"
          >
            Clear
          </button>
        </div>

        {companiesLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 mt-2">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg font-medium">No companies added yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Click "➕ Add Company" button above to create your first company
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {companies.map((company) => (
              <div
                key={company._id}
                className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {company.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          company.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {company.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">{company.email}</p>

                    {/* ✅ Display multiple categories */}
                    {company.category && company.category.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {company.category.map((cat) => (
                          <span
                            key={cat}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    {company.website && (
                      <p className="text-sm text-blue-600 mt-2">
                        🌐{" "}
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Visit Website
                        </a>
                      </p>
                    )}

                    {company.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {company.description}
                      </p>
                    )}

                    {company.location && (
                      <p className="text-sm text-gray-500 mt-1">
                        📍 {company.location}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-col sm:flex-row">
                    <button
                      onClick={() =>
                        handleUpdateCompanyRole(company._id, company.isActive)
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        company.isActive
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {company.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteCompany(company._id, company.name)
                      }
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - ✅ Fixed to use pagination state */}
        {companyPagination && companyPagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            {Array.from(
              { length: companyPagination.totalPages },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => 
                  fetchCompanies({ 
                    page,
                    limit: companyPagination.limit,
                    search: searchCompany || undefined,
                    category: filterCategory || undefined,
                  })
                }
                className={`px-3 py-1 rounded font-medium transition ${
                  page === companyPagination.page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: USERS TAB
  // ═════════════════════════════════════════════════════════════════════════

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900">Users</h2>

      {/* Errors */}
      {usersError && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center">
          <span>{usersError}</span>
          <button
            onClick={clearUsersError}
            className="text-red-600 hover:text-red-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Users List */}
      {usersLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 mt-2">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>

                    {user.isVerified && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Emails sent: {user.emailsSentCount || 0}
                  </p>
                </div>

                <div className="flex gap-2 flex-col sm:flex-row">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleUpdateUserRole(user._id, "admin")}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      Make Admin
                    </button>
                  )}

                  {user.role === "admin" && (
                    <button
                      onClick={() => handleUpdateUserRole(user._id, "user")}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
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
  );

  // ═════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage companies and users
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("companies")}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === "companies"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              🏢 Companies
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              👥 Users
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "companies" ? renderCompaniesTab() : renderUsersTab()}
      </div>
    </div>
  );
}
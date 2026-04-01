"use client";

import { useEffect } from "react";
import { useAdmin } from "@/src/Hooks/Useadmin";

/**
 * ✅ NO AUTH CHECKS HERE
 * 
 * The layout already verified this user is an admin.
 * This page should only handle data fetching and display.
 * 
 * Remove all role/auth checks - they belong in the layout!
 */

export default function AdminPanel() {
  const {
    companies,
    companiesLoading,
    companiesError,
    fetchCompanies,
    deleteCompany,
  } = useAdmin();

  // Fetch companies on mount
  // useEffect(() => {
  //   console.log("📥 AdminPanel: Fetching companies...");
  //   fetchCompanies();
  // }, [fetchCompanies]);

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete company "${name}"?`)) return;

    try {
      console.log("🗑️ Deleting company:", id);
      await deleteCompany(id);
      console.log("✅ Company deleted successfully");
    } catch (error) {
      console.error("❌ Delete failed:", error);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {/* Error Message */}
      {companiesError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{companiesError}</p>
        </div>
      )}

      {/* COMPANIES SECTION */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Companies</h2>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            {companies.length} total
          </span>
        </div>

        {companiesLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-gray-600 mt-2">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No companies found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {companies.map((company) => (
              <div
                key={company._id}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {company.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{company.email}</p>

                    {company.category && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {company.category}
                        </span>
                        {company.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                    )}

                    {company.description && (
                      <p className="text-sm text-gray-500 mt-2">
                        {company.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(company._id, company.name)}
                    className="ml-4 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
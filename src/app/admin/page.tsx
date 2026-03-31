"use client";

import { useEffect } from "react";
import { adminService } from "@/src/services/Admin.service";
import { useAdminStore } from "@/src/store/Adminstore";

export default function AdminPanel() {
  const store = useAdminStore();

  useEffect(() => {
    const fetch = async () => {
      store.setCompaniesLoading(true);
      try {
        const res = await adminService.getCompanies();
        store.setCompanies(res.data, res.pagination);
      } finally {
        store.setCompaniesLoading(false);
      }
    };

    fetch();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      <h1 className="text-2xl font-semibold mb-6">Admin Panel</h1>

      {/* COMPANIES */}
      <div className="mb-10">
        <h2 className="mb-3 font-semibold">Companies</h2>

        <div className="grid gap-3">
          {store.companies.map((c) => (
            <div
              key={c._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.category}</div>
              </div>

              <button
                onClick={() => adminService.deleteCompany(c._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
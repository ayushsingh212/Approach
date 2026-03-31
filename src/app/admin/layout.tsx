"use client";

import Sidebar from "@/src/components/layout/Sidebar";
import Topbar from "@/src/components/layout/Topbar";
import AuthGuard from "@/src/components/auth/authGaurd";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAdmin>
    <div className="flex">
      <Sidebar isAdmin />
      <div className="flex-1 flex flex-col h-screen">
        <Topbar />

        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
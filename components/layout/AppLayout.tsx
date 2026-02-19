"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
  
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener('sidebarChange' as any, handleSidebarChange);
    return () => window.removeEventListener('sidebarChange' as any, handleSidebarChange);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Sidebar />
      <main 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}
          ml-0 min-h-screen bg-white/80 backdrop-blur-sm
        `}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-end px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell size={18} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-medium">
              JD
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
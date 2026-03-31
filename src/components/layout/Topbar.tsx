"use client";

import { useAuth } from "@/src/Hooks/Useauth";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <div className="h-16 bg-white/80 backdrop-blur border-b flex items-center justify-between px-6 shadow-sm">

      <div className="text-lg font-semibold">
        Welcome back 👋
      </div>

      <div className="text-sm text-slate-600">
        {user?.name}
      </div>
    </div>
  );
}
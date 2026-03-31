"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Mail,
  History,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/src/Hooks/Useauth";

export default function Sidebar({ isAdmin = false }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const links = [
    { label: "Send Email", icon: Mail, path: "/" },
    { label: "History", icon: History, path: "/history" },
    { label: "Dashboard", icon: User, path: "/profile" },
    ...(isAdmin ? [{ label: "Admin", icon: Shield, path: "/admin" }] : []),
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white p-5 flex flex-col justify-between shadow-2xl">

      <div>
        {/* LOGO */}
        <div className="mb-10 flex items-center gap-3">
          <img src="/logo.png" className="h-10" />
          <span className="font-semibold text-lg">Approach</span>
        </div>

        {/* LINKS */}
        <div className="space-y-2">
          {links.map((l) => {
            const active = pathname === l.path;

            return (
              <div
                key={l.path}
                onClick={() => router.push(l.path)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
                  transition-all duration-300
                  ${
                    active
                      ? "bg-amber-500 shadow-lg"
                      : "hover:bg-white/10"
                  }
                `}
              >
                <l.icon size={18} />
                {l.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-400"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
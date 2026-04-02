"use client";

import { usePathname, useRouter } from "next/navigation";
import { Mail, History, User, LogOut, Shield, X } from "lucide-react";
import { useAuthStore } from "@/src/store/Authstore";
import { useAuth } from "@/src/Hooks/Useauth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { user } = useAuthStore();

  const isAdmin = user?.role === "admin";

  const links = [
    { label: "Send Email", icon: Mail, path: "/" },
    { label: "History", icon: History, path: "/history" },
    { label: "Dashboard", icon: User, path: "/profile" },
    ...(isAdmin ? [{ label: "Admin", icon: Shield, path: "/admin" }] : []),
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-gradient-to-b from-[#0f172a] to-[#020617]
          text-white flex flex-col justify-between shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:flex-shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-5">
          {/* Logo + close button row */}
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" className="h-10" alt="Logo" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
              <span className="font-bold text-xl tracking-tight">Approach</span>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {links.map((l) => {
              const active = pathname === l.path;
              return (
                <button
                  key={l.path}
                  onClick={() => handleNavigate(l.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 text-left text-sm font-medium
                    ${active
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <l.icon size={18} />
                  {l.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User info + logout */}
        <div className="p-5 border-t border-white/10">
          {user && (
            <div className="mb-3 px-4 py-2 rounded-xl bg-white/5">
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
              hover:bg-red-500/20 text-red-400 hover:text-red-300
              transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Mail,
  BarChart3,
  Settings,
  Users,
  Send,
  Inbox,
  Archive,
  Tag,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  Bell,
  Search,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Compose", href: "/compose", icon: Send },
  { name: "Inbox", href: "/inbox", icon: Inbox, badge: 3 },
  { name: "Campaigns", href: "/campaigns", icon: Mail },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Templates", href: "/templates", icon: Tag },
  { name: "Archive", href: "/archive", icon: Archive },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Handle responsive behavior
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col h-screen
          bg-gradient-to-b from-slate-900 to-slate-800
          text-white
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Area */}
        <div className={`
          flex items-center h-16 px-4 border-b border-white/10
          ${collapsed ? "justify-center" : "justify-between"}
        `}>
          {!collapsed ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">MB</span>
                </div>
                <span className="text-lg font-light tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Mail<span className="font-bold text-amber-400">Bulk</span>
                </span>
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden lg:block"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">MB</span>
              </Link>
              <button
                onClick={() => setCollapsed(false)}
                className="absolute -right-3 top-5 p-1 rounded-full bg-slate-800 border border-white/10 hover:bg-slate-700 transition-colors hidden lg:block"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}
        </div>

        {/* User Info - Collapsed */}
        {collapsed ? (
          <div className="py-4 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium">
              JD
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Jonathan Doe</p>
                <p className="text-xs text-slate-400 truncate">executive@company.com</p>
              </div>
              <div className="relative">
                <Bell size={16} className="text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Search - Only when expanded */}
        {!collapsed && (
          <div className="p-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg
                      transition-all duration-200
                      ${collapsed ? "justify-center" : ""}
                      ${isActive 
                        ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border-l-2 border-amber-400" 
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={18} className={isActive ? "text-amber-400" : ""} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm">{item.name}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-white/10" />

          {/* Secondary Navigation */}
          <ul className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg
                      transition-all duration-200
                      ${collapsed ? "justify-center" : ""}
                      ${isActive 
                        ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border-l-2 border-amber-400" 
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={18} className={isActive ? "text-amber-400" : ""} />
                    {!collapsed && <span className="text-sm">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upgrade Card - Only when expanded */}
        {!collapsed && (
          <div className="p-4 m-3 bg-gradient-to-br from-amber-500/20 to-amber-600/5 rounded-xl border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Enterprise Ready</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">
              Unlock advanced features with Enterprise plan
            </p>
            <button className="w-full py-1.5 text-[10px] font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300">
              Upgrade Now
            </button>
          </div>
        )}

        {/* Logout */}
        <div className={`
          p-4 border-t border-white/10
          ${collapsed ? "flex justify-center" : ""}
        `}>
          <button
            className={`
              flex items-center gap-3 text-slate-400 hover:text-white transition-colors
              ${collapsed ? "" : "w-full"}
            `}
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
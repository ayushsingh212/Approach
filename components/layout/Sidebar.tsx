"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Edit3, Send, BarChart2, Users, Archive, Settings } from "lucide-react";
import { clsx } from "clsx";

const Logo = () => (
  <div className="w-20 h-20">
    <img src="./logo.png" alt="" />
  </div>
);

const navItems = [
  { href: "/compose", icon: Edit3, label: "Compose" },
  { href: "/transmissions", icon: Send, label: "Transmissions" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/dashboard", icon: Archive, label: "Reports" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-16 bg-dark-sidebar flex flex-col items-center py-5 z-50 border-r border-white/5">
    
      <Link href="/compose" className="mb-10 mt-1 text-gold">
        <Logo />
      </Link>


      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={clsx(
                "w-full flex items-center justify-center h-11 w-16 transition-colors duration-150 relative group",
                active ? "text-gold" : "text-white/35 hover:text-white/70"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-gold" />
              )}
              <Icon size={18} strokeWidth={1.5} />
              {/* Tooltip */}
              <span className="absolute left-14 bg-dark text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none font-mono tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-4 mt-auto">
        <Link
          href="/login"
          title="Settings"
          className="text-white/35 hover:text-white/70 transition-colors"
        >
          <Settings size={16} strokeWidth={1.5} />
        </Link>
        <Link href="/login" title="JD">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-mono text-white/80 tracking-wider">
            JD
          </div>
        </Link>
      </div>
    </aside>
  );
}

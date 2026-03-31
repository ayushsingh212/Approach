"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
export default function MobileHeader({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
}) {
  return (
    <div className="lg:hidden flex items-center justify-center px-5 bg-slate-900 text-white">
      <Image src="/logo.png" alt="Approach Logo" height={100} width={100} />
      {/* <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-2 hover:bg-white/10 rounded-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button> */}
    </div>
  );
}
"use client";

import Image from "next/image";

export default function MobileHeader() {
  return (
    <div className="lg:hidden flex items-center justify-center py-6 px-5 bg-slate-900">
      <Image src="/logo.png" alt="Approach Logo" height={70} width={70} />
    </div>
  );
}
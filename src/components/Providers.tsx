"use client";

import { SessionProvider } from "next-auth/react";
import AuthGuard from "./auth/AuthGaurd";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </SessionProvider>
  );
}
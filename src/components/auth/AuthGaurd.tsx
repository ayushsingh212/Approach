"use client";

import { useAuth } from "@/src/Hooks/Useauth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSessionLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isSessionLoading, isAuthenticated]);

  if (isSessionLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
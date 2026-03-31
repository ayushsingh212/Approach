"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/Hooks/Useauth";

export default function AuthGuard({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const {
    isAuthenticated,
    isSessionLoading,
    isAdmin,
    fetchProfile,
  } = useAuth();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (!isSessionLoading && requireAdmin && !isAdmin) {
      router.push("/");
    }

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, isSessionLoading]);

  // 🔥 Prevent UI flicker
  if (isSessionLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">
          Loading session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
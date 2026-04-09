"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/src/store/Authstore";
import { useAuth } from "@/src/Hooks/Useauth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  // ✅ Read directly from store — single source of truth
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Still use the hook just to trigger fetchProfile if needed
  const { fetchProfile } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/authpage");
      return;
    }
    // Authenticated but no user in store yet → fetch it
    if (status === "authenticated" && !user && !isLoading) {
      fetchProfile();
    }
  }, [status, user, isLoading, fetchProfile, router]);

  useEffect(() => {
    // Only redirect once we have user data and know the role
    if (!user || isLoading) return;
    if (user.role !== "admin") {
      router.push("/profile?error=forgotten");
    }
  }, [user, isLoading, router]);

  // Session still resolving OR profile still loading OR not fetched yet
  if (status === "loading" || isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // User loaded but not admin — redirect handled in useEffect above, render nothing
  if (user.role !== "admin") return null;

  return <>{children}</>;
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/src/Hooks/Useauth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const { user, isLoading, fetchProfile } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { router.push("/authpage"); }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!user) { fetchProfile(); }
  }, [status, user, fetchProfile]);

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.role !== "admin") { router.push("/profile?error=forbidden"); return; }
    setIsAuthorized(true);
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
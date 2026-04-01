"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/src/Hooks/Useauth";

/**
 * ✅ SINGLE AUTH CHECK - Layout Only
 * 
 * ONLY the layout should do the role check.
 * The page (children) should NOT do auth checks.
 * 
 * If layout allows it through, the user is definitely admin.
 * No need to check again in the page.
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useSession();
  const { user, isLoading, fetchProfile } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  console.log("[AdminLayout] Rendering. Status:", status, "User:", user?.email, "Loading:", isLoading);

  // Step 1: Check session status
  useEffect(() => {
    if (status === "loading") {
      console.log("[AdminLayout] Session loading...");
      return;
    }

    if (status === "unauthenticated") {
      console.log("[AdminLayout] ❌ NOT AUTHENTICATED - Redirecting to login");
      router.push("/authpage");
      return;
    }

    console.log("[AdminLayout] ✅ Authenticated - Status is ready");
  }, [status, router]);

  // Step 2: Fetch profile once authenticated
  useEffect(() => {
    if (status !== "authenticated") {
      console.log("[AdminLayout] Skipping fetch - not authenticated yet");
      return;
    }

    if (user) {
      console.log("[AdminLayout] User already in store:", user.email, "Role:", user.role);
      return;
    }

    console.log("[AdminLayout] Fetching profile...");
    fetchProfile();
  }, [status, user, fetchProfile]);

  // Step 3: Check role once profile is loaded
  useEffect(() => {
    if (isLoading) {
      console.log("[AdminLayout] Profile loading...");
      return;
    }

    if (!user) {
      console.log("[AdminLayout] ❌ No user after loading");
      router.push("/authpage");
      return;
    }

    console.log("[AdminLayout] User loaded:", user.email, "Role:", user.role);

    if (user.role !== "admin") {
      console.log("[AdminLayout] ❌ NOT ADMIN - Role is:", user.role, "- Redirecting");
      router.push("/profile?error=forbidden");
      return;
    }

    console.log("[AdminLayout] ✅ ADMIN AUTHORIZED!");
    setIsAuthorized(true);
  }, [user, isLoading, router]);

  // Show loading
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return null;
  }

  // Authorized - render children
  return children;
}
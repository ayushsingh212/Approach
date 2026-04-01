"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Sidebar from "@/src/components/layout/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check NextAuth session status
    if (status === "loading") {
      // Still loading, wait
      return;
    }

    if (status === "unauthenticated") {
      // No session, redirect to login
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      // User is authenticated, allow access
      setIsChecking(false);
      return;
    }
  }, [status, session, router]);

  // Show loading screen while checking
  if (isChecking || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (redirect will happen)
  if (!session?.user) {
    router.push('/login');
  }

  // User is authenticated, render protected content
  return (
  <div className="flex">
  <Sidebar />
  <div className="w-full">
    {children}
  </div>
  </div>);
}
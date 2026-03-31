"use client";

import { useCallback } from "react";
import { useSession }  from "next-auth/react";
import { useAuthStore }    from "@/src/store/Authstore";
import { authService }     from "@/src/services/Auth.service";
import { userService }     from "@/src/services/User.service";
import { RegisterPayload, UpdateCredentialsPayload } from "@/src/types/user.types";

// ─── useAuth ──────────────────────────────────────────────────────────────────
// Combines NextAuth session (JWT identity) with the full profile from /api/user.
//
// Usage:
//   const { isAuthenticated, isAdmin, user, login, logout, fetchProfile } = useAuth();

export function useAuth() {
  const { data: session, status } = useSession();

  const {
    user,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    clearAuth,
  } = useAuthStore();

  const isSessionLoading = status === "loading";
  const isAuthenticated  = status === "authenticated";
  const isAdmin          = session?.user?.role === "admin";

  // ── Fetch full profile ────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      return profile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register(payload);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(email, password);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      clearAuth();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clearAuth, setLoading, setError]);

  // ── Update credentials ────────────────────────────────────────────────────
  const updateCredentials = useCallback(async (payload: UpdateCredentialsPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.updateCredentials(payload);
      if (result.user) setUser(result.user);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  // ── Clear error ───────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), [setError]);

  return {
    // ── NextAuth session ────────────────────────────────────────────────────
    session,
    isSessionLoading,
    isAuthenticated,
    isAdmin,

    // ── Full profile (from /api/user) ───────────────────────────────────────
    user,
    isLoading,
    error,

    // ── Actions ─────────────────────────────────────────────────────────────
    register,
    login,
    logout,
    fetchProfile,
    updateCredentials,
    clearError,
  };
}
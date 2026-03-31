import { create } from "zustand";
import { IUser } from "@/src/types/user.types";

// ─── Auth Store ───────────────────────────────────────────────────────────────
// Holds the full user profile fetched from /api/user (beyond what NextAuth
// stores in the JWT — e.g. emailsSentCount, senderEmail, etc.)

interface AuthState {
  user: IUser | null;
  isLoading: boolean;
  error: string | null;

  // Setters
  setUser:    (user: IUser | null) => void;
  setLoading: (loading: boolean)   => void;
  setError:   (error: string | null) => void;
  clearAuth:  () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:      null,
  isLoading: false,
  error:     null,

  setUser:    (user)      => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError:   (error)     => set({ error }),
  clearAuth:  ()          => set({ user: null, isLoading: false, error: null }),
}));
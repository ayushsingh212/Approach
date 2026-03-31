import { signIn, signOut } from "next-auth/react";
import { RegisterPayload } from "@/src/types/user.types";
import { IUser } from "@/src/types/user.types";

// ─── Auth Service ─────────────────────────────────────────────────────────────
// login / logout delegate to NextAuth; register calls the REST endpoint.

export const authService = {
  /**
   * POST /api/register
   * Creates a new user account (validates Gmail credentials before saving).
   */
  register: async (payload: RegisterPayload): Promise<{ message: string; user: IUser }> => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Registration failed");
    return data;
  },

  /**
   * NextAuth signIn with credentials strategy.
   * Returns the signIn result — caller should check result.ok / result.error.
   */
  login: async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) throw new Error(result.error);
    return result;
  },

  /**
   * Clears NextAuth session cookie via the custom logout route,
   * then calls NextAuth signOut to wipe client state.
   */
  logout: async (): Promise<void> => {
    await fetch("/api/logout", { method: "POST" });
    await signOut({ redirect: false });
  },
};
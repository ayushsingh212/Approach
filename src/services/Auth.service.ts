import { signIn, signOut } from "next-auth/react";
import { RegisterPayload, IUser } from "@/src/types/user.types";
import api from "@/src/lib/Axios";

// ─── Auth Service ─────────────────────────────────────────────────────────────
// login / logout delegate to NextAuth; register calls the REST endpoint.

export const authService = {
  /**
   * POST /api/auth/register
   * Creates a new user account (validates Gmail credentials before saving).
   */
  register: async (payload: RegisterPayload): Promise<{ message: string; user: IUser }> => {
    const { data } = await api.post<{ message: string; user: IUser }>(
      "/auth/register",
      payload
    );
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
    await api.post("/logout");
    await signOut({ redirect: false });
  },
};
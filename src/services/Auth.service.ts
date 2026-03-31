import { signIn, signOut } from "next-auth/react";
import { RegisterPayload, IUser } from "@/src/types/user.types";
import api from "@/src/lib/axios";

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * POST /api/auth/register
   * Creates a new user account (validates Gmail credentials before saving).
   */
  register: async (payload: RegisterPayload): Promise<{ message: string; user: IUser }> => {
    try {
      console.log("🚀 [REGISTER] Starting registration with payload:", {
        name: payload.name,
        email: payload.email,
        senderEmail: payload.senderEmail,
        passwordLength: payload.password?.length,
        googleAppPasswordLength: payload.googleAppPassword?.length,
      });

      const { data } = await api.post<{ message: string; user: IUser }>(
        "/auth/register",
        payload
      );

      console.log("✅ [REGISTER] Success:", data);
      return data;
    } catch (error: any) {
      console.error("❌ [REGISTER] Failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
        },
      });
      throw error;
    }
  },

  /**
   * NextAuth signIn with credentials strategy.
   * Returns the signIn result — caller should check result.ok / result.error.
   */
  login: async (email: string, password: string) => {
    try {
      console.log("🚀 [LOGIN] Attempting login for:", email);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      console.log("✅ [LOGIN] Result:", result);
      if (result?.error) throw new Error(result.error);
      return result;
    } catch (error: any) {
      console.error("❌ [LOGIN] Error:", error.message);
      throw error;
    }
  },

  /**
   * Clears NextAuth session cookie via the custom logout route,
   * then calls NextAuth signOut to wipe client state.
   */
  logout: async (): Promise<void> => {
    try {
      console.log("🚀 [LOGOUT] Calling logout API");
      await api.post("/auth/logout");
      console.log("✅ [LOGOUT] API successful");
    } catch (error: any) {
      console.error("❌ [LOGOUT] API error:", error.message);
    }
    await signOut({ redirect: false });
  },
};
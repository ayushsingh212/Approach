import { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { connectDB } from "@/src/lib/db";
import UserModel from "@/src/models/UserSchema";

// ─── Extend NextAuth types ────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "user" | "admin";
    };
  }
  interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "admin";
    name: string;
    email: string;
  }
}

// ─── Auth Options ─────────────────────────────────────────────────────────────

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        // Explicitly select password (it's select: false in schema)
        const user = await UserModel.findOne({
          email: credentials.email.toLowerCase().trim(),
        }).select("+password");

        if (!user) {
          throw new Error("No account found with this email");
        }

        const isMatch = await user.comparePassword(credentials.password);
        if (!isMatch) {
          throw new Error("Incorrect password");
        }

        // Return the minimal user object — gets encoded into JWT
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 2 * 24 * 60 * 60, // 2 days in seconds
  },

  jwt: {
    maxAge: 2 * 24 * 60 * 60, // 2 days
  },

  callbacks: {
    // Called when JWT is created or updated — persist extra fields into token
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    // Called whenever session is checked — expose token fields to session
    async session({ session, token }): Promise<Session> {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
      };
      return session;
    },
  },

  pages: {
    signIn: "/authpage",   // your custom login page
    error: "/authpage",    // redirect here on auth errors
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

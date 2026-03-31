// ─── User Types ───────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  name: string;
  email: string;             // login email
  senderEmail: string;       // Gmail used to send emails
  role: "user" | "admin";
  isVerified: boolean;
  emailsSentCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth Payloads ────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  senderEmail: string;
  googleAppPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateCredentialsPayload {
  senderEmail?: string;
  googleAppPassword?: string;
}

// ─── Generic API shape ────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  message: string;
  data?: T;
}

export interface ApiError {
  error: string;
}
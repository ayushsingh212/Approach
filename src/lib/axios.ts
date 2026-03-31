import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
  withCredentials: true, 
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach any runtime headers here (e.g. CSRF token, trace IDs).
// NextAuth session cookies are sent automatically by the browser.

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Example: custom trace header for debugging
    config.headers["X-Request-ID"] = crypto.randomUUID();

    console.log(`📤 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`, {
      params: config.params,
      payload: config.data ? JSON.parse(config.data) : undefined,
    });

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Unwraps the response data and normalises API errors into plain Error objects
// so callers always catch `err.message` — never an AxiosError shape.

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`📥 [${response.status}] ${response.config.url}`, {
      data: response.data,
    });
    return response;
  },

  (error: AxiosError<{ error?: string; message?: string }>) => {
    console.error(`❌ [${error.response?.status ?? "Network"}] ${error.config?.url}`, {
      payload: error.config?.data ? JSON.parse(error.config.data) : undefined,
      response: error.response?.data,
    });
    // Network / timeout — no response from server
    if (!error.response) {
      return Promise.reject(new Error("Network error – please check your connection."));
    }

    const { status, data } = error.response;

    // Extract a human-readable message from the API response body
    const message =
      data?.error ??
      data?.message ??
      error.message ??
      "An unexpected error occurred.";

    // Map common HTTP status codes to friendlier messages when the API
    // doesn't return its own error body.
    const statusMessages: Record<number, string> = {
      400: "Bad request.",
      401: "You are not authenticated. Please sign in.",
      403: "You do not have permission to perform this action.",
      404: "The requested resource was not found.",
      409: "A conflict occurred. The resource may already exist.",
      422: "Validation failed. Please check your input.",
      429: "Too many requests. Please slow down.",
      500: "Internal server error. Please try again later.",
      502: "Bad gateway. The server is temporarily unavailable.",
      503: "Service unavailable. Please try again later.",
    };

    const friendlyMessage = message !== error.message
      ? message                          // API returned its own error body — use it
      : (statusMessages[status] ?? message); // Fall back to our status-code map

    return Promise.reject(new Error(friendlyMessage));
  }
);

export default api;
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

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach trace header
    config.headers["X-Request-ID"] = crypto.randomUUID();

    // Safely parse request data
    let payloadLog = undefined;
    try {
      if (config.data) {
        payloadLog = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
      }
    } catch (e) {
      payloadLog = config.data;
    }

    console.log(`📤 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`, {
      params: config.params,
      payload: payloadLog,
    });

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`📥 [${response.status}] ${response.config.url}`, {
      data: response.data,
    });
    return response;
  },

  (error: AxiosError<{ error?: string; message?: string }>) => {
    // Safely parse request data for logging
    let payloadLog = undefined;
    try {
      if (error.config?.data) {
        payloadLog = typeof error.config.data === "string" 
          ? JSON.parse(error.config.data) 
          : error.config.data;
      }
    } catch (e) {
      payloadLog = error.config?.data;
    }

    console.error(`❌ [${error.response?.status ?? "Network"}] ${error.config?.url}`, {
      payload: payloadLog,
      response: error.response?.data,
      errorMessage: error.message,
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

    // Map common HTTP status codes to friendlier messages
    const statusMessages: Record<number, string> = {
      400: "Bad request. Please check your input.",
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
      ? message
      : (statusMessages[status] ?? message);

    return Promise.reject(new Error(friendlyMessage));
  }
);

export default api;
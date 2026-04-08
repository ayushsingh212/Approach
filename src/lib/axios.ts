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

  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Retry logic for GET requests only (idempotent)
    if (
      config &&
      config.method?.toUpperCase() === "GET" &&
      !config._retry && 
      (error.code === "ECONNABORTED" || error.response?.status === 429)
    ) {
      config._retry = true;
      const delay = error.response?.status === 429 ? 2000 : 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

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

    if (!error.response) {
      return Promise.reject(new Error("Network connection lost. Please verify your internet."));
    }

    const { status, data } = error.response;
    const message = data?.error ?? data?.message ?? error.message;

    const statusMessages: Record<number, string> = {
      400: "Invalid input. Please re-check your data.",
      401: "Session expired. Please log in again.",
      403: "Access denied. Admin permissions required.",
      404: "Resource not found.",
      409: "Data conflict. The resource likely already exists.",
      422: "Validation error. Check your input fields.",
      429: "Rate limit exceeded. Please wait a moment.",
      500: "Server error. We are investigating.",
      503: "Maintenance mode. Please try in a few minutes.",
    };

    const friendlyMessage = message || statusMessages[status] as string;
    return Promise.reject(new Error(friendlyMessage));
  }
);

export default api;
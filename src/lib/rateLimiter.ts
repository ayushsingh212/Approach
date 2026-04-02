import { NextResponse } from "next/server";

interface RateLimitConfig {
  limit: number;      // max requests
  windowMs: number;   // time window in milliseconds
}

/**
 * In-memory store for rate limiting.
 * Key: IP or identifier (e.g., userId)
 * Value: Array of timestamps of recent requests
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Standard Next.js custom rate limiter utility.
 * Use inside API routes or middleware.
 * 
 * Returns { success: boolean, retryAfter: number }
 */
export function rateLimiter(identifier: string, config: RateLimitConfig) {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let requestLogs = rateLimitStore.get(identifier) || [];

  // Filter logs within current window
  requestLogs = requestLogs.filter((timestamp) => timestamp > windowStart);

  if (requestLogs.length >= config.limit) {
    const oldestTimestamp = requestLogs[0];
    const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);
    return { success: false, retryAfter };
  }

  // Record new request
  requestLogs.push(now);
  rateLimitStore.set(identifier, requestLogs);

  return { success: true, retryAfter: 0 };
}

/**
 * Response helper for rate limiting
 */
export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      retryAfterSeconds: retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}

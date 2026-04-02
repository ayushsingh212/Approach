import { useRef, useCallback } from "react";

/**
 * useThrottle - Limits component function calls based on initial trigger
 * Great for "Send" buttons or high-volume button clicks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
) {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      }
    },
    [callback, delay]
  );
}

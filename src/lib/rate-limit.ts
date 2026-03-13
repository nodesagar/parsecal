/**
 * In-memory rate limiter for API routes.
 * Tracks requests per key (IP or user ID) using a sliding window.
 *
 * NOTE: This works per-instance. On serverless (Vercel), each cold start
 * gets a fresh map, so this is best-effort.
 */

type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

export type RateLimitConfig = {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
};

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key) || { timestamps: [] };

  // Lazy cleanup for this specific entry
  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

  // Periodic lazy cleanup of the entire store to prevent unrestricted growth
  // (runs every ~100 requests to save overhead)
  if (Math.random() < 0.01) {
    for (const [k, v] of store.entries()) {
      v.timestamps = v.timestamps.filter((t) => now - t < config.windowMs);
      if (v.timestamps.length === 0) store.delete(k);
    }
  }

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = config.windowMs - (now - oldestInWindow);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Global daily parse counter to stay within Gemini free tier.
 * Resets at midnight UTC.
 */
let globalDailyCount = 0;
let globalDailyResetDate = new Date().toISOString().split("T")[0];

export function checkGlobalDailyLimit(maxPerDay: number): {
  allowed: boolean;
  used: number;
  limit: number;
} {
  const today = new Date().toISOString().split("T")[0];

  // Reset if new day
  if (today !== globalDailyResetDate) {
    globalDailyCount = 0;
    globalDailyResetDate = today;
  }

  if (globalDailyCount >= maxPerDay) {
    return { allowed: false, used: globalDailyCount, limit: maxPerDay };
  }

  globalDailyCount++;
  return { allowed: true, used: globalDailyCount, limit: maxPerDay };
}

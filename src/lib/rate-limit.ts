/**
 * In-memory rate limiter for API routes.
 * Tracks requests per key (IP or user ID) using a sliding window.
 *
 * NOTE: This works per-instance. On serverless (Vercel), each cold start
 * gets a fresh map, so this is best-effort. For stricter limits,
 * use Upstash Redis rate limiting.
 */

type RateLimitEntry = {
    timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        entry.timestamps = entry.timestamps.filter((t) => now - t < 60_000 * 10);
        if (entry.timestamps.length === 0) store.delete(key);
    }
}, 5 * 60_000);

export type RateLimitConfig = {
    /** Max requests allowed in the window */
    maxRequests: number;
    /** Window size in milliseconds */
    windowMs: number;
};

export function checkRateLimit(
    key: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    const entry = store.get(key) || { timestamps: [] };

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

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
let globalDailyResetDate = new Date().toISOString().split('T')[0];

export function checkGlobalDailyLimit(maxPerDay: number): {
    allowed: boolean;
    used: number;
    limit: number;
} {
    const today = new Date().toISOString().split('T')[0];

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

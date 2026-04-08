/**
 * Simple in-memory sliding window rate limiter.
 * For production, replace with Redis-backed limiter.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 3600000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300000);

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request is allowed under the rate limit.
 * @param key Unique identifier (IP, user ID, etc.)
 * @param limit Max requests per window
 * @param windowMs Window duration in milliseconds (default: 1 hour)
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 3600000
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key) || { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + windowMs,
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetAt: now + windowMs,
  };
}

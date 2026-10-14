/**
 * Sliding window rate limiter for anonymous citizen reports & API endpoints
 */

interface RateLimitRecord {
  timestamps: number[];
}

const reportRateLimits = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  reportRateLimits.forEach((record, key) => {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      reportRateLimits.delete(key);
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  message?: string;
}

export function checkRateLimit(
  identifier: string,
  limit = 5,
  windowSeconds = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let record = reportRateLimits.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    reportRateLimits.set(identifier, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
      message: 'Too many reports submitted. Please wait before submitting another report.',
    };
  }

  // Record this request
  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetSeconds: windowSeconds,
  };
}

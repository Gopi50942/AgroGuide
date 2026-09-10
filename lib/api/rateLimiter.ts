import { NextRequest } from "next/server";

// ─────────────────────────────────────────────
// In-Memory Sliding Window Rate Limiter
// Safe for local development & single-instance production.
// Automatically cleans up expired windows.
// ─────────────────────────────────────────────

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  /** Maximum number of allowed requests in the time window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 20, windowMs: 60_000 }
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let record = memoryStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(key, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= config.maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = oldest ? Math.max(0, oldest + config.windowMs - now) : config.windowMs;
    return { allowed: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  const remaining = config.maxRequests - record.timestamps.length;
  return { allowed: true, remaining, resetMs: config.windowMs };
}

export function getClientIdentifier(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "local-client";
}

/** Sanitize server logs: never prints keys or raw payloads. */
export function logApiAccess(route: string, status: number, durationMs: number, info?: string) {
  const symbol = status < 400 ? "✅" : status === 429 ? "⏳" : "⚠️";
  console.log(`${symbol} [${route}] ${status} (${durationMs}ms)${info ? ` - ${info}` : ""}`);
}

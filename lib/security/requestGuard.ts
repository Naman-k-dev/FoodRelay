import { NextRequest, NextResponse } from "next/server";

/**
 * Sliding window rate limit store
 * Key: `${route}:${ip}`
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Clean up expired rate limit entries periodically (every 5 minutes)
 */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Extract client IP from proxy headers safely
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Check rate limit for a client IP on a specific route
 */
export function checkRateLimit(
  ip: string,
  routeKey: string,
  maxRequests = 20,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `${routeKey}:${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(key, newRecord);
    return { allowed: true, remaining: maxRequests - 1, resetAt: newRecord.resetAt };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

/**
 * Enforce maximum payload size from Content-Length header
 */
export function enforceMaxPayload(
  req: NextRequest,
  maxBytes: number
): { ok: boolean; status?: number; error?: string } {
  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const parsed = parseInt(contentLength, 10);
    if (!isNaN(parsed) && parsed > maxBytes) {
      return {
        ok: false,
        status: 413,
        error: `Payload too large. Maximum allowed size is ${Math.round(maxBytes / 1024)} KB.`,
      };
    }
  }
  return { ok: true };
}

/**
 * Sanitize plain text input:
 * - strips null bytes
 * - trims leading/trailing whitespace
 * - caps maximum character length
 */
export function sanitizeInputString(input: unknown, maxLength = 2000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/\0/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate base64 payload size and image format
 */
export function validateBase64Image(
  base64String: string,
  maxBytes = 7 * 1024 * 1024
): { valid: boolean; cleanBase64?: string; error?: string } {
  if (!base64String || typeof base64String !== "string") {
    return { valid: false, error: "Missing or invalid image base64 data." };
  }

  // Strip optional data URI header (e.g. data:image/jpeg;base64,)
  const clean = base64String.replace(/^data:[^;]+;base64,/, "");

  // Base64 encoding expands raw data by approx 4/3 (~1.37 with padding)
  const estimatedBytes = Math.ceil((clean.length * 3) / 4);
  if (estimatedBytes > maxBytes) {
    return {
      valid: false,
      error: `Image exceeds maximum permitted size of ${Math.round(maxBytes / (1024 * 1024))} MB.`,
    };
  }

  // Basic base64 character validation
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(clean.slice(0, 500))) {
    return { valid: false, error: "Image data contains invalid base64 characters." };
  }

  return { valid: true, cleanBase64: clean };
}

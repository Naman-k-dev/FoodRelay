import { describe, it, expect } from "vitest";
import {
  checkRateLimit,
  enforceMaxPayload,
  sanitizeInputString,
  validateBase64Image,
} from "@/lib/security/requestGuard";
import { NextRequest } from "next/server";

describe("Security Request Guard & Input Boundaries", () => {
  it("enforces sliding-window rate limiting correctly", () => {
    const testIp = `test-ip-${Date.now()}`;
    const route = "test-route";
    const maxReqs = 3;

    // 1st request
    const r1 = checkRateLimit(testIp, route, maxReqs, 5000);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    // 2nd request
    const r2 = checkRateLimit(testIp, route, maxReqs, 5000);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    // 3rd request
    const r3 = checkRateLimit(testIp, route, maxReqs, 5000);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request (should be blocked)
    const r4 = checkRateLimit(testIp, route, maxReqs, 5000);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("enforces maximum payload size against Content-Length header", () => {
    // Normal size
    const normalReq = new NextRequest("http://localhost/api/test", {
      headers: { "content-length": "1024" },
    });
    const normalCheck = enforceMaxPayload(normalReq, 2048);
    expect(normalCheck.ok).toBe(true);

    // Oversized
    const oversizedReq = new NextRequest("http://localhost/api/test", {
      headers: { "content-length": "5000000" },
    });
    const oversizedCheck = enforceMaxPayload(oversizedReq, 1024 * 1024);
    expect(oversizedCheck.ok).toBe(false);
    expect(oversizedCheck.status).toBe(413);
    expect(oversizedCheck.error).toContain("Payload too large");
  });

  it("sanitizes text input by stripping null bytes and truncating length", () => {
    const malicious = "Hello\0World!\0Dangerous injection   ";
    const sanitized = sanitizeInputString(malicious, 10);
    expect(sanitized).toBe("HelloWorld");
    expect(sanitized.length).toBeLessThanOrEqual(10);
    expect(sanitized.includes("\0")).toBe(false);

    // Handles non-string input safely
    expect(sanitizeInputString(null)).toBe("");
    expect(sanitizeInputString(undefined)).toBe("");
    expect(sanitizeInputString(12345 as any)).toBe("");
  });

  it("validates base64 image data and strips data URL prefixes", () => {
    const validDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/";
    const check1 = validateBase64Image(validDataUrl);
    expect(check1.valid).toBe(true);
    expect(check1.cleanBase64).toBe("/9j/4AAQSkZJRgABAQEASABIAAD/");

    // Rejects invalid characters
    const invalidData = "data:image/jpeg;base64,not-valid-base64-!@#$%^&*()";
    const check2 = validateBase64Image(invalidData);
    expect(check2.valid).toBe(false);
    expect(check2.error).toContain("invalid base64");

    // Rejects empty or missing data
    expect(validateBase64Image("").valid).toBe(false);
  });
});

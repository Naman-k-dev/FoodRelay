import { NextRequest, NextResponse } from "next/server";
import { IntakeRequestSchema } from "@/lib/schemas/intake";
import { extractDonationDetails } from "@/lib/ai/geminiExtractor";

// Simple in-memory rate-limiter for basic abuse throttling (sliding window)
// Note: Documented clearly that in-memory maps do not persist across multiple serverless lambdas.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Client IP for basic throttling
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a minute before submitting another AI extraction request.",
        },
        { status: 429 }
      );
    }

    // 2. Parse request payload
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    // 3. Schema validation with Zod
    const parsed = IntakeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const { message } = parsed.data;

    // 4. Run AI extraction
    const result = await extractDonationDetails(message);

    return NextResponse.json({
      success: true,
      data: result.draft,
      meta: {
        source: result.source,
        executionTimeMs: result.executionTimeMs,
        warnings: result.warnings || [],
      },
    });
  } catch (error: any) {
    console.error("Internal error in /api/intake:", error?.message || error);
    return NextResponse.json(
      {
        error: "Failed to process donation intake",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

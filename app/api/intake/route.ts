import { NextRequest, NextResponse } from "next/server";
import { IntakeRequestSchema } from "@/lib/schemas/intake";
import { extractDonationDetails } from "@/lib/ai/geminiExtractor";
import {
  getClientIp,
  checkRateLimit,
  enforceMaxPayload,
  sanitizeInputString,
} from "@/lib/security/requestGuard";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce payload size limit (max 64KB for text intake)
    const payloadCheck = enforceMaxPayload(req, 64 * 1024);
    if (!payloadCheck.ok) {
      return NextResponse.json(
        { error: payloadCheck.error },
        { status: payloadCheck.status || 413 }
      );
    }

    // 2. Client IP rate-limiting (max 20 requests/minute)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, "intake", 20, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a minute before submitting another AI extraction request.",
        },
        { status: 429 }
      );
    }

    // 3. Parse request payload
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    // Sanitize message before schema parsing
    if (body && typeof body.message === "string") {
      body.message = sanitizeInputString(body.message, 2000);
    }

    // 4. Schema validation with Zod
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

    // 5. Run AI extraction
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

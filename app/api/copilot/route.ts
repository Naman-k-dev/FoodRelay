import { NextRequest, NextResponse } from "next/server";
import { executeGeminiRequest } from "@/lib/ai/geminiClient";
import { CopilotResultSchema, CopilotResult } from "@/lib/schemas/copilot";
import {
  getClientIp,
  checkRateLimit,
  enforceMaxPayload,
  sanitizeInputString,
} from "@/lib/security/requestGuard";

const COPILOT_SYSTEM_PROMPT = `You are Relay Copilot, an AI operations coordinator for FoodRelay AI surplus food redistribution platform.
You are strictly an operational assistant grounded in the provided application records.
RULES:
1. Answer the coordinator's question using ONLY the provided application records.
2. When referencing specific donations, recipients, or allocations, cite their exact IDs (e.g. don-001, rec-002, alloc-003) so the UI can create clickable links.
3. If an answer cannot be determined from the records, state that clearly. Do NOT invent records, phone numbers, or allocations.
4. Keep answers concise, factual, and actionable.
5. All coordinator actions require explicit human confirmation. You cannot directly modify records.
Return ONLY valid JSON matching the schema.`;

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce payload size limit (max 256KB)
    const payloadCheck = enforceMaxPayload(req, 256 * 1024);
    if (!payloadCheck.ok) {
      return NextResponse.json(
        { error: payloadCheck.error },
        { status: payloadCheck.status || 413 }
      );
    }

    // 2. Rate limiting (max 25 queries/min per IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, "copilot", 25, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Copilot query rate limit exceeded. Please wait a minute." },
        { status: 429 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { question, context } = body || {};

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "A question string is required." },
        { status: 400 }
      );
    }

    const sanitizedQuestion = sanitizeInputString(question, 2000);
    if (sanitizedQuestion.length < 2) {
      return NextResponse.json(
        { error: "Question must be at least 2 characters long." },
        { status: 400 }
      );
    }

    // Bound context records to prevent context window explosion or DoS
    const boundedContext = {
      donations: Array.isArray(context?.donations) ? context.donations.slice(0, 40) : [],
      recipients: Array.isArray(context?.recipients) ? context.recipients.slice(0, 40) : [],
      allocations: Array.isArray(context?.allocations) ? context.allocations.slice(0, 40) : [],
    };

    const prompt = `User Question: "${sanitizedQuestion}"

Current Grounded Application Records:
${JSON.stringify(boundedContext, null, 2)}

Respond ONLY with a JSON object matching this schema:
{
  "summary": "string",
  "answer": "string",
  "referencedRecordIds": ["string"],
  "actionableSuggestions": ["string"],
  "limitations": ["string"]
}`;

    try {
      const result = await executeGeminiRequest({
        systemInstruction: COPILOT_SYSTEM_PROMPT,
        prompt,
      });

      const cleaned = result.text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const parsed = JSON.parse(cleaned);
      const validated = CopilotResultSchema.parse(parsed);

      return NextResponse.json({
        success: true,
        data: validated,
        meta: {
          source: result.model,
          executionTimeMs: result.executionTimeMs,
        },
      });
    } catch (aiErr: any) {
      // Deterministic Copilot Fallback
      const donations = boundedContext.donations;
      const urgentDonations = donations.filter(
        (d: any) =>
          d.safetyReviewStatus === "awaiting_human_review" ||
          d.safetyReviewStatus === "incomplete_info"
      );

      const fallbackData: CopilotResult = {
        summary: `Found ${donations.length} total donations; ${urgentDonations.length} awaiting human review.`,
        answer:
          urgentDonations.length > 0
            ? `There are currently ${urgentDonations.length} donation batch(es) awaiting safety inspection before they can be matched. Review ${urgentDonations.map((d: any) => d.id).join(", ")} in the Donations queue.`
            : "All recorded donations have passed safety review or are currently allocated. You can proceed with dispatch coordination.",
        referencedRecordIds: urgentDonations.map((d: any) => d.id),
        actionableSuggestions: [
          "Inspect urgent queue items for packaging integrity.",
          "Check Dispatch board for confirmed deliveries.",
        ],
        limitations: [
          "Operating in offline deterministic mode; loaded record summary from local state.",
        ],
      };

      return NextResponse.json({
        success: true,
        data: fallbackData,
        meta: {
          source: "offline_fallback_copilot",
          executionTimeMs: 30,
          warning: aiErr.message,
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process copilot query." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { executeGeminiRequest } from "@/lib/ai/geminiClient";
import { SmartReviewResultSchema, SmartReviewResult } from "@/lib/schemas/review";
import {
  getClientIp,
  checkRateLimit,
  enforceMaxPayload,
} from "@/lib/security/requestGuard";

const REVIEW_SYSTEM_PROMPT = `You are FoodRelay's AI Smart Review auditor.
Inspect the submitted surplus food donation draft for completeness, data consistency, and alignment with Indian FSSAI surplus food guidelines.
RULES:
1. Identify missing details, contradictory timestamps (e.g. preparedAt in future or useBy before pickupWindowEnd), and vague handling information.
2. The AI must NOT approve donations, override safety restrictions, or certify edible quality.
3. Classify findings into:
   - "blocker": Critical data issues preventing safe matching (e.g. expired useBy, loose packaging).
   - "warning": Ambiguities that coordinator should verify (e.g. unconfirmed dairy allergen, unspecified temp).
   - "info": Help text or suggested clarification.
Return ONLY valid JSON matching the schema.`;

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce payload size limit (max 128KB)
    const payloadCheck = enforceMaxPayload(req, 128 * 1024);
    if (!payloadCheck.ok) {
      return NextResponse.json(
        { error: payloadCheck.error },
        { status: payloadCheck.status || 413 }
      );
    }

    // 2. Rate limiting (max 25 requests/min per IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, "review", 25, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Review audit rate limit exceeded. Please wait a minute." },
        { status: 429 }
      );
    }

    let draft: any;
    try {
      draft = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
      return NextResponse.json(
        { error: "Draft object is required for review." },
        { status: 400 }
      );
    }

    const prompt = `Review this surplus food donation draft:
${JSON.stringify(draft, null, 2)}

Respond ONLY with a JSON object matching this schema:
{
  "overallStatus": "needs_attention" | "ready_for_review" | "critical_inconsistency",
  "findings": [
    {
      "severity": "blocker" | "warning" | "info",
      "fieldName": "string",
      "title": "string",
      "description": "string",
      "evidence": "string",
      "suggestedAction": "string"
    }
  ],
  "suggestedQuestions": ["string"],
  "disclaimer": "string"
}`;

    try {
      const result = await executeGeminiRequest({
        systemInstruction: REVIEW_SYSTEM_PROMPT,
        prompt,
      });

      const cleaned = result.text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const parsed = JSON.parse(cleaned);
      const validated = SmartReviewResultSchema.parse(parsed);

      return NextResponse.json({
        success: true,
        data: validated,
        meta: {
          source: result.model,
          executionTimeMs: result.executionTimeMs,
        },
      });
    } catch (aiErr: any) {
      // Deterministic rule-based Smart Review fallback
      const findings = [];
      if (!draft.handlingInformation || String(draft.handlingInformation).length < 10) {
        findings.push({
          severity: "warning" as const,
          fieldName: "handlingInformation",
          title: "Vague Handling Instructions",
          description: "Thermal instructions should specify temperature range (e.g. > 60°C).",
          evidence: String(draft.handlingInformation || "None"),
          suggestedAction: "Specify temperature maintenance protocol during transit.",
        });
      }
      if (draft.unit && draft.unit !== "portions") {
        findings.push({
          severity: "blocker" as const,
          fieldName: "unit",
          title: "Non-Portion Unit",
          description: `Unit is '${draft.unit}'. RelayMatch requires confirmed portion counts.`,
          evidence: String(draft.unit || "unknown"),
          suggestedAction: "Confirm portion conversion before submitting.",
        });
      }

      const fallbackData: SmartReviewResult = {
        overallStatus: findings.some((f) => f.severity === "blocker")
          ? "critical_inconsistency"
          : "needs_attention",
        findings,
        suggestedQuestions: [
          "Can the donor provide written confirmation of cooking time?",
          "Are insulated thermal cambro carriers available for transport?",
        ],
        disclaimer:
          "AI Smart Review identifies data ambiguities and potential regulatory gaps. It does NOT certify edible quality or approve food safety.",
      };

      return NextResponse.json({
        success: true,
        data: fallbackData,
        meta: {
          source: "offline_fallback_review",
          executionTimeMs: 40,
          warning: aiErr.message,
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute smart review." },
      { status: 500 }
    );
  }
}

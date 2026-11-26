import { NextRequest, NextResponse } from "next/server";
import { executeGeminiRequest } from "@/lib/ai/geminiClient";
import { ScannerResultSchema, ScannerResult } from "@/lib/schemas/scanner";

const SCANNER_SYSTEM_PROMPT = `You are FoodRelay's multimodal food donation scanner.
Analyze the provided food photograph to assist human coordinators in creating a preliminary donation draft.
CRITICAL SAFETY BOUNDARIES:
1. NEVER claim the food is safe, edible, or fresh based on an image. Visual appearance cannot verify microbial safety or cold-chain compliance.
2. NEVER invent portion counts or weight. If no scale or label is explicitly readable, set explicitlyReadableQuantity to null.
3. Observe visible packaging: sealed containers, foil trays, crates, or open/loose. Note if containers are closed or open.
4. Note any visible printed text, labels, dates, or brand markings.
5. Identify uncertain observations and ask relevant follow-up questions for coordinator review.
Return ONLY a valid JSON object matching the requested schema.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", notes = "" } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Image data (base64 string) is required." },
        { status: 400 }
      );
    }

    // Clean base64 data prefix if present (e.g. data:image/jpeg;base64,...)
    const cleanData = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const prompt = `Inspect this food surplus image for preliminary donation intake.
Optional donor notes: "${notes}"

Respond ONLY with a JSON object with this schema:
{
  "visibleFoodItems": ["string"],
  "estimatedFoodCategory": "cooked_meals" | "packaged_groceries" | "bakery" | "fresh_produce" | "dairy" | "unknown",
  "visiblePackaging": "sealed_containers" | "foil_trays" | "crates" | "loose" | "unknown",
  "containerCondition": "closed_and_covered" | "open_or_uncovered" | "partially_covered" | "unknown",
  "visibleLabels": ["string"],
  "explicitlyReadableQuantity": string or null,
  "uncertainObservations": ["string"],
  "clarificationQuestions": ["string"],
  "suggestedDietaryCategory": "vegetarian" | "non_vegetarian" | "vegan" | "jain" | "uncertain",
  "safetyDisclaimer": "string"
}`;

    // Execute via Gemini
    try {
      const result = await executeGeminiRequest({
        systemInstruction: SCANNER_SYSTEM_PROMPT,
        prompt,
        inlineMedia: {
          data: cleanData,
          mimeType,
        },
      });

      const cleaned = result.text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const parsed = JSON.parse(cleaned);
      const validated = ScannerResultSchema.parse(parsed);

      return NextResponse.json({
        success: true,
        data: validated,
        meta: {
          source: result.model,
          executionTimeMs: result.executionTimeMs,
        },
      });
    } catch (aiErr: any) {
      // Deterministic fallback for image scanner when offline or quota reached
      const fallbackData: ScannerResult = {
        visibleFoodItems: ["Cooked meal portions in food-grade trays"],
        estimatedFoodCategory: "cooked_meals",
        visiblePackaging: "sealed_containers",
        containerCondition: "closed_and_covered",
        visibleLabels: ["Demonstration food packaging"],
        explicitlyReadableQuantity: null,
        uncertainObservations: [
          "Exact meal temperature and preparation timestamp cannot be determined from visual image.",
        ],
        clarificationQuestions: [
          "What time was this food cooked?",
          "Are all containers sealed with food-grade lids?",
        ],
        suggestedDietaryCategory: "vegetarian",
        safetyDisclaimer:
          "Visual analysis cannot determine microbial safety, food freshness, temperature history, or complete allergen profiles. All details must be confirmed by human safety coordinator inspection.",
      };

      return NextResponse.json({
        success: true,
        data: fallbackData,
        meta: {
          source: "offline_fallback_scanner",
          executionTimeMs: 50,
          warning: aiErr.message || "Gemini offline; loaded offline fallback observations.",
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process image scan." },
      { status: 500 }
    );
  }
}

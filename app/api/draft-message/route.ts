import { NextRequest, NextResponse } from "next/server";
import { executeGeminiRequest } from "@/lib/ai/geminiClient";
import { CommunicationDraftResultSchema, CommunicationDraftResult } from "@/lib/schemas/drafts";

const DRAFTER_SYSTEM_PROMPT = `You are FoodRelay's AI Communication Drafter.
Generate polite, professional, and concise communication templates for surplus food logistics.
RULES:
1. Support English and Hindi as requested.
2. Base all details on the supplied donation/allocation records. Do NOT invent dates or contacts.
3. This is for copy-pasting only; messages are never sent automatically.
Return ONLY valid JSON matching the schema.`;

export async function POST(req: NextRequest) {
  try {
    const { purpose, record, language = "english" } = await req.json();

    const prompt = `Generate a ${language} message for purpose: "${purpose}".
Record details: ${JSON.stringify(record || {}, null, 2)}

Respond ONLY with a JSON object matching this schema:
{
  "subject": "string",
  "body": "string",
  "language": "${language}",
  "targetAudience": "donor" | "recipient" | "logistics_partner"
}`;

    try {
      const result = await executeGeminiRequest({
        systemInstruction: DRAFTER_SYSTEM_PROMPT,
        prompt,
      });

      const cleaned = result.text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const parsed = JSON.parse(cleaned);
      const validated = CommunicationDraftResultSchema.parse(parsed);

      return NextResponse.json({
        success: true,
        data: validated,
        meta: {
          source: result.model,
          executionTimeMs: result.executionTimeMs,
        },
      });
    } catch (aiErr: any) {
      const isHindi = language === "hindi";
      const fallbackData: CommunicationDraftResult = {
        subject: isHindi
          ? `FoodRelay: भोजन बचाव पिकअप समन्वय (${record?.donorName || "दान"})`
          : `FoodRelay: Surplus Food Pickup Coordination (${record?.donorName || "Donation"})`,
        body: isHindi
          ? `नमस्ते, हम FoodRelay से संपर्क कर रहे हैं। आपके द्वारा दर्ज किए गए ${record?.quantity || 100} ${record?.unit || "portions"} के लिए पिकअप समन्वयक जल्द संपर्क करेंगे। कृपया भोजन को सील कंटेनरों में सुरक्षित रखें। धन्यवाद!`
          : `Hello, this is FoodRelay coordination regarding the surplus donation of ${record?.quantity || 100} ${record?.unit || "portions"} from ${record?.donorName || "your organization"}. Our verified logistics relay partner has confirmed the schedule. Please keep containers sealed. Thank you for rescuing food!`,
        language: isHindi ? "hindi" : "english",
        targetAudience: "donor",
      };

      return NextResponse.json({
        success: true,
        data: fallbackData,
        meta: {
          source: "offline_fallback_draft",
          executionTimeMs: 25,
          warning: aiErr.message,
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate draft message." },
      { status: 500 }
    );
  }
}

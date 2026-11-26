import { describe, it, expect } from "vitest";
import { extractWithFallbackHeuristics } from "@/lib/ai/fallbackExtractor";
import { ExtractedDraftSchema } from "@/lib/schemas/intake";

describe("Multilingual Intake Extractor & Zod Schema Validation", () => {
  it("extracts quantities, location, and packaging from English canteen message", () => {
    const message =
      "We have 120 extra vegetarian meal portions from our college canteen in Sector 62, Noida. Prepared at 12 PM and packed in sealed containers. Pickup is available until 2 PM.";

    const draft = extractWithFallbackHeuristics(message);
    expect(draft.quantity).toBe(120);
    expect(draft.quantityUnit).toBe("portions");
    expect(draft.dietaryCategory).toBe("vegetarian");
    expect(draft.packagingCondition).toBe("sealed_containers");
    expect(draft.pickupLocation).toContain("Sector 62");

    // Must validate successfully with ExtractedDraftSchema
    const validated = ExtractedDraftSchema.parse(draft);
    expect(validated.quantity).toBe(120);
  });

  it("extracts quantities and dietary info from Hinglish wedding banquet message", () => {
    const message =
      "Humare wedding banquet hall Sector 63 Noida mein 80 portions paneer sabzi, dal makhani aur roti bachi hai. Sab clean foil trays mein packed hai aur 3:30 PM tak pickup ho sakti hai.";

    const draft = extractWithFallbackHeuristics(message);
    expect(draft.quantity).toBe(80);
    expect(draft.dietaryCategory).toBe("vegetarian");
    expect(draft.packagingCondition).toBe("foil_trays");
    expect(draft.allergens).toContain("dairy");
  });

  it("flags ambiguous quantity units if donor inputs 'kg' instead of meal portions", () => {
    const message = "We have 40 kg of leftover dal and rice from lunch mess in Sector 18.";
    const draft = extractWithFallbackHeuristics(message);
    expect(draft.quantity).toBe(40);
    expect(draft.quantityUnit).toBe("kg");
    expect(draft.ambiguousFields).toContain("quantityUnit");
    expect(draft.followUpQuestions[0]).toContain("How many meal portions does this represent");
  });
});

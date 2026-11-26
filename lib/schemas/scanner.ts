import { z } from "zod";

export const ScannerResultSchema = z.object({
  visibleFoodItems: z.array(z.string()).default([]),
  estimatedFoodCategory: z.enum([
    "cooked_meals",
    "packaged_groceries",
    "bakery",
    "fresh_produce",
    "dairy",
    "unknown",
  ]).default("unknown"),
  visiblePackaging: z.enum([
    "sealed_containers",
    "foil_trays",
    "crates",
    "loose",
    "unknown",
  ]).default("unknown"),
  containerCondition: z.enum([
    "closed_and_covered",
    "open_or_uncovered",
    "partially_covered",
    "unknown",
  ]).default("unknown"),
  visibleLabels: z.array(z.string()).default([]),
  explicitlyReadableQuantity: z.string().nullable().optional(),
  uncertainObservations: z.array(z.string()).default([]),
  clarificationQuestions: z.array(z.string()).default([]),
  suggestedDietaryCategory: z.enum([
    "vegetarian",
    "non_vegetarian",
    "vegan",
    "jain",
    "uncertain",
  ]).default("uncertain"),
  safetyDisclaimer: z.string().default(
    "Visual analysis cannot determine microbial safety, food freshness, temperature abuse, or complete allergen profiles. All details must be confirmed by human safety coordinator inspection."
  ),
});

export type ScannerResult = z.infer<typeof ScannerResultSchema>;

import { z } from "zod";

export const SmartReviewFindingSchema = z.object({
  severity: z.enum(["blocker", "warning", "info"]),
  fieldName: z.string(),
  title: z.string(),
  description: z.string(),
  evidence: z.string().default(""),
  suggestedAction: z.string(),
});

export const SmartReviewResultSchema = z.object({
  overallStatus: z.enum(["needs_attention", "ready_for_review", "critical_inconsistency"]),
  findings: z.array(SmartReviewFindingSchema).default([]),
  suggestedQuestions: z.array(z.string()).default([]),
  disclaimer: z.string().default(
    "AI Smart Review identifies data ambiguities and potential regulatory gaps. It does NOT certify edible quality or approve food safety."
  ),
});

export type SmartReviewResult = z.infer<typeof SmartReviewResultSchema>;
export type SmartReviewFinding = z.infer<typeof SmartReviewFindingSchema>;

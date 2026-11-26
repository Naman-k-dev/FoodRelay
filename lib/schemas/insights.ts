import { z } from "zod";

export const ImpactInsightsResultSchema = z.object({
  executiveSummary: z.string(),
  demandPatterns: z.array(z.string()).default([]),
  bottlenecksIdentified: z.array(z.string()).default([]),
  actionableRecommendations: z.array(z.string()).default([]),
  dataGroundedEvidence: z.array(z.string()).default([]),
  disclaimer: z.string().default(
    "These observations are derived from current simulated prototype records to illustrate how AI explains logistical patterns."
  ),
});

export type ImpactInsightsResult = z.infer<typeof ImpactInsightsResultSchema>;

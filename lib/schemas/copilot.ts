import { z } from "zod";

export const CopilotResultSchema = z.object({
  summary: z.string(),
  answer: z.string(),
  referencedRecordIds: z.array(z.string()).default([]),
  actionableSuggestions: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
});

export type CopilotResult = z.infer<typeof CopilotResultSchema>;

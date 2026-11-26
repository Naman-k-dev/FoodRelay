import { z } from "zod";

export const CommunicationDraftResultSchema = z.object({
  subject: z.string(),
  body: z.string(),
  language: z.enum(["english", "hindi"]).default("english"),
  targetAudience: z.enum(["donor", "recipient", "logistics_partner"]),
});

export type CommunicationDraftResult = z.infer<typeof CommunicationDraftResultSchema>;

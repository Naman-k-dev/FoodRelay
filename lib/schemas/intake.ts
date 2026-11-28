import { z } from "zod";

export const IntakeRequestSchema = z.object({
  message: z
    .string()
    .min(5, "Donation text must be at least 5 characters")
    .max(2000, "Donation message exceeds 2000 characters limit"),
});

export const ExtractedDraftSchema = z.object({
  donorOrganization: z.string().nullable().optional(),
  donorType: z.string().nullable().optional(),
  foodDescription: z.string().nullable().optional(),
  foodCategory: z.string().nullable().optional(),
  dietaryCategory: z.string().nullable().optional(),
  quantity: z.number().nullable().optional(),
  quantityUnit: z.string().nullable().optional(),
  preparationTime: z.string().nullable().optional(),
  pickupLocation: z.string().nullable().optional(),
  pickupWindowStart: z.string().nullable().optional(),
  pickupWindowEnd: z.string().nullable().optional(),
  useByTime: z.string().nullable().optional(),
  storageMethod: z.string().nullable().optional(),
  packagingCondition: z.string().nullable().optional(),
  allergens: z.array(z.string()).default([]),
  handlingInformation: z.string().nullable().optional(),
  sourceRegistration: z.string().nullable().optional(),
  missingFields: z.array(z.string()).default([]),
  ambiguousFields: z.array(z.string()).default([]),
  followUpQuestions: z.array(z.string()).default([]),
  evidence: z.record(z.string()).default({}),
  foodItems: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
  })).optional().default([]),
  isFoodRelated: z.boolean().optional().default(true),
  unrelatedExplanation: z.string().nullable().optional(),
});

export type ExtractedDraft = z.infer<typeof ExtractedDraftSchema>;

import { z } from "zod";

export const RecipientSchema = z.object({
  id: z.string().optional(),
  organizationName: z.string().min(3, "Organization name required"),
  organizationType: z.enum(['shelter', 'ngo', 'community_kitchen', 'orphanage', 'elderly_care']),
  contactPerson: z.string().min(2, "Contact person required"),
  phone: z.string().min(8, "Phone required"),
  location: z.string().min(3, "Location required"),
  latitude: z.number(),
  longitude: z.number(),
  requestedMealPortions: z.number().positive(),
  remainingDemand: z.number().nonnegative(),
  receivingCapacity: z.number().positive(),
  availableCapacity: z.number().nonnegative(),
  urgencyLevel: z.enum(['critical', 'high', 'moderate', 'low']),
  acceptedDietaryCategories: z.array(z.enum(['vegetarian', 'non_vegetarian', 'vegan', 'jain'])).min(1),
  allergenRestrictions: z.array(z.string()).default([]),
  storageCapabilities: z.array(z.enum(['ambient', 'refrigerated', 'heated', 'frozen'])).min(1),
  transportAvailability: z.enum(['self_pickup', 'delivery_only', 'flexible']),
  receivingWindowStart: z.string(),
  receivingWindowEnd: z.string(),
  verificationStatus: z.enum(['verified_ngo', 'simulated_verified', 'pending']).default('simulated_verified'),
  isDemo: z.boolean().default(true),
});

export type RecipientInput = z.infer<typeof RecipientSchema>;

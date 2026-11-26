import { z } from "zod";

export const DonationSchema = z.object({
  id: z.string().optional(),
  donorName: z.string().min(2, "Donor name must be at least 2 characters"),
  donorType: z.enum([
    'restaurant',
    'hostel',
    'wedding_venue',
    'corporate_cafeteria',
    'event_organizer',
    'community'
  ]),
  donorContact: z.string().optional(),
  foodDescription: z.string().min(5, "Food description must be at least 5 characters"),
  foodCategory: z.enum([
    'cooked_meals',
    'packaged_groceries',
    'bakery',
    'fresh_produce',
    'dairy'
  ]),
  dietaryCategory: z.enum([
    'vegetarian',
    'non_vegetarian',
    'vegan',
    'jain'
  ]),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit: z.enum(['portions', 'kg', 'liters', 'boxes']),
  remainingQuantity: z.number().nonnegative().optional(),
  pickupLocation: z.string().min(3, "Pickup location is required"),
  latitude: z.number(),
  longitude: z.number(),
  preparedAt: z.string(),
  pickupWindowStart: z.string(),
  pickupWindowEnd: z.string(),
  confirmedUseBy: z.string(),
  storageMethod: z.enum(['ambient', 'refrigerated', 'heated', 'frozen']),
  packagingCondition: z.enum(['sealed_containers', 'foil_trays', 'crates', 'loose']),
  allergenInformation: z.array(z.string()).default([]),
  handlingInformation: z.string().min(3, "Handling information is required"),
  sourceVerificationStatus: z.enum(['verified_license', 'self_declared', 'unverified']),
  safetyReviewStatus: z.enum([
    'incomplete_info',
    'awaiting_human_review',
    'eligible_for_matching',
    'held',
    'expired',
    'rejected'
  ]),
  safetyReviewNotes: z.string().default(""),
  isDemo: z.boolean().default(false),
});

export type DonationInput = z.infer<typeof DonationSchema>;

export type DonorType =
  | 'restaurant'
  | 'hostel'
  | 'wedding_venue'
  | 'corporate_cafeteria'
  | 'event_organizer'
  | 'community';

export type FoodCategory =
  | 'cooked_meals'
  | 'packaged_groceries'
  | 'bakery'
  | 'fresh_produce'
  | 'dairy';

export type DietaryCategory =
  | 'vegetarian'
  | 'non_vegetarian'
  | 'vegan'
  | 'jain';

export type QuantityUnit =
  | 'portions'
  | 'kg'
  | 'liters'
  | 'boxes';

export type StorageMethod =
  | 'ambient'
  | 'refrigerated'
  | 'heated'
  | 'frozen';

export type PackagingCondition =
  | 'sealed_containers'
  | 'foil_trays'
  | 'crates'
  | 'loose';

export type SourceVerificationStatus =
  | 'verified_license'
  | 'self_declared'
  | 'unverified';

export type SafetyReviewStatus =
  | 'incomplete_info'
  | 'awaiting_human_review'
  | 'eligible_for_matching'
  | 'held'
  | 'expired'
  | 'rejected';

export type DonationStatus =
  | 'draft'
  | 'awaiting_review'
  | 'available'
  | 'reserved'
  | 'fully_allocated'
  | 'collected'
  | 'delivered'
  | 'cancelled'
  | 'expired';

export interface HistoryEntry {
  id: string;
  timestamp: string; // ISO
  action: string;
  actor: string;
  notes?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  donorType: DonorType;
  donorContact?: string;
  foodDescription: string;
  foodCategory: FoodCategory;
  dietaryCategory: DietaryCategory;
  quantity: number;
  unit: QuantityUnit;
  remainingQuantity: number;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  preparedAt: string; // ISO
  pickupWindowStart: string; // ISO
  pickupWindowEnd: string; // ISO
  confirmedUseBy: string; // ISO
  storageMethod: StorageMethod;
  packagingCondition: PackagingCondition;
  allergenInformation: string[];
  handlingInformation: string;
  sourceVerificationStatus: SourceVerificationStatus;
  safetyReviewStatus: SafetyReviewStatus;
  safetyReviewNotes: string;
  safetyReviewer: string | null;
  safetyReviewedAt: string | null;
  status: DonationStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  isDemo: boolean;
  history: HistoryEntry[];
  aiExtracted?: boolean;
}

export type RecipientType =
  | 'shelter'
  | 'ngo'
  | 'community_kitchen'
  | 'orphanage'
  | 'elderly_care';

export type UrgencyLevel =
  | 'critical'
  | 'high'
  | 'medium'
  | 'moderate'
  | 'low';

export type TransportAvailability =
  | 'self_pickup'
  | 'delivery_only'
  | 'flexible'
  | 'unavailable'
  | 'none';

export type RecipientStatus = 'online' | 'offline' | 'unavailable' | 'active' | 'inactive';

export interface Recipient {
  id: string;
  organizationName: string;
  organizationType: RecipientType;
  contactPerson: string;
  phone: string;
  location: string;
  latitude: number;
  longitude: number;
  requestedMealPortions: number;
  remainingDemand: number;
  receivingCapacity: number;
  availableCapacity: number;
  urgencyLevel: UrgencyLevel;
  acceptedDietaryCategories: DietaryCategory[];
  allergenRestrictions: string[];
  storageCapabilities: StorageMethod[];
  transportAvailability: TransportAvailability;
  receivingWindowStart: string; // ISO
  receivingWindowEnd: string; // ISO
  verificationStatus: 'verified_ngo' | 'simulated_verified' | 'pending';
  isDemo: boolean;
  status?: RecipientStatus;
  isOnline?: boolean;
  transportAvailable?: boolean;
  manualDistanceKm?: number;
  alreadyReservedPortions?: number;
  receivingAvailability?: boolean | 'available' | 'unavailable' | 'offline';
}

export type AllocationStatus =
  | 'proposed'
  | 'reserved'
  | 'accepted'
  | 'ready_for_pickup'
  | 'collected'
  | 'delivered'
  | 'cancelled';

export interface ScoreBreakdown {
  urgencyScore: number;
  proximityScore: number;
  demandFitScore: number;
  readinessScore: number;
  rawWeights: {
    urgency: number;
    proximity: number;
    demand: number;
    readiness: number;
  };
}

export interface Allocation {
  id: string;
  donationId: string;
  recipientId: string;
  allocatedPortions: number;
  distanceKm: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  status: AllocationStatus;
  reasons: string[];
  unresolvedConstraints: string[];
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    status: AllocationStatus;
    timestamp: string;
    note: string;
    actor: string;
  }>;
  handoverReceipt?: {
    receiptNumber: string;
    donorSignature: string;
    recipientSignature: string;
    completedAt: string;
    qrData: string;
  };
}

export interface MatchingWeights {
  urgency: number; // default 40
  proximity: number; // default 30
  demand: number; // default 20
  readiness: number; // default 10
}

export interface MatchCandidate {
  recipient: Recipient;
  eligible: boolean;
  ineligibleReasons: string[];
  distanceKm: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  suggestedPortions: number;
}

export interface MatchResult {
  donationId: string;
  evaluatedAt: string;
  eligibleMatches: MatchCandidate[];
  ineligibleMatches: MatchCandidate[];
  suggestedAllocations: Array<{
    recipientId: string;
    recipientName: string;
    allocatedPortions: number;
    distanceKm: number;
    score: number;
  }>;
  totalDonationPortions: number;
  allocatedPortions: number;
  unallocatedPortions: number;
  notes: string[];
}

export interface ImpactMetrics {
  totalDonatedPortions: number;
  confirmedDeliveredPortions: number;
  currentlyAllocatedPortions: number;
  unallocatedPortions: number;
  outstandingRecipientDemand: number;
  pendingDonationsCount: number;
  cancellationRate: number; // percentage
  deliveredCount: number;
  totalDonationsCount: number;
  activeRecipientsCount: number;
}

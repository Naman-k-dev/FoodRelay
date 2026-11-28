/**
 * FoodRelay AI — Model Context Protocol (MCP) & Graftcode Data Transfer Objects (DTOs)
 * Strict Graftcode compliance:
 * - Simple primitives and strings
 * - Plain DTO objects
 * - Plain arrays T[] only (never Set, Map, or custom iterators)
 * - ISO-8601 formatted strings for timestamps
 */

export interface ShelterStatusDto {
  shelterId: string;
  organizationName: string;
  organizationType: string;
  status: string;
  isOnline: boolean;
  availableCapacity: number;
  remainingDemand: number;
  urgencyLevel: string;
  latitude: number;
  longitude: number;
  storageCapabilities: string[];
  acceptedDietaryCategories: string[];
  receivingWindowEnd: string;
}

export interface DonationInputDto {
  id: string;
  donorName: string;
  donorType: string;
  foodDescription: string;
  foodCategory: string;
  dietaryCategory: string;
  quantity: number;
  unit: string;
  remainingQuantity: number;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  preparedAt: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  confirmedUseBy: string;
  storageMethod: string;
  packagingCondition: string;
  allergenInformation: string[];
  handlingInformation?: string;
  safetyReviewStatus?: string;
  status?: string;
}

export interface MatchingWeightsDto {
  urgency: number;
  proximity: number;
  demand: number;
  readiness: number;
}

export interface AllocationProposalDto {
  recipientId: string;
  recipientName: string;
  allocatedPortions: number;
  score: number;
  distanceKm: number;
  urgencyScore: number;
  proximityScore: number;
  demandScore: number;
  readinessScore: number;
}

export interface IneligibleRecipientDto {
  recipientId: string;
  recipientName: string;
  reasons: string[];
}

export interface MatchEvaluationDto {
  donationId: string;
  evaluatedAt: string;
  totalPortions: number;
  allocatedPortions: number;
  unallocatedPortions: number;
  allocations: AllocationProposalDto[];
  ineligibleRecipients: IneligibleRecipientDto[];
  notes: string[];
}

export interface SafetyEvaluationDto {
  isEligible: boolean;
  status: string;
  blockers: string[];
  warnings: string[];
  regulationReferences: string[];
  summary: string;
}

export interface RedistributionEvaluationDto {
  offlineShelterId: string;
  offlineShelterName: string;
  releasedPortions: number;
  redistributedPortions: number;
  unallocatedSurplus: number;
  updatedAllocations: AllocationProposalDto[];
  message: string;
}

export interface DispatchTransitionDto {
  allocationId: string;
  previousStatus: string;
  currentStatus: string;
  transitionAllowed: boolean;
  updatedAt: string;
  actor: string;
  note: string;
  receiptNumber?: string;
  qrPayload?: string;
}

export interface DispatchVoucherDto {
  voucherId: string;
  receiptNumber: string;
  allocationId: string;
  donationId: string;
  recipientId: string;
  donorName: string;
  recipientName: string;
  portions: number;
  qrPayload: string;
  issuedAt: string;
}

export interface IntakeParsedDto {
  foodDescription: string;
  portions: number;
  foodCategory: string;
  dietaryCategory: string;
  storageMethod: string;
  useByHours: number;
  detectedAllergens: string[];
  summary: string;
}

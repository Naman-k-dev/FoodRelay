import { describe, it, expect } from "vitest";
import { runRelayMatch } from "@/lib/matching/relayMatch";
import { Donation, Recipient, MatchingWeights } from "@/types";

const mockDonation: Donation = {
  id: "don-test-1",
  donorName: "Test Caterer",
  donorType: "restaurant",
  foodDescription: "Vegetarian Thali Meals",
  foodCategory: "cooked_meals",
  dietaryCategory: "vegetarian",
  quantity: 100,
  unit: "portions",
  remainingQuantity: 100,
  pickupLocation: "Sector 62, Noida",
  latitude: 28.628,
  longitude: 77.367,
  preparedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  pickupWindowStart: new Date(Date.now() - 1800 * 1000).toISOString(),
  pickupWindowEnd: new Date(Date.now() + 7200 * 1000).toISOString(),
  confirmedUseBy: new Date(Date.now() + 14400 * 1000).toISOString(),
  storageMethod: "heated",
  packagingCondition: "sealed_containers",
  allergenInformation: ["dairy"],
  handlingInformation: "Keep heated in cambro containers",
  sourceVerificationStatus: "verified_license",
  safetyReviewStatus: "eligible_for_matching",
  safetyReviewNotes: "Verified",
  safetyReviewer: "Coordinator",
  safetyReviewedAt: new Date().toISOString(),
  status: "available",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDemo: true,
  history: [],
};

const mockRecipients: Recipient[] = [
  {
    id: "rec-test-1",
    organizationName: "Shelter A",
    organizationType: "shelter",
    contactPerson: "Alice",
    phone: "9999999999",
    location: "Sector 62, Noida",
    latitude: 28.629,
    longitude: 77.368,
    requestedMealPortions: 60,
    remainingDemand: 60,
    receivingCapacity: 80,
    availableCapacity: 80,
    urgencyLevel: "critical",
    acceptedDietaryCategories: ["vegetarian"],
    allergenRestrictions: [],
    storageCapabilities: ["ambient", "heated"],
    transportAvailability: "self_pickup",
    receivingWindowStart: new Date(Date.now() - 3600 * 1000).toISOString(),
    receivingWindowEnd: new Date(Date.now() + 14400 * 1000).toISOString(),
    verificationStatus: "simulated_verified",
    isDemo: true,
  },
  {
    id: "rec-test-2",
    organizationName: "Shelter B",
    organizationType: "shelter",
    contactPerson: "Bob",
    phone: "8888888888",
    location: "Sector 63, Noida",
    latitude: 28.624,
    longitude: 77.38,
    requestedMealPortions: 60,
    remainingDemand: 60,
    receivingCapacity: 60,
    availableCapacity: 60,
    urgencyLevel: "high",
    acceptedDietaryCategories: ["vegetarian"],
    allergenRestrictions: [],
    storageCapabilities: ["ambient", "heated"],
    transportAvailability: "flexible",
    receivingWindowStart: new Date(Date.now() - 3600 * 1000).toISOString(),
    receivingWindowEnd: new Date(Date.now() + 14400 * 1000).toISOString(),
    verificationStatus: "simulated_verified",
    isDemo: true,
  },
];

describe("RelayMatch Intelligent Allocation Engine", () => {
  it("performs a valid allocation to eligible recipients", () => {
    const result = runRelayMatch(mockDonation, [mockRecipients[0]]);
    expect(result.eligibleMatches.length).toBe(1);
    expect(result.allocatedPortions).toBe(60);
    expect(result.unallocatedPortions).toBe(40);
    expect(result.suggestedAllocations[0].allocatedPortions).toBe(60);
  });

  it("handles split allocations across multiple recipients when donation quantity exceeds single capacity", () => {
    const result = runRelayMatch(mockDonation, mockRecipients);
    expect(result.eligibleMatches.length).toBe(2);
    expect(result.allocatedPortions).toBe(100);
    expect(result.unallocatedPortions).toBe(0);
    expect(result.suggestedAllocations.length).toBe(2);
    expect(result.suggestedAllocations[0].allocatedPortions).toBe(60);
    expect(result.suggestedAllocations[1].allocatedPortions).toBe(40);
  });

  it("handles insufficient recipient capacity gracefully without exceeding available limits", () => {
    const lowCapacityRecipient: Recipient = {
      ...mockRecipients[0],
      remainingDemand: 100,
      availableCapacity: 25, // only 25 capacity
    };

    const result = runRelayMatch(mockDonation, [lowCapacityRecipient]);
    expect(result.allocatedPortions).toBe(25);
    expect(result.unallocatedPortions).toBe(75);
  });

  it("rejects donations with non-portion units from matching", () => {
    const kgDonation: Donation = {
      ...mockDonation,
      unit: "kg",
    };

    const result = runRelayMatch(kgDonation, mockRecipients);
    expect(result.eligibleMatches.length).toBe(0);
    expect(result.allocatedPortions).toBe(0);
    expect(result.notes[0]).toContain("blocked by safety gate");
  });

  it("rejects expired donations", () => {
    const expiredDonation: Donation = {
      ...mockDonation,
      confirmedUseBy: new Date(Date.now() - 1000 * 60).toISOString(), // expired 1 min ago
    };

    const result = runRelayMatch(expiredDonation, mockRecipients);
    expect(result.eligibleMatches.length).toBe(0);
    expect(result.allocatedPortions).toBe(0);
  });

  it("filters out recipients with incompatible dietary requirements", () => {
    const nonVegOnlyRecipient: Recipient = {
      ...mockRecipients[0],
      acceptedDietaryCategories: ["non_vegetarian"], // does not accept veg
    };

    const result = runRelayMatch(mockDonation, [nonVegOnlyRecipient]);
    expect(result.eligibleMatches.length).toBe(0);
    expect(result.ineligibleMatches[0].ineligibleReasons[0]).toContain("Dietary mismatch");
  });

  it("filters out recipients with allergen conflicts", () => {
    const allergenRestrictedRecipient: Recipient = {
      ...mockRecipients[0],
      allergenRestrictions: ["dairy"], // restricts dairy, which is in donation
    };

    const result = runRelayMatch(mockDonation, [allergenRestrictedRecipient]);
    expect(result.eligibleMatches.length).toBe(0);
    expect(result.ineligibleMatches[0].ineligibleReasons[0]).toContain("Allergen conflict");
  });

  it("filters out recipients with closed receiving windows", () => {
    const closedRecipient: Recipient = {
      ...mockRecipients[0],
      receivingWindowEnd: new Date(Date.now() - 1000 * 60).toISOString(), // closed
    };

    const result = runRelayMatch(mockDonation, [closedRecipient]);
    expect(result.eligibleMatches.length).toBe(0);
    expect(result.ineligibleMatches[0].ineligibleReasons[0]).toContain("receiving window has closed");
  });
});

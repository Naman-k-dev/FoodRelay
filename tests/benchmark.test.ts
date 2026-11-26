import { describe, it, expect } from "vitest";
import { runMatchingBenchmark } from "@/lib/matching/benchmark";
import { DEFAULT_WEIGHTS } from "@/lib/matching/relayMatch";
import { Donation, Recipient } from "@/types";

const mockDonation: Donation = {
  id: "don-bm-1",
  donorName: "Grand Noida Hotel",
  donorType: "restaurant",
  foodDescription: "Surplus Fresh Paneer Rice Meals",
  foodCategory: "cooked_meals",
  dietaryCategory: "vegetarian",
  quantity: 120,
  unit: "portions",
  remainingQuantity: 120,
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
  handlingInformation: "Thermal containers",
  sourceVerificationStatus: "verified_license",
  safetyReviewStatus: "eligible_for_matching",
  safetyReviewNotes: "Verified safe",
  safetyReviewer: "Coordinator",
  safetyReviewedAt: new Date().toISOString(),
  status: "available",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDemo: true,
  history: [],
};

const mockRecipients: Recipient[] = [
  // First in array, but low urgency and farther away
  {
    id: "rec-first-low",
    organizationName: "First Arrived Community Center",
    organizationType: "community_kitchen",
    contactPerson: "Ramesh",
    phone: "9810011111",
    location: "Greater Noida (Far)",
    latitude: 28.474,
    longitude: 77.503,
    requestedMealPortions: 100,
    remainingDemand: 100,
    receivingCapacity: 120,
    availableCapacity: 120,
    urgencyLevel: "low",
    acceptedDietaryCategories: ["vegetarian"],
    allergenRestrictions: [],
    storageCapabilities: ["ambient", "heated"],
    transportAvailability: "self_pickup",
    receivingWindowStart: new Date(Date.now() - 3600 * 1000).toISOString(),
    receivingWindowEnd: new Date(Date.now() + 14400 * 1000).toISOString(),
    verificationStatus: "simulated_verified",
    isDemo: true,
  },
  // Second in array, but critical urgency and very close
  {
    id: "rec-second-critical",
    organizationName: "Critical Urgent Shelter",
    organizationType: "shelter",
    contactPerson: "Sunita",
    phone: "9810022222",
    location: "Sector 62, Noida (Close)",
    latitude: 28.629,
    longitude: 77.368,
    requestedMealPortions: 80,
    remainingDemand: 80,
    receivingCapacity: 80,
    availableCapacity: 80,
    urgencyLevel: "critical",
    acceptedDietaryCategories: ["vegetarian"],
    allergenRestrictions: [],
    storageCapabilities: ["heated"],
    transportAvailability: "self_pickup",
    receivingWindowStart: new Date(Date.now() - 3600 * 1000).toISOString(),
    receivingWindowEnd: new Date(Date.now() + 14400 * 1000).toISOString(),
    verificationStatus: "simulated_verified",
    isDemo: true,
  },
  // Ineligible recipient (allergen restriction blocks it)
  {
    id: "rec-ineligible",
    organizationName: "Dairy-Free Shelter",
    organizationType: "shelter",
    contactPerson: "Kavita",
    phone: "9810033333",
    location: "Sector 18, Noida",
    latitude: 28.57,
    longitude: 77.32,
    requestedMealPortions: 50,
    remainingDemand: 50,
    receivingCapacity: 50,
    availableCapacity: 50,
    urgencyLevel: "critical",
    acceptedDietaryCategories: ["vegetarian"],
    allergenRestrictions: ["dairy"], // Conflict with donation
    storageCapabilities: ["heated"],
    transportAvailability: "self_pickup",
    receivingWindowStart: new Date(Date.now() - 3600 * 1000).toISOString(),
    receivingWindowEnd: new Date(Date.now() + 14400 * 1000).toISOString(),
    verificationStatus: "simulated_verified",
    isDemo: true,
  },
];

describe("RelayMatch vs. FCFS Matching Benchmark", () => {
  it("should execute benchmark comparison and return complete structured metrics", () => {
    const benchmark = runMatchingBenchmark(mockDonation, mockRecipients, DEFAULT_WEIGHTS, new Date());

    expect(benchmark).toBeDefined();
    expect(benchmark.relayMatch).toBeDefined();
    expect(benchmark.fcfsBaseline).toBeDefined();
    expect(benchmark.keyDifferences).toBeDefined();
    expect(benchmark.verdictNarrative).toBeTruthy();
  });

  it("should show RelayMatch prioritizes critical urgency over naive registration order", () => {
    const benchmark = runMatchingBenchmark(mockDonation, mockRecipients, DEFAULT_WEIGHTS, new Date());

    // RelayMatch should serve Critical Urgent Shelter with 80 portions
    const relayCriticalAlloc = benchmark.relayMatch.allocations.find(
      (a) => a.recipientId === "rec-second-critical"
    );
    expect(relayCriticalAlloc).toBeDefined();
    expect(relayCriticalAlloc?.allocatedPortions).toBe(80);

    // FCFS served rec-first-low first with 100 portions because it was first in registration order
    const fcfsFirstAlloc = benchmark.fcfsBaseline.allocations.find(
      (a) => a.recipientId === "rec-first-low"
    );
    expect(fcfsFirstAlloc).toBeDefined();
    expect(fcfsFirstAlloc?.allocatedPortions).toBe(100);

    // RelayMatch allocates more critical portions than FCFS
    expect(benchmark.relayMatch.urgencyBreakdown.criticalPortions).toBeGreaterThan(
      benchmark.fcfsBaseline.urgencyBreakdown.criticalPortions
    );
  });

  it("should strictly respect hard constraints (allergen restrictions) in both engines", () => {
    const benchmark = runMatchingBenchmark(mockDonation, mockRecipients, DEFAULT_WEIGHTS, new Date());

    // Neither strategy should allocate to rec-ineligible
    expect(
      benchmark.relayMatch.allocations.some((a) => a.recipientId === "rec-ineligible")
    ).toBe(false);

    expect(
      benchmark.fcfsBaseline.allocations.some((a) => a.recipientId === "rec-ineligible")
    ).toBe(false);
  });

  it("should preserve total allocated portions within available donation quantity", () => {
    const benchmark = runMatchingBenchmark(mockDonation, mockRecipients, DEFAULT_WEIGHTS, new Date());

    expect(benchmark.relayMatch.totalAllocated).toBeLessThanOrEqual(mockDonation.remainingQuantity);
    expect(benchmark.fcfsBaseline.totalAllocated).toBeLessThanOrEqual(mockDonation.remainingQuantity);
  });
});

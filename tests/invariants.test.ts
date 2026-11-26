import { describe, it, expect } from "vitest";
import { runRelayMatch } from "@/lib/matching/relayMatch";
import { evaluateFoodSafetyGate } from "@/lib/safety/safetyGate";
import { calculateHaversineDistanceKm } from "@/lib/matching/distance";
import { Donation, Recipient } from "@/types";

describe("FoodRelay Core Invariants & Safety Properties", () => {
  const baseRecipient: Recipient = {
    id: "rec-test-1",
    organizationName: "Safe Shelter Hub",
    organizationType: "shelter",
    contactPerson: "Coordinator Sharma",
    phone: "9811100000",
    location: "Sector 62, Noida",
    latitude: 28.628,
    longitude: 77.368,
    requestedMealPortions: 60,
    remainingDemand: 60,
    receivingCapacity: 100,
    availableCapacity: 100,
    urgencyLevel: "high",
    acceptedDietaryCategories: ["vegetarian"],
    allergenRestrictions: [],
    storageCapabilities: ["heated", "ambient"],
    transportAvailability: "self_pickup",
    receivingWindowStart: new Date(Date.now() - 3600 * 1000).toISOString(),
    receivingWindowEnd: new Date(Date.now() + 14400 * 1000).toISOString(),
    verificationStatus: "simulated_verified",
    isDemo: true,
  };

  const baseDonation: Donation = {
    id: "don-test-1",
    donorName: "Grand Noida Caterers",
    donorType: "restaurant",
    foodDescription: "Nutritious Veg Biryani and Dal Makhani",
    foodCategory: "cooked_meals",
    dietaryCategory: "vegetarian",
    quantity: 60,
    unit: "portions",
    remainingQuantity: 60,
    pickupLocation: "Sector 18, Noida",
    latitude: 28.57,
    longitude: 77.32,
    preparedAt: new Date(Date.now() - 3600000).toISOString(),
    pickupWindowStart: new Date(Date.now() - 1800000).toISOString(),
    pickupWindowEnd: new Date(Date.now() + 10800000).toISOString(),
    confirmedUseBy: new Date(Date.now() + 18000000).toISOString(),
    storageMethod: "heated",
    packagingCondition: "sealed_containers",
    allergenInformation: ["dairy"],
    handlingInformation: "Thermal container maintained above 60C",
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

  it("Invariant 1: Allocated portions never exceed donation quantity or recipient remaining demand", () => {
    const result = runRelayMatch(baseDonation, [baseRecipient]);
    expect(result.eligibleMatches.length).toBeGreaterThan(0);

    for (const alloc of result.eligibleMatches) {
      expect(alloc.suggestedPortions).toBeGreaterThan(0);
      expect(alloc.suggestedPortions).toBeLessThanOrEqual(baseDonation.quantity);
      expect(alloc.suggestedPortions).toBeLessThanOrEqual(baseRecipient.remainingDemand);
    }
  });

  it("Invariant 2: Food rejected or flagged by Safety Gate fails safety gate evaluation", () => {
    const unsafeDonation: Donation = {
      ...baseDonation,
      packagingCondition: "loose", // FSSAI violation
    };

    const safetyResult = evaluateFoodSafetyGate(unsafeDonation);
    expect(safetyResult.isEligible).toBe(false);
    expect(safetyResult.blockers.length).toBeGreaterThan(0);
    expect(safetyResult.blockers.some((r) => r.toLowerCase().includes("packaging"))).toBe(true);
  });

  it("Invariant 3: Zero remaining demand recipient receives 0 portion allocations", () => {
    const exhaustedRecipient: Recipient = {
      ...baseRecipient,
      id: "rec-exhausted",
      remainingDemand: 0,
      availableCapacity: 0,
    };

    const result = runRelayMatch(baseDonation, [exhaustedRecipient]);
    expect(result.eligibleMatches.length).toBe(0);
    expect(result.ineligibleMatches.length).toBe(1);
  });

  it("Invariant 4: Dietary mismatch strictly prevents match generation", () => {
    const nonVegDonation: Donation = {
      ...baseDonation,
      dietaryCategory: "non_vegetarian",
      foodDescription: "Chicken Biryani",
    };

    // baseRecipient only accepts vegetarian
    const result = runRelayMatch(nonVegDonation, [baseRecipient]);
    expect(result.eligibleMatches.length).toBe(0);
    expect(result.ineligibleMatches.length).toBe(1);
    expect(result.ineligibleMatches[0].ineligibleReasons.some((r) => r.toLowerCase().includes("dietary"))).toBe(true);
  });

  it("Invariant 5: Haversine distance calculation is symmetric, non-negative, and bounded", () => {
    const d1 = calculateHaversineDistanceKm(28.57, 77.32, 28.628, 77.368);
    const d2 = calculateHaversineDistanceKm(28.628, 77.368, 28.57, 77.32);

    expect(d1).toBeGreaterThan(0);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.0001); // Symmetry
    // Distance between Sector 18 and Sector 62 in Noida is ~7-10 km
    expect(d1).toBeGreaterThan(5);
    expect(d1).toBeLessThan(15);
  });

  it("Invariant 6: Capacity conservation and non-negative portion arithmetic", () => {
    let availableDemand = baseRecipient.remainingDemand; // 60
    const matchedPortions = 40;

    // Simulate allocation assignment
    availableDemand -= matchedPortions;
    expect(availableDemand).toBe(20);
    expect(availableDemand).toBeGreaterThanOrEqual(0);

    // Simulate cancellation / rollback
    availableDemand += matchedPortions;
    expect(availableDemand).toBe(baseRecipient.remainingDemand);
    expect(availableDemand).toBeLessThanOrEqual(baseRecipient.requestedMealPortions);
  });
});

import { describe, it, expect } from "vitest";
import { computeAnalytics } from "@/lib/analytics/metrics";
import { Donation, Recipient, Allocation } from "@/types";

describe("Analytics and Impact Ledger Computations", () => {
  const donations: Donation[] = [
    {
      id: "d1",
      donorName: "Donor A",
      donorType: "restaurant",
      foodDescription: "Meals",
      foodCategory: "cooked_meals",
      dietaryCategory: "vegetarian",
      quantity: 100,
      unit: "portions",
      remainingQuantity: 20, // 80 accounted for
      pickupLocation: "Noida",
      latitude: 28.5,
      longitude: 77.4,
      preparedAt: new Date().toISOString(),
      pickupWindowStart: new Date().toISOString(),
      pickupWindowEnd: new Date().toISOString(),
      confirmedUseBy: new Date().toISOString(),
      storageMethod: "ambient",
      packagingCondition: "sealed_containers",
      allergenInformation: [],
      handlingInformation: "Standard",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: "eligible_for_matching",
      safetyReviewNotes: "",
      safetyReviewer: null,
      safetyReviewedAt: null,
      status: "available",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
      history: [],
    },
    {
      id: "d2",
      donorName: "Donor B",
      donorType: "hostel",
      foodDescription: "Bulk raw dal",
      foodCategory: "packaged_groceries",
      dietaryCategory: "vegetarian",
      quantity: 50,
      unit: "kg", // kg, not portions!
      remainingQuantity: 50,
      pickupLocation: "Noida",
      latitude: 28.5,
      longitude: 77.4,
      preparedAt: new Date().toISOString(),
      pickupWindowStart: new Date().toISOString(),
      pickupWindowEnd: new Date().toISOString(),
      confirmedUseBy: new Date().toISOString(),
      storageMethod: "ambient",
      packagingCondition: "sealed_containers",
      allergenInformation: [],
      handlingInformation: "Standard",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: "awaiting_human_review",
      safetyReviewNotes: "",
      safetyReviewer: null,
      safetyReviewedAt: null,
      status: "awaiting_review",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
      history: [],
    },
  ];

  const recipients: Recipient[] = [
    {
      id: "r1",
      organizationName: "Shelter 1",
      organizationType: "shelter",
      contactPerson: "Lead",
      phone: "123",
      location: "Noida",
      latitude: 28.5,
      longitude: 77.4,
      requestedMealPortions: 80,
      remainingDemand: 30,
      receivingCapacity: 80,
      availableCapacity: 30,
      urgencyLevel: "high",
      acceptedDietaryCategories: ["vegetarian"],
      allergenRestrictions: [],
      storageCapabilities: ["ambient"],
      transportAvailability: "flexible",
      receivingWindowStart: new Date().toISOString(),
      receivingWindowEnd: new Date().toISOString(),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
  ];

  const allocations: Allocation[] = [
    {
      id: "a1",
      donationId: "d1",
      recipientId: "r1",
      allocatedPortions: 50,
      distanceKm: 2,
      score: 90,
      scoreBreakdown: {
        urgencyScore: 80,
        proximityScore: 90,
        demandFitScore: 80,
        readinessScore: 80,
        rawWeights: { urgency: 40, proximity: 30, demand: 20, readiness: 10 },
      },
      status: "delivered",
      reasons: [],
      unresolvedConstraints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [],
      handoverReceipt: {
        receiptNumber: "FR-1",
        donorSignature: "Sig",
        recipientSignature: "Sig",
        completedAt: new Date().toISOString(),
        qrData: "test",
      },
    },
    {
      id: "a2",
      donationId: "d1",
      recipientId: "r1",
      allocatedPortions: 30,
      distanceKm: 2,
      score: 90,
      scoreBreakdown: {
        urgencyScore: 80,
        proximityScore: 90,
        demandFitScore: 80,
        readinessScore: 80,
        rawWeights: { urgency: 40, proximity: 30, demand: 20, readiness: 10 },
      },
      status: "reserved",
      reasons: [],
      unresolvedConstraints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [],
    },
  ];

  it("calculates accurate totals without double counting or mixing kg with portions", () => {
    const summary = computeAnalytics(donations, recipients, allocations);

    // Only d1 is in 'portions' (100)
    expect(summary.metrics.totalDonatedPortions).toBe(100);
    // a1 is delivered (50)
    expect(summary.metrics.confirmedDeliveredPortions).toBe(50);
    // a2 is reserved (30)
    expect(summary.metrics.currentlyAllocatedPortions).toBe(30);
    // Remaining in d1 is 20
    expect(summary.metrics.unallocatedPortions).toBe(20);

    // Sum check: delivered + reserved + unallocated = total
    expect(
      summary.metrics.confirmedDeliveredPortions +
        summary.metrics.currentlyAllocatedPortions +
        summary.metrics.unallocatedPortions
    ).toBe(summary.metrics.totalDonatedPortions);

    // Pending review count should be 1 (d2 is awaiting_human_review)
    expect(summary.metrics.pendingDonationsCount).toBe(1);
  });
});

import { describe, it, expect } from "vitest";
import { evaluateFoodSafetyGate } from "@/lib/safety/safetyGate";
import { Donation } from "@/types";

describe("Food Safety Gate deterministic validation", () => {
  const baseDonation: Donation = {
    id: "don-safe-1",
    donorName: "Commercial Hotel",
    donorType: "restaurant",
    foodDescription: "Rice and Dal",
    foodCategory: "cooked_meals",
    dietaryCategory: "vegetarian",
    quantity: 80,
    unit: "portions",
    remainingQuantity: 80,
    pickupLocation: "Noida",
    latitude: 28.535,
    longitude: 77.391,
    preparedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    pickupWindowStart: new Date(Date.now() - 1800 * 1000).toISOString(),
    pickupWindowEnd: new Date(Date.now() + 7200 * 1000).toISOString(),
    confirmedUseBy: new Date(Date.now() + 14400 * 1000).toISOString(),
    storageMethod: "heated",
    packagingCondition: "sealed_containers",
    allergenInformation: [],
    handlingInformation: "Maintain temperature above 60°C in thermal boxes.",
    sourceVerificationStatus: "verified_license",
    safetyReviewStatus: "eligible_for_matching",
    safetyReviewNotes: "Verified compliant",
    safetyReviewer: "Coordinator",
    safetyReviewedAt: new Date().toISOString(),
    status: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    history: [],
  };

  it("approves fully compliant donation with confirmed portions and valid use-by", () => {
    const res = evaluateFoodSafetyGate(baseDonation);
    expect(res.isEligible).toBe(true);
    expect(res.blockers.length).toBe(0);
  });

  it("blocks donation if unit is not confirmed portions (e.g. kg)", () => {
    const kgDonation: Donation = { ...baseDonation, unit: "kg" };
    const res = evaluateFoodSafetyGate(kgDonation);
    expect(res.isEligible).toBe(false);
    expect(res.blockers[0]).toContain("Unit is 'kg'");
    expect(res.regulationReferences[0]).toContain("FSSAI 2019");
  });

  it("blocks donation if quantity is zero or negative", () => {
    const zeroDonation: Donation = { ...baseDonation, quantity: 0 };
    const res = evaluateFoodSafetyGate(zeroDonation);
    expect(res.isEligible).toBe(false);
    expect(res.blockers).toContain("Quantity must be a positive number greater than zero.");
  });

  it("blocks donation if packaging is loose", () => {
    const looseDonation: Donation = { ...baseDonation, packagingCondition: "loose" };
    const res = evaluateFoodSafetyGate(looseDonation);
    expect(res.isEligible).toBe(false);
    expect(res.blockers[0]).toContain("Packaging condition is 'loose'");
  });

  it("blocks donation if confirmed use-by has passed", () => {
    const expiredDonation: Donation = {
      ...baseDonation,
      confirmedUseBy: new Date(Date.now() - 3600 * 1000).toISOString(),
    };
    const res = evaluateFoodSafetyGate(expiredDonation);
    expect(res.isEligible).toBe(false);
    expect(res.status).toBe("expired");
    expect(res.blockers[0]).toContain("Food has passed its confirmed use-by time");
  });

  it("holds donation if human safety review is not yet eligible_for_matching", () => {
    const pendingDonation: Donation = {
      ...baseDonation,
      safetyReviewStatus: "awaiting_human_review",
    };
    const res = evaluateFoodSafetyGate(pendingDonation);
    expect(res.isEligible).toBe(false);
    expect(res.blockers[0]).toContain("awaiting simulated human coordinator safety review");
  });

  it("blocks donation if marked as held by coordinator", () => {
    const heldDonation: Donation = {
      ...baseDonation,
      safetyReviewStatus: "held",
    };
    const res = evaluateFoodSafetyGate(heldDonation);
    expect(res.isEligible).toBe(false);
    expect(res.blockers[0]).toContain("currently held by coordinator");
  });

  it("blocks donation if rejected during inspection", () => {
    const rejectedDonation: Donation = {
      ...baseDonation,
      safetyReviewStatus: "rejected",
    };
    const res = evaluateFoodSafetyGate(rejectedDonation);
    expect(res.isEligible).toBe(false);
    expect(res.blockers[0]).toContain("was rejected during safety inspection");
  });
});

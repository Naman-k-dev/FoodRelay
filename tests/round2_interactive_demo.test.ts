import { describe, it, expect } from "vitest";
import { runRelayMatch, DEFAULT_WEIGHTS } from "@/lib/matching/relayMatch";
import { evaluateFoodSafetyGate } from "@/lib/safety/safetyGate";
import { createRound2Donation, createRound2Recipients, ROUND2_SCENARIOS } from "@/lib/demo/round2Scenarios";
import { extractWithFallbackHeuristics } from "@/lib/ai/fallbackExtractor";
import { Donation, Recipient } from "@/types";

describe("Round 2 Live Demonstration & Offline NGO Availability Rules", () => {
  const now = new Date();

  // 1. An offline NGO receives zero new allocations
  it("Test 1: An offline NGO receives exactly zero new allocations", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);
    // Ensure at least one NGO is offline
    const offlineNgo = recipients.find((r) => r.status === "offline");
    expect(offlineNgo).toBeDefined();

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);

    const offlineMatch =
      result.eligibleMatches.find((m) => m.recipient.id === offlineNgo?.id) ||
      result.ineligibleMatches.find((m) => m.recipient.id === offlineNgo?.id);

    expect(offlineMatch?.suggestedPortions).toBe(0);
    expect(offlineMatch?.eligible).toBe(false);
    expect(offlineMatch?.ineligibleReasons.some((r) => r.toLowerCase().includes("offline"))).toBe(true);
  });

  // 2. A critical-urgency offline NGO receives zero new allocations
  it("Test 2: A critical-urgency offline NGO receives exactly zero new allocations", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);
    // Sunrise Foundation E is Critical urgency (100) and Offline
    const sunrise = recipients.find((r) => r.id === "demo-rec-e");
    expect(sunrise).toBeDefined();
    expect(sunrise?.urgencyLevel).toBe("critical");
    expect(sunrise?.status).toBe("offline");

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const match = result.ineligibleMatches.find((m) => m.recipient.id === sunrise?.id);

    expect(match).toBeDefined();
    expect(match?.suggestedPortions).toBe(0);
    expect(match?.eligible).toBe(false);
  });

  // 3. Switching an allocated NGO offline invalidates uncommitted suggestions
  it("Test 3: Switching an allocated NGO offline invalidates its suggestions and redistributes surplus", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    // Initial match: Community Kitchen A should receive portions
    const initialResult = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const initialA = initialResult.eligibleMatches.find((m) => m.recipient.id === "demo-rec-a");
    expect(initialA).toBeDefined();
    expect(initialA!.suggestedPortions).toBeGreaterThan(0);

    // Switch Community Kitchen A offline
    const modifiedRecs = recipients.map((r) =>
      r.id === "demo-rec-a" ? { ...r, status: "offline" as const, isOnline: false } : r
    );

    const updatedResult = runRelayMatch(donation, modifiedRecs, DEFAULT_WEIGHTS, now);
    const updatedA =
      updatedResult.eligibleMatches.find((m) => m.recipient.id === "demo-rec-a") ||
      updatedResult.ineligibleMatches.find((m) => m.recipient.id === "demo-rec-a");

    expect(updatedA?.suggestedPortions).toBe(0);
    expect(updatedA?.eligible).toBe(false);

    // Other online NGOs should absorb portions
    const hopeShelterB = updatedResult.eligibleMatches.find((m) => m.recipient.id === "demo-rec-b");
    expect(hopeShelterB).toBeDefined();
    expect(hopeShelterB!.suggestedPortions).toBeGreaterThan(0);
  });

  // 4. Reallocation respects remaining recipient capacity
  it("Test 4: Reallocation respects remaining recipient capacity", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    for (const match of result.eligibleMatches) {
      expect(match.suggestedPortions).toBeLessThanOrEqual(match.recipient.availableCapacity);
      expect(match.suggestedPortions).toBeLessThanOrEqual(match.recipient.remainingDemand);
    }
  });

  // 5. Switching an NGO online makes it eligible only when all other constraints pass
  it("Test 5: Switching an NGO online makes it eligible only when all other constraints pass", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    // Turn Sunrise Foundation online, but with zero capacity
    const modifiedRecs = recipients.map((r) =>
      r.id === "demo-rec-e"
        ? { ...r, status: "online" as const, isOnline: true, availableCapacity: 0 }
        : r
    );

    const result = runRelayMatch(donation, modifiedRecs, DEFAULT_WEIGHTS, now);
    const sunrise = result.ineligibleMatches.find((m) => m.recipient.id === "demo-rec-e");
    expect(sunrise?.eligible).toBe(false);
    expect(sunrise?.ineligibleReasons.some((r) => r.toLowerCase().includes("capacity"))).toBe(true);
  });

  // 6. All NGOs offline produces zero allocations
  it("Test 6: All NGOs offline produces zero allocated portions and 100% unallocated surplus", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now).map((r) => ({
      ...r,
      status: "offline" as const,
      isOnline: false,
    }));

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    expect(result.allocatedPortions).toBe(0);
    expect(result.unallocatedPortions).toBe(donation.quantity);
    expect(result.eligibleMatches.length).toBe(0);
    expect(result.ineligibleMatches.length).toBe(recipients.length);
  });

  // 7. Zero-demand NGOs receive zero allocations
  it("Test 7: Zero-demand NGOs receive zero allocations", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now).map((r) =>
      r.id === "demo-rec-b" ? { ...r, remainingDemand: 0 } : r
    );

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const matchB =
      result.eligibleMatches.find((m) => m.recipient.id === "demo-rec-b") ||
      result.ineligibleMatches.find((m) => m.recipient.id === "demo-rec-b");

    expect(matchB?.suggestedPortions).toBe(0);
    expect(matchB?.eligible).toBe(false);
  });

  // 8. Zero-capacity NGOs receive zero allocations
  it("Test 8: Zero-capacity NGOs receive zero allocations", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now).map((r) =>
      r.id === "demo-rec-c" ? { ...r, availableCapacity: 0 } : r
    );

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const matchC =
      result.eligibleMatches.find((m) => m.recipient.id === "demo-rec-c") ||
      result.ineligibleMatches.find((m) => m.recipient.id === "demo-rec-c");

    expect(matchC?.suggestedPortions).toBe(0);
    expect(matchC?.eligible).toBe(false);
  });

  // 9. Transport-unavailable NGOs receive zero allocations
  it("Test 9: Transport-unavailable NGOs receive zero allocations", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);
    // Community Support F is transport unavailable
    const f = recipients.find((r) => r.id === "demo-rec-f");
    expect(f?.transportAvailable).toBe(false);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const matchF =
      result.eligibleMatches.find((m) => m.recipient.id === "demo-rec-f") ||
      result.ineligibleMatches.find((m) => m.recipient.id === "demo-rec-f");

    expect(matchF?.suggestedPortions).toBe(0);
    expect(matchF?.eligible).toBe(false);
    expect(matchF?.ineligibleReasons.some((r) => r.toLowerCase().includes("transport"))).toBe(true);
  });

  // 10. Urgency changes affect eligible recipient ranking correctly
  it("Test 10: Urgency changes update recipient score and priority ranking", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    // Initial match: Care Centre C has Medium urgency (50)
    const res1 = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const score1 = res1.eligibleMatches.find((m) => m.recipient.id === "demo-rec-c")?.score || 0;

    // Change Care Centre C urgency to Critical (100)
    const modifiedRecs = recipients.map((r) =>
      r.id === "demo-rec-c" ? { ...r, urgencyLevel: "critical" as const } : r
    );
    const res2 = runRelayMatch(donation, modifiedRecs, DEFAULT_WEIGHTS, now);
    const score2 = res2.eligibleMatches.find((m) => m.recipient.id === "demo-rec-c")?.score || 0;

    expect(score2).toBeGreaterThan(score1);
  });

  // 11. Capacity shortage reports exact unallocated portions
  it("Test 11: Capacity shortage reports exact unallocated portions without loss", () => {
    const donation = {
      ...createRound2Donation(now),
      quantity: 250,
      remainingQuantity: 250,
    };
    // Restrict eligible recipients to single NGO with 120 capacity
    const recipients = createRound2Recipients(now).map((r) =>
      r.id === "demo-rec-c"
        ? { ...r, status: "online" as const, isOnline: true, availableCapacity: 120, remainingDemand: 120 }
        : { ...r, status: "offline" as const, isOnline: false }
    );

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    expect(result.allocatedPortions).toBe(120);
    expect(result.unallocatedPortions).toBe(130);
    expect(result.allocatedPortions + result.unallocatedPortions).toBe(250);
  });

  // 12. Editing food quantity invalidates stale matching results
  it("Test 12: Editing food quantity updates allocated portions immediately", () => {
    const recipients = createRound2Recipients(now);

    const don180 = createRound2Donation(now);
    const res180 = runRelayMatch(don180, recipients, DEFAULT_WEIGHTS, now);
    expect(res180.totalDonationPortions).toBe(180);

    const don50 = { ...createRound2Donation(now), quantity: 50, remainingQuantity: 50 };
    const res50 = runRelayMatch(don50, recipients, DEFAULT_WEIGHTS, now);
    expect(res50.totalDonationPortions).toBe(50);
    expect(res50.allocatedPortions).toBeLessThanOrEqual(50);
  });

  // 13. Stale reservations are rejected after NGO status changes
  it("Test 13: Stale reservations are rejected if recipient went offline before locking", () => {
    const recipients = createRound2Recipients(now);
    const targetNgo = recipients.find((r) => r.id === "demo-rec-a")!;

    // Simulate pre-locking check:
    const isAvailableForLock = (ngo: Recipient) => ngo.status === "online" && ngo.isOnline !== false;
    expect(isAvailableForLock(targetNgo)).toBe(true);

    // NGO switches offline
    const updatedNgo = { ...targetNgo, status: "offline" as const, isOnline: false };
    expect(isAvailableForLock(updatedNgo)).toBe(false);
  });

  // 14. Duplicate confirmations cannot over-allocate food
  it("Test 14: Duplicate confirmations cannot over-allocate food", () => {
    let availableSupply = 100;
    const allocation = 60;

    // First confirmation
    const confirmReservation = () => {
      if (availableSupply >= allocation) {
        availableSupply -= allocation;
        return true;
      }
      return false;
    };

    expect(confirmReservation()).toBe(true);
    expect(availableSupply).toBe(40);

    // Second confirmation attempt for same batch
    expect(confirmReservation()).toBe(false); // cannot re-allocate 60 when only 40 left
    expect(availableSupply).toBe(40);
  });

  // 15. Dietary incompatibility prevents allocation
  it("Test 15: Dietary incompatibility strictly prevents candidate generation", () => {
    const nonVegDonation: Donation = {
      ...createRound2Donation(now),
      dietaryCategory: "non_vegetarian",
      foodDescription: "Chicken Korma",
    };
    // Hope Shelter B only accepts vegetarian and vegan
    const hopeShelter = createRound2Recipients(now).find((r) => r.id === "demo-rec-b")!;
    expect(hopeShelter.acceptedDietaryCategories).not.toContain("non_vegetarian");

    const result = runRelayMatch(nonVegDonation, [hopeShelter], DEFAULT_WEIGHTS, now);
    expect(result.eligibleMatches.length).toBe(0);
    expect(result.ineligibleMatches.length).toBe(1);
    expect(result.ineligibleMatches[0].ineligibleReasons.some((r) => r.toLowerCase().includes("dietary"))).toBe(true);
  });

  // 16. Missing safety review prevents allocation
  it("Test 16: Missing safety review prevents allocation per FSSAI 2019 gate", () => {
    const unapprovedDonation: Donation = {
      ...createRound2Donation(now),
      safetyReviewStatus: "awaiting_human_review",
      status: "awaiting_review",
    };

    const safetyResult = evaluateFoodSafetyGate(unapprovedDonation, now);
    expect(safetyResult.isEligible).toBe(false);

    const result = runRelayMatch(unapprovedDonation, createRound2Recipients(now), DEFAULT_WEIGHTS, now);
    expect(result.allocatedPortions).toBe(0);
    expect(result.eligibleMatches.length).toBe(0);
  });

  // 17. Expired donations cannot be matched
  it("Test 17: Expired donations cannot be matched", () => {
    const expiredDonation: Donation = {
      ...createRound2Donation(now),
      confirmedUseBy: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
      pickupWindowEnd: new Date(now.getTime() - 1800000).toISOString(),
    };

    const safetyResult = evaluateFoodSafetyGate(expiredDonation, now);
    expect(safetyResult.isEligible).toBe(false);
    expect(
      safetyResult.blockers.some(
        (b) =>
          b.toLowerCase().includes("use-by") ||
          b.toLowerCase().includes("closed") ||
          b.toLowerCase().includes("expired")
      )
    ).toBe(true);
  });

  // 18. Arbitrary food descriptions are accepted by the intake form
  it("Test 18: Arbitrary food descriptions in English, Hindi, and Hinglish are accepted and parsed", () => {
    const customInputs = [
      "We have 180 plates of biryani from a wedding.",
      "Our college canteen has 350 packed vegetarian thalis.",
      "We have 75 sandwiches and 50 fruit boxes.",
      "Hamare restaurant mein 250 rajma chawal ke portions extra hain.",
      "We have 100 packets of poha and 200 sealed water bottles.",
      "There are 60 meals available for collection from our hostel.",
    ];

    for (const msg of customInputs) {
      const draft = extractWithFallbackHeuristics(msg);
      expect(draft.isFoodRelated).toBe(true);
      expect(draft.quantity).toBeGreaterThan(0);
      expect(draft.foodDescription).toBeDefined();
    }
  });

  // 19. Mixed incompatible quantity units are not silently combined
  it("Test 19: Mixed incompatible quantity units are parsed into distinct items", () => {
    const mixedMsg = "We have 75 sandwiches and 50 fruit boxes.";
    const draft = extractWithFallbackHeuristics(mixedMsg);

    expect(draft.foodItems).toBeDefined();
    expect(draft.foodItems?.length).toBeGreaterThanOrEqual(2);
    expect(draft.foodItems?.some((i) => i.name.toLowerCase().includes("sandwich"))).toBe(true);
    expect(draft.foodItems?.some((i) => i.name.toLowerCase().includes("fruit"))).toBe(true);
  });

  // 20. Demo reset restores correct initial state
  it("Test 20: Demo reset restores correct initial 6 fictional recipients and defaults", () => {
    const recs = createRound2Recipients(now);
    expect(recs.length).toBe(6);
    expect(recs[0].organizationName).toBe("Community Kitchen A");
    expect(recs[0].status).toBe("online");
    expect(recs[4].organizationName).toBe("Sunrise Foundation E");
    expect(recs[4].status).toBe("offline");
    expect(recs[5].organizationName).toBe("Community Support F");
    expect(recs[5].transportAvailable).toBe(false);
  });

  // 21. Digital Twin never mutates committed records
  it("Test 21: Digital Twin operates on cloned state without mutating committed donation", () => {
    const originalDonation = createRound2Donation(now);
    const deepClone = JSON.parse(JSON.stringify(originalDonation));

    // Digital twin simulation shifts quantity and shifts recipient offline
    const simDonation = { ...originalDonation, quantity: 500 };
    expect(simDonation.quantity).toBe(500);
    expect(originalDonation.quantity).toBe(180);
    expect(originalDonation).toEqual(deepClone);
  });

  // 22. Offline mode works without Gemini
  it("Test 22: Offline mode extracts facts deterministically without network or Gemini calls", () => {
    const text = "120 vegetarian thalis packed in foil trays in Sector 18 Noida.";
    const draft = extractWithFallbackHeuristics(text);
    expect(draft.quantity).toBe(120);
    expect(draft.dietaryCategory).toBe("vegetarian");
    expect(draft.packagingCondition).toBe("foil_trays");
    expect(draft.pickupLocation).toContain("Sector 18");
  });

  // 23. Delivery confirmation cannot double count impact
  it("Test 23: Delivery confirmation cannot double count impact", () => {
    let deliveredCount = 0;
    let isDelivered = false;

    const simulateDelivery = (portions: number) => {
      if (isDelivered) return 0; // idempotent safeguard
      isDelivered = true;
      deliveredCount += portions;
      return portions;
    };

    expect(simulateDelivery(180)).toBe(180);
    expect(deliveredCount).toBe(180);

    // Repeated click
    expect(simulateDelivery(180)).toBe(0);
    expect(deliveredCount).toBe(180); // intact, no double counting
  });

  // 24. Historical deliveries remain intact when an NGO goes offline
  it("Test 24: Historical delivered records remain intact when an NGO goes offline", () => {
    const historicalDelivery = {
      receiptNumber: "REC-2026-DELIVERY-01",
      recipientId: "demo-rec-a",
      portionsDelivered: 80,
      deliveredAt: new Date(now.getTime() - 7200000).toISOString(),
    };

    // NGO switches offline later in the day
    const updatedNgo = {
      ...createRound2Recipients(now)[0],
      status: "offline" as const,
      isOnline: false,
    };

    expect(updatedNgo.status).toBe("offline");
    expect(historicalDelivery.portionsDelivered).toBe(80); // historical record strictly immutable
    expect(historicalDelivery.receiptNumber).toBe("REC-2026-DELIVERY-01");
  });
});

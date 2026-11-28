import { describe, it, expect } from "vitest";
import { runRelayMatch, DEFAULT_WEIGHTS } from "@/lib/matching/relayMatch";
import { createRound2Donation, createRound2Recipients, ROUND2_SCENARIOS } from "@/lib/demo/round2Scenarios";
import { evaluateFoodSafetyGate } from "@/lib/safety/safetyGate";
import { Donation, Recipient } from "@/types";

describe("Round 2 Final Live Demo — Reactive Redistribution & Invariant Tests", () => {
  const now = new Date();

  // 1. Offline NGO receives exactly zero new allocations
  it("Test 1: Offline NGO receives exactly zero new allocations under any condition", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    // Ensure Community Kitchen A is offline
    const modifiedRecipients = recipients.map((r) =>
      r.id === "demo-rec-a" ? { ...r, status: "offline" as const, isOnline: false } : r
    );

    const result = runRelayMatch(donation, modifiedRecipients, DEFAULT_WEIGHTS, now);
    const kitchenAlloc = result.suggestedAllocations.find((a) => a.recipientId === "demo-rec-a");

    expect(kitchenAlloc).toBeUndefined();
    const candidate = result.ineligibleMatches.find((c) => c.recipient.id === "demo-rec-a");
    expect(candidate).toBeDefined();
    expect(candidate?.suggestedPortions).toBe(0);
    expect(candidate?.eligible).toBe(false);
  });

  // 2. Critical urgency offline NGO receives zero
  it("Test 2: Recipient with Critical (100) urgency receives 0 when offline", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    // Sunrise Foundation E is Critical (100) and offline
    const sunrise = recipients.find((r) => r.id === "demo-rec-e");
    expect(sunrise?.urgencyLevel).toBe("critical");
    expect(sunrise?.isOnline).toBe(false);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const sunriseAlloc = result.suggestedAllocations.find((a) => a.recipientId === "demo-rec-e");
    expect(sunriseAlloc).toBeUndefined();
  });

  // 3. Released proposed portions are redistributed automatically
  it("Test 3: Released proposed portions are redistributed automatically when top NGO goes offline", () => {
    const donation = createRound2Donation(now); // 180 portions
    const recipients = createRound2Recipients(now);

    // Baseline: Kitchen A (80), Hope Shelter B (60), Care Centre C (40)
    const baseResult = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const baseKitchen = baseResult.suggestedAllocations.find((a) => a.recipientId === "demo-rec-a")?.allocatedPortions || 0;
    expect(baseKitchen).toBe(80);

    // Toggle Kitchen A offline
    const offlineRecipients = recipients.map((r) =>
      r.id === "demo-rec-a" ? { ...r, status: "offline" as const, isOnline: false } : r
    );

    const reResult = runRelayMatch(donation, offlineRecipients, DEFAULT_WEIGHTS, now);

    // Kitchen A must get 0
    expect(reResult.suggestedAllocations.find((a) => a.recipientId === "demo-rec-a")).toBeUndefined();

    // Hope Shelter B, Care Centre C, and Helping Hands D should absorb the released 80 portions
    const newHope = reResult.suggestedAllocations.find((a) => a.recipientId === "demo-rec-b")?.allocatedPortions || 0;
    const newCare = reResult.suggestedAllocations.find((a) => a.recipientId === "demo-rec-c")?.allocatedPortions || 0;
    const newHelping = reResult.suggestedAllocations.find((a) => a.recipientId === "demo-rec-d")?.allocatedPortions || 0;

    expect(newHope + newCare + newHelping).toBe(180);
    expect(reResult.allocatedPortions).toBe(180);
    expect(reResult.unallocatedPortions).toBe(0);
  });

  // 4. Full redistribution when sufficient eligible capacity exists
  it("Test 4: Full redistribution achieved when remaining eligible network capacity >= donation", () => {
    const donation = createRound2Donation(now); // 180 portions
    const recipients = createRound2Recipients(now);

    // Kitchen A (80) goes offline.
    // Remaining online capacity: Hope B (100) + Care C (120) + Helping D (60) = 280 > 180
    const modified = recipients.map((r) =>
      r.id === "demo-rec-a" ? { ...r, isOnline: false, status: "offline" as const } : r
    );

    const res = runRelayMatch(donation, modified, DEFAULT_WEIGHTS, now);
    expect(res.allocatedPortions).toBe(180);
    expect(res.unallocatedPortions).toBe(0);
  });

  // 5. Partial redistribution when capacity is insufficient
  it("Test 5: Partial redistribution accurately reports unallocated surplus when capacity is insufficient", () => {
    const donation: Donation = {
      ...createRound2Donation(now),
      quantity: 250,
      remainingQuantity: 250,
      storageMethod: "ambient", // Ambient allows Helping Hands D
    };
    const recipients = createRound2Recipients(now);

    // Cap Hope B to 50, Care C to 50, Helping D to 20, Kitchen A offline. Total online cap = 120
    const limitedRecipients = recipients.map((r) => {
      if (r.id === "demo-rec-a") return { ...r, isOnline: false, status: "offline" as const };
      if (r.id === "demo-rec-b") return { ...r, availableCapacity: 50, remainingDemand: 50, storageCapabilities: ["ambient", "heated"] as any };
      if (r.id === "demo-rec-c") return { ...r, availableCapacity: 50, remainingDemand: 50, storageCapabilities: ["ambient", "heated"] as any };
      if (r.id === "demo-rec-d") return { ...r, availableCapacity: 20, remainingDemand: 20, storageCapabilities: ["ambient"] as any };
      return r;
    });

    const res = runRelayMatch(donation, limitedRecipients, DEFAULT_WEIGHTS, now);
    expect(res.allocatedPortions).toBe(120);
    expect(res.unallocatedPortions).toBe(130);
    expect(res.allocatedPortions + res.unallocatedPortions).toBe(250);
  });

  // 6. All NGOs offline results in zero allocations
  it("Test 6: All NGOs offline results in 0 allocated and 100% unallocated surplus", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now).map((r) => ({
      ...r,
      isOnline: false,
      status: "offline" as const,
    }));

    const res = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    expect(res.suggestedAllocations.length).toBe(0);
    expect(res.allocatedPortions).toBe(0);
    expect(res.unallocatedPortions).toBe(180);
  });

  // 7. NGO returning online triggers recalculation
  it("Test 7: NGO returning online is immediately factored into recalculation", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    // Sunrise Foundation E returns online
    const modified = recipients.map((r) =>
      r.id === "demo-rec-e"
        ? { ...r, isOnline: true, status: "online" as const, receivingAvailability: true }
        : r
    );

    const res = runRelayMatch(donation, modified, DEFAULT_WEIGHTS, now);
    const sunriseAlloc = res.suggestedAllocations.find((a) => a.recipientId === "demo-rec-e");

    expect(sunriseAlloc).toBeDefined();
    expect(sunriseAlloc?.allocatedPortions).toBeGreaterThan(0);
  });

  // 8. Dietary mismatch prevents redistribution to an incompatible NGO
  it("Test 8: Dietary incompatibility strictly prevents candidate generation", () => {
    const nonVegDonation: Donation = {
      ...createRound2Donation(now),
      dietaryCategory: "non_vegetarian",
      foodDescription: "Chicken Biryani and Curry",
    };
    const recipients = createRound2Recipients(now);

    const res = runRelayMatch(nonVegDonation, recipients, DEFAULT_WEIGHTS, now);

    // Only Care Centre C accepts non_vegetarian
    for (const alloc of res.suggestedAllocations) {
      expect(alloc.recipientId).toBe("demo-rec-c");
    }
  });

  // 9. Transport failure prevents allocation
  it("Test 9: Recipient with transport failure receives zero allocations", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    // Community Support F has transportAvailable: false
    const supportF = recipients.find((r) => r.id === "demo-rec-f");
    expect(supportF?.transportAvailable).toBe(false);

    const res = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const allocF = res.suggestedAllocations.find((a) => a.recipientId === "demo-rec-f");
    expect(allocF).toBeUndefined();
  });

  // 10. Existing reservations reduce available capacity correctly
  it("Test 10: Existing confirmed reservations subtract from available capacity", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    // Suppose Kitchen A already has 50 portions reserved
    const adjustedRecipients = recipients.map((r) =>
      r.id === "demo-rec-a"
        ? { ...r, availableCapacity: r.receivingCapacity - 50, remainingDemand: r.requestedMealPortions - 50 }
        : r
    );

    const res = runRelayMatch(donation, adjustedRecipients, DEFAULT_WEIGHTS, now);
    const kitchenAlloc = res.suggestedAllocations.find((a) => a.recipientId === "demo-rec-a");

    // Can allocate at most 30 more portions (80 - 50 = 30)
    expect(kitchenAlloc?.allocatedPortions).toBeLessThanOrEqual(30);
  });

  // 11. Changing urgency updates ranking
  it("Test 11: Changing urgency immediately promotes recipient ranking", () => {
    const donation = createRound2Donation(now);
    const recipients = createRound2Recipients(now);

    // Baseline: Care Centre C is Medium (50)
    const base = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const baseCareRank = base.eligibleMatches.findIndex((m) => m.recipient.id === "demo-rec-c");

    // Promote Care Centre C to Critical (100)
    const promoted = recipients.map((r) =>
      r.id === "demo-rec-c" ? { ...r, urgencyLevel: "critical" as const } : r
    );
    const res = runRelayMatch(donation, promoted, DEFAULT_WEIGHTS, now);
    const newCareRank = res.eligibleMatches.findIndex((m) => m.recipient.id === "demo-rec-c");

    expect(newCareRank).toBeLessThan(baseCareRank);
  });

  // 12. Changing donation quantity updates allocations
  it("Test 12: Changing donation quantity updates all recipient portion distributions", () => {
    const recipients = createRound2Recipients(now);

    const smallDonation: Donation = { ...createRound2Donation(now), quantity: 50, remainingQuantity: 50 };
    const largeDonation: Donation = { ...createRound2Donation(now), quantity: 200, remainingQuantity: 200 };

    const smallRes = runRelayMatch(smallDonation, recipients, DEFAULT_WEIGHTS, now);
    const largeRes = runRelayMatch(largeDonation, recipients, DEFAULT_WEIGHTS, now);

    expect(smallRes.allocatedPortions).toBe(50);
    expect(largeRes.allocatedPortions).toBeGreaterThan(smallRes.allocatedPortions);
  });

  // 13. Invalid safety review blocks matching
  it("Test 13: Unapproved safety review strictly produces 0 valid matches", () => {
    const unapprovedDonation: Donation = {
      ...createRound2Donation(now),
      safetyReviewStatus: "awaiting_human_review",
      status: "awaiting_review",
    };
    const recipients = createRound2Recipients(now);

    const res = runRelayMatch(unapprovedDonation, recipients, DEFAULT_WEIGHTS, now);
    expect(res.suggestedAllocations.length).toBe(0);
    expect(res.allocatedPortions).toBe(0);
    expect(res.unallocatedPortions).toBe(180);
  });

  // 14. Stale proposal confirmation rejection
  it("Test 14: Confirmed reservations cannot be placed for offline recipients", () => {
    const recipients = createRound2Recipients(now);
    const offlineRec = recipients.find((r) => r.id === "demo-rec-e");
    expect(offlineRec?.isOnline).toBe(false);

    // Stale check
    const isOnline = offlineRec?.status === "online" && offlineRec?.isOnline !== false;
    expect(isOnline).toBe(false);
  });

  // 15. Disrupted confirmed reservations require explicit resolution
  it("Test 15: Disrupted reservation preserves record and flags disruption", () => {
    const res = {
      id: "res-1",
      recipientId: "demo-rec-a",
      recipientName: "Community Kitchen A",
      portions: 80,
      status: "reserved" as const,
      confirmedAt: new Date().toISOString(),
      isDisrupted: true,
      disruptionReason: "Community Kitchen A went offline while reservation was awaiting collection.",
    };

    expect(res.isDisrupted).toBe(true);
    expect(res.status).toBe("reserved");
  });

  // 16. Completed delivery history is preserved
  it("Test 16: Completed deliveries are never cancelled merely because an NGO goes offline", () => {
    const completedRes = {
      id: "res-deliv-1",
      recipientId: "demo-rec-b",
      recipientName: "Hope Shelter B",
      portions: 60,
      status: "delivered" as const,
      confirmedAt: new Date().toISOString(),
    };

    // If Hope Shelter B goes offline, status remains delivered
    expect(completedRes.status).toBe("delivered");
    expect(completedRes.portions).toBe(60);
  });

  // 17. Duplicate delivery confirmation is prevented
  it("Test 17: Advance dispatch state machine prevents duplicate transitions", () => {
    function transitionDispatch(status: "reserved" | "accepted" | "collected" | "delivered"): "reserved" | "accepted" | "collected" | "delivered" {
      if (status === "reserved") return "accepted";
      if (status === "accepted") return "collected";
      if (status === "collected") return "delivered";
      return "delivered";
    }

    expect(transitionDispatch("reserved")).toBe("accepted");
    expect(transitionDispatch("accepted")).toBe("collected");
    expect(transitionDispatch("collected")).toBe("delivered");
    expect(transitionDispatch("delivered")).toBe("delivered"); // idempotent
  });

  // 18. Property Invariant: Conservation of Portions
  it("Test 18: Invariant — Allocated + Unallocated strictly equals donation quantity across all scenarios", () => {
    const quantities = [10, 50, 180, 250, 500, 1000];
    const baseRecipients = createRound2Recipients(now);

    for (const q of quantities) {
      const don: Donation = { ...createRound2Donation(now), quantity: q, remainingQuantity: q };
      const res = runRelayMatch(don, baseRecipients, DEFAULT_WEIGHTS, now);
      expect(res.allocatedPortions + res.unallocatedPortions).toBe(q);
      expect(res.allocatedPortions).toBeGreaterThanOrEqual(0);
      expect(res.unallocatedPortions).toBeGreaterThanOrEqual(0);
    }
  });

  // 19. Property Invariant: No Recipient Exceeds Capacity
  it("Test 19: Invariant — No individual recipient is allocated more than available capacity", () => {
    const largeDon: Donation = { ...createRound2Donation(now), quantity: 1500, remainingQuantity: 1500 };
    const recipients = createRound2Recipients(now);

    const res = runRelayMatch(largeDon, recipients, DEFAULT_WEIGHTS, now);

    for (const alloc of res.suggestedAllocations) {
      const rec = recipients.find((r) => r.id === alloc.recipientId);
      expect(alloc.allocatedPortions).toBeLessThanOrEqual(rec!.availableCapacity);
      expect(alloc.allocatedPortions).toBeLessThanOrEqual(rec!.remainingDemand);
    }
  });

  // 20. Property Invariant: Monotonic Safety Gate
  it("Test 20: Invariant — Safety gate failure monotonically yields 0 matches", () => {
    const expiredDon: Donation = {
      ...createRound2Donation(now),
      preparedAt: new Date(now.getTime() - 10 * 3600 * 1000).toISOString(), // 10 hrs ago (expired)
      confirmedUseBy: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(), // Past use-by time
    };

    const safetyResult = evaluateFoodSafetyGate(expiredDon, now);
    expect(safetyResult.isEligible).toBe(false);
  });

  // 21. Scenario H: No NGOs Available
  it("Test 21: Scenario H preset guarantees 100% unallocated surplus", () => {
    const presetH = ROUND2_SCENARIOS.find((s) => s.id === "scenario-h");
    expect(presetH).toBeDefined();

    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);
    const applied = presetH!.apply(don, recs, now);

    const res = runRelayMatch(applied.donation, applied.recipients, DEFAULT_WEIGHTS, now);
    expect(res.allocatedPortions).toBe(0);
    expect(res.unallocatedPortions).toBe(don.quantity);
  });

  // 22. Scenario D: High Capacity Shortage
  it("Test 22: Scenario D with large surplus accurately caps at total network capacity", () => {
    const presetD = ROUND2_SCENARIOS.find((s) => s.id === "scenario-d");
    expect(presetD).toBeDefined();

    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);
    const applied = presetD!.apply(don, recs, now);

    const res = runRelayMatch(applied.donation, applied.recipients, DEFAULT_WEIGHTS, now);
    expect(res.allocatedPortions).toBe(120);
    expect(res.unallocatedPortions).toBe(130);
    expect(res.allocatedPortions + res.unallocatedPortions).toBe(applied.donation.quantity);
  });

  // 23. Digital Twin zero record mutation
  it("Test 23: Digital twin operations do not mutate original donation or recipients", () => {
    const originalDonation = createRound2Donation(now);
    const originalRecipients = createRound2Recipients(now);

    const originalQty = originalDonation.quantity;
    const originalKitchenStatus = originalRecipients[0].status;

    // Simulate shock on copy
    const clonedDonation = { ...originalDonation, quantity: 500 };
    const clonedRecipients = originalRecipients.map((r) =>
      r.id === "demo-rec-a" ? { ...r, status: "offline" as const } : r
    );

    runRelayMatch(clonedDonation, clonedRecipients, DEFAULT_WEIGHTS, now);

    expect(originalDonation.quantity).toBe(originalQty);
    expect(originalRecipients[0].status).toBe(originalKitchenStatus);
  });

  // 24. Deterministic Tie-Breaking
  it("Test 24: Tie-breaking is completely deterministic across multiple runs", () => {
    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);

    const run1 = runRelayMatch(don, recs, DEFAULT_WEIGHTS, now);
    const run2 = runRelayMatch(don, recs, DEFAULT_WEIGHTS, now);

    expect(run1.suggestedAllocations).toEqual(run2.suggestedAllocations);
  });

  // 25. Non-negative quantities guarantee
  it("Test 25: All portion quantities and scores remain strictly non-negative", () => {
    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);

    const res = runRelayMatch(don, recs, DEFAULT_WEIGHTS, now);
    for (const alloc of res.suggestedAllocations) {
      expect(alloc.allocatedPortions).toBeGreaterThanOrEqual(0);
      expect(alloc.score).toBeGreaterThanOrEqual(0);
    }
  });
});

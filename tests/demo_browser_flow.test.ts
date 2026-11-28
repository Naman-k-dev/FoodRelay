import { describe, it, expect } from "vitest";
import { runRelayMatch, DEFAULT_WEIGHTS } from "@/lib/matching/relayMatch";
import {
  createRound2Donation,
  createRound2Recipients,
  ROUND2_SCENARIOS,
} from "@/lib/demo/round2Scenarios";
import { Donation, Recipient } from "@/types";

describe("Interactive Demo Flow & Scenario Matrix Integration", () => {
  const now = new Date();

  it("Flow Test A: Custom natural-language scenario execution with 350 portions", () => {
    const donation: Donation = {
      ...createRound2Donation(now),
      quantity: 350,
      remainingQuantity: 350,
      foodDescription: "Our college canteen has 350 packed vegetarian thalis.",
    };
    const recipients = createRound2Recipients(now);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    expect(result.totalDonationPortions).toBe(350);
    expect(result.allocatedPortions + result.unallocatedPortions).toBe(350);
    expect(result.allocatedPortions).toBeGreaterThan(0);

    // Verify offline NGO received 0
    const offlineNgo = result.ineligibleMatches.find((m) => m.recipient.id === "demo-rec-e");
    expect(offlineNgo?.suggestedPortions).toBe(0);
  });

  it("Flow Test B: Scenario B shifts Care Centre C to top rank via Critical urgency", () => {
    const scB = ROUND2_SCENARIOS.find((s) => s.id === "scenario-b")!;
    expect(scB).toBeDefined();

    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);
    const { donation, recipients } = scB.apply(don, recs, now);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const careCentre = result.eligibleMatches.find((m) => m.recipient.id === "demo-rec-c");
    expect(careCentre).toBeDefined();
    expect(careCentre?.recipient.urgencyLevel).toBe("critical");
    // Should be top rank
    expect(result.eligibleMatches[0].recipient.id).toBe("demo-rec-c");
  });

  it("Flow Test C: Scenario C switches highest-ranked NGO offline and re-routes immediately", () => {
    const scC = ROUND2_SCENARIOS.find((s) => s.id === "scenario-c")!;
    expect(scC).toBeDefined();

    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);
    const { donation, recipients } = scC.apply(don, recs, now);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const kitchenA =
      result.eligibleMatches.find((m) => m.recipient.id === "demo-rec-a") ||
      result.ineligibleMatches.find((m) => m.recipient.id === "demo-rec-a");

    expect(kitchenA?.suggestedPortions).toBe(0);
    expect(kitchenA?.eligible).toBe(false);

    // Surplus absorbed by remaining online NGOs
    expect(result.allocatedPortions).toBeGreaterThan(0);
    const hopeB = result.eligibleMatches.find((m) => m.recipient.id === "demo-rec-b");
    expect(hopeB?.suggestedPortions).toBeGreaterThan(0);
  });

  it("Flow Test D: Scenario D capacity shortage produces exactly 120 allocated and 130 unallocated", () => {
    const scD = ROUND2_SCENARIOS.find((s) => s.id === "scenario-d")!;
    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);
    const { donation, recipients } = scD.apply(don, recs, now);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    expect(result.allocatedPortions).toBe(120);
    expect(result.unallocatedPortions).toBe(130);
  });

  it("Flow Test E: Scenario E transport failure excludes partner with zero portions", () => {
    const scE = ROUND2_SCENARIOS.find((s) => s.id === "scenario-e")!;
    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);
    const { donation, recipients } = scE.apply(don, recs, now);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    const hopeB =
      result.eligibleMatches.find((m) => m.recipient.id === "demo-rec-b") ||
      result.ineligibleMatches.find((m) => m.recipient.id === "demo-rec-b");

    expect(hopeB?.suggestedPortions).toBe(0);
    expect(hopeB?.eligible).toBe(false);
  });

  it("Flow Test F: Scenario H (All NGOs Offline) yields zero allocations and explains outage", () => {
    const scH = ROUND2_SCENARIOS.find((s) => s.id === "scenario-h")!;
    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);
    const { donation, recipients } = scH.apply(don, recs, now);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    expect(result.allocatedPortions).toBe(0);
    expect(result.unallocatedPortions).toBe(donation.quantity);
    expect(result.eligibleMatches.length).toBe(0);
  });

  it("Flow Test G: Scenario I absorbs 1000 portions across network up to total capacity", () => {
    const scI = ROUND2_SCENARIOS.find((s) => s.id === "scenario-i")!;
    const don = createRound2Donation(now);
    const recs = createRound2Recipients(now);
    const { donation, recipients } = scI.apply(don, recs, now);

    const result = runRelayMatch(donation, recipients, DEFAULT_WEIGHTS, now);
    expect(result.totalDonationPortions).toBe(1000);
    expect(result.allocatedPortions).toBeGreaterThan(0);
    expect(result.allocatedPortions + result.unallocatedPortions).toBe(1000);
  });
});

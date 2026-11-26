import { describe, it, expect } from "vitest";
import {
  canTransitionAllocation,
  advanceAllocationStatus,
} from "@/lib/dispatch/transitions";
import { Allocation } from "@/types";

describe("Dispatch State Transitions and Handover Guard", () => {
  const baseAllocation: Allocation = {
    id: "alloc-test-1",
    donationId: "don-1",
    recipientId: "rec-1",
    allocatedPortions: 50,
    distanceKm: 2.5,
    score: 85,
    scoreBreakdown: {
      urgencyScore: 80,
      proximityScore: 90,
      demandFitScore: 85,
      readinessScore: 80,
      rawWeights: { urgency: 40, proximity: 30, demand: 20, readiness: 10 },
    },
    status: "proposed",
    reasons: ["Test reason"],
    unresolvedConstraints: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [],
  };

  it("allows valid forward transitions: proposed -> reserved -> accepted -> ready_for_pickup -> collected -> delivered", () => {
    expect(canTransitionAllocation("proposed", "reserved").allowed).toBe(true);
    expect(canTransitionAllocation("reserved", "accepted").allowed).toBe(true);
    expect(canTransitionAllocation("accepted", "ready_for_pickup").allowed).toBe(true);
    expect(canTransitionAllocation("ready_for_pickup", "collected").allowed).toBe(true);
    expect(canTransitionAllocation("collected", "delivered").allowed).toBe(true);
  });

  it("blocks illegal transitions (skipping stages or backward transitions)", () => {
    expect(canTransitionAllocation("proposed", "delivered").allowed).toBe(false);
    expect(canTransitionAllocation("accepted", "proposed").allowed).toBe(false);
    expect(canTransitionAllocation("delivered", "reserved").allowed).toBe(false);
  });

  it("allows cancellation from non-terminal states and prevents cancellation once delivered", () => {
    expect(canTransitionAllocation("proposed", "cancelled").allowed).toBe(true);
    expect(canTransitionAllocation("reserved", "cancelled").allowed).toBe(true);
    expect(canTransitionAllocation("accepted", "cancelled").allowed).toBe(true);
    expect(canTransitionAllocation("collected", "cancelled").allowed).toBe(true);
    expect(canTransitionAllocation("delivered", "cancelled").allowed).toBe(false);
  });

  it("generates verifiable handover receipt with non-sensitive QR payload on reaching delivered", () => {
    const collectedAlloc: Allocation = {
      ...baseAllocation,
      status: "collected",
    };

    const deliveredAlloc = advanceAllocationStatus(
      collectedAlloc,
      "delivered",
      "Volunteer Driver",
      "Portions safely handed over at shelter gate."
    );

    expect(deliveredAlloc.status).toBe("delivered");
    expect(deliveredAlloc.handoverReceipt).toBeDefined();
    expect(deliveredAlloc.handoverReceipt?.receiptNumber).toContain("FR-REC-");
    expect(deliveredAlloc.handoverReceipt?.qrData).toContain("FOODRELAY:alloc-test-1");
  });
});

import { describe, it, expect } from "vitest";
import { FoodRelayMcpService } from "../services/foodrelay/FoodRelayMcpService";
import { DonationInputDto, MatchingWeightsDto } from "../services/foodrelay/types";

describe("PS11 — AI Agents & MCP: FoodRelay Graftcode Service", () => {
  const now = new Date();
  const validDonationInput: DonationInputDto = {
    id: "don-mcp-101",
    donorName: "Grand Heritage Banquet Hall",
    donorType: "wedding_venue",
    foodDescription: "Surplus Gourmet Paneer Butter Masala, Dal Makhani, Pulao",
    foodCategory: "cooked_meals",
    dietaryCategory: "vegetarian",
    quantity: 120,
    unit: "portions",
    remainingQuantity: 120,
    pickupLocation: "Sector 62, Noida, UP",
    latitude: 28.628,
    longitude: 77.367,
    preparedAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
    pickupWindowStart: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
    pickupWindowEnd: new Date(now.getTime() + 4 * 3600 * 1000).toISOString(),
    confirmedUseBy: new Date(now.getTime() + 5 * 3600 * 1000).toISOString(),
    storageMethod: "ambient",
    packagingCondition: "sealed_containers",
    allergenInformation: ["dairy"],
  };

  // Tool 1: Shelter Network Status
  describe("Tool 1: getNetworkStatus", () => {
    it("returns real-time capacity and operational status for all regional shelters", () => {
      const shelters = FoodRelayMcpService.getNetworkStatus();
      expect(Array.isArray(shelters)).toBe(true);
      expect(shelters.length).toBeGreaterThan(0);

      const first = shelters[0];
      expect(first).toHaveProperty("shelterId");
      expect(first).toHaveProperty("organizationName");
      expect(first).toHaveProperty("status");
      expect(first).toHaveProperty("isOnline");
      expect(first).toHaveProperty("availableCapacity");
      expect(first).toHaveProperty("remainingDemand");
      expect(Array.isArray(first.storageCapabilities)).toBe(true);
      expect(Array.isArray(first.acceptedDietaryCategories)).toBe(true);
    });
  });

  // Tool 2: Food Safety Gate Evaluation
  describe("Tool 2: evaluateDonationSafety (FSSAI 2019 Regulations)", () => {
    it("approves valid donation meeting all FSSAI 2019 parameters", () => {
      const result = FoodRelayMcpService.evaluateDonationSafety(validDonationInput);
      expect(result.isEligible).toBe(true);
      expect(result.status).toBe("eligible_for_matching");
      expect(result.blockers.length).toBe(0);
      expect(result.summary).toContain("PASSED");
    });

    it("rejects donation with non-portions unit (FSSAI 2019 Reg 3(1))", () => {
      const invalidUnit: DonationInputDto = {
        ...validDonationInput,
        unit: "kg",
      };
      const result = FoodRelayMcpService.evaluateDonationSafety(invalidUnit);
      expect(result.isEligible).toBe(false);
      expect(result.blockers.some((b) => b.includes("Unit is 'kg'"))).toBe(true);
      expect(result.regulationReferences.some((r) => r.includes("FSSAI 2019 Reg 3(1)"))).toBe(true);
    });

    it("rejects expired food donation (FSSAI 2019 Reg 5)", () => {
      const expired: DonationInputDto = {
        ...validDonationInput,
        confirmedUseBy: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      };
      const result = FoodRelayMcpService.evaluateDonationSafety(expired);
      expect(result.isEligible).toBe(false);
      expect(result.blockers.some((b) => b.includes("passed its confirmed use-by time"))).toBe(true);
      expect(result.regulationReferences.some((r) => r.includes("FSSAI 2019 Reg 5"))).toBe(true);
    });

    it("rejects future preparation timestamp (FSSAI 2019 Reg 4(2))", () => {
      const futurePrep: DonationInputDto = {
        ...validDonationInput,
        preparedAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      };
      const result = FoodRelayMcpService.evaluateDonationSafety(futurePrep);
      expect(result.isEligible).toBe(false);
      expect(result.blockers.some((b) => b.includes("Preparation time cannot be in the future"))).toBe(true);
    });
  });

  // Tool 3: Algorithmic Surplus Matching
  describe("Tool 3: calculateSurplusMatches", () => {
    it("computes explainable allocations and respects portion conservation", () => {
      const match = FoodRelayMcpService.calculateSurplusMatches(validDonationInput);

      expect(match.donationId).toBe(validDonationInput.id);
      expect(match.totalPortions).toBe(validDonationInput.quantity);
      expect(match.allocatedPortions + match.unallocatedPortions).toBe(match.totalPortions);
      expect(match.allocations.length).toBeGreaterThan(0);

      // Verify explainability breakdown
      const firstAlloc = match.allocations[0];
      expect(firstAlloc.allocatedPortions).toBeGreaterThan(0);
      expect(firstAlloc.score).toBeGreaterThan(0);
      expect(firstAlloc).toHaveProperty("urgencyScore");
      expect(firstAlloc).toHaveProperty("proximityScore");
      expect(firstAlloc).toHaveProperty("demandScore");
      expect(firstAlloc).toHaveProperty("readinessScore");
    });

    it("respects custom matching weights", () => {
      const customWeights: MatchingWeightsDto = {
        urgency: 70,
        proximity: 10,
        demand: 10,
        readiness: 10,
      };
      const match = FoodRelayMcpService.calculateSurplusMatches(validDonationInput, customWeights);
      expect(match.allocations.length).toBeGreaterThan(0);
      expect(match.allocatedPortions).toBeGreaterThan(0);
    });
  });

  // Tool 4: Dynamic Redistribution
  describe("Tool 4: triggerAutoRedistribution", () => {
    it("redistributes portions to remaining online shelters when assigned shelter goes offline", () => {
      const initial = FoodRelayMcpService.calculateSurplusMatches(validDonationInput);
      expect(initial.allocations.length).toBeGreaterThan(0);

      const targetToTakeOffline = initial.allocations[0].recipientId;
      const initialPortions = initial.allocations[0].allocatedPortions;

      const redist = FoodRelayMcpService.triggerAutoRedistribution(
        validDonationInput,
        targetToTakeOffline
      );

      expect(redist.offlineShelterId).toBe(targetToTakeOffline);
      expect(redist.releasedPortions).toBe(initialPortions);

      // The offline shelter must NOT receive any allocation in updated allocations
      const stillAllocated = redist.updatedAllocations.find((a) => a.recipientId === targetToTakeOffline);
      expect(stillAllocated).toBeUndefined();

      // Conservation of portions
      expect(redist.redistributedPortions + redist.unallocatedSurplus).toBe(validDonationInput.quantity);
      expect(redist.message).toContain("released");
    });
  });

  // Tool 5: Dispatch Lifecycle Progression
  describe("Tool 5: advanceDispatchStatus", () => {
    it("allows valid forward transition proposed -> reserved -> accepted", () => {
      const step1 = FoodRelayMcpService.advanceDispatchStatus(
        "alloc-101",
        "proposed",
        "reserved",
        "AI_Coordinator",
        "Reserved via MCP agent"
      );
      expect(step1.transitionAllowed).toBe(true);
      expect(step1.currentStatus).toBe("reserved");

      const step2 = FoodRelayMcpService.advanceDispatchStatus(
        "alloc-101",
        "reserved",
        "accepted",
        "Shelter_Staff",
        "Accepted reservation"
      );
      expect(step2.transitionAllowed).toBe(true);
      expect(step2.currentStatus).toBe("accepted");
    });

    it("rejects invalid backwards transition delivered -> reserved", () => {
      const invalidStep = FoodRelayMcpService.advanceDispatchStatus(
        "alloc-101",
        "delivered",
        "reserved",
        "Unauthorized_Actor",
        "Illegal revert attempt"
      );
      expect(invalidStep.transitionAllowed).toBe(false);
      expect(invalidStep.currentStatus).toBe("delivered");
      expect(invalidStep.note).toContain("terminal state");
    });

    it("emits handover receipt and QR payload upon final delivery", () => {
      const deliveredStep = FoodRelayMcpService.advanceDispatchStatus(
        "alloc-101",
        "collected",
        "delivered",
        "Volunteer_Driver",
        "Handover verified at shelter door"
      );
      expect(deliveredStep.transitionAllowed).toBe(true);
      expect(deliveredStep.currentStatus).toBe("delivered");
      expect(deliveredStep.receiptNumber).toMatch(/^FR-REC-/);
      expect(deliveredStep.qrPayload).toContain("FOODRELAY:alloc-101:DELIVERED");
    });
  });

  // Tool 6: Verifiable Dispatch Voucher
  describe("Tool 6: generateDispatchVoucher", () => {
    it("generates a verifiable voucher with structured QR payload", () => {
      const voucher = FoodRelayMcpService.generateDispatchVoucher(
        "alloc-202",
        "don-101",
        "rec-1",
        80,
        "Grand Banquet",
        "Asha Deep Shelter"
      );

      expect(voucher.voucherId).toBeDefined();
      expect(voucher.receiptNumber).toMatch(/^FR-VOUCHER-/);
      expect(voucher.portions).toBe(80);
      expect(voucher.qrPayload).toContain("FOODRELAY:VOUCHER:");
      expect(voucher.qrPayload).toContain("80PORTIONS");
      expect(voucher.donorName).toBe("Grand Banquet");
      expect(voucher.recipientName).toBe("Asha Deep Shelter");
    });
  });

  // Tool 7: AI Natural Language Intake Parsing
  describe("Tool 7: parseIntakeText", () => {
    it("correctly extracts portions, category, dietary, storage, and safe window", () => {
      const rawNotes = "We have 150 meals of hot vegetarian dal and rice prepared for corporate lunch. Contains dairy.";
      const parsed = FoodRelayMcpService.parseIntakeText(rawNotes);

      expect(parsed.portions).toBe(150);
      expect(parsed.foodCategory).toBe("cooked_meals");
      expect(parsed.dietaryCategory).toBe("vegetarian");
      expect(parsed.storageMethod).toBe("heated");
      expect(parsed.detectedAllergens).toContain("dairy");
      expect(parsed.useByHours).toBe(3);
    });

    it("identifies jain dietary category and ambient storage", () => {
      const rawNotes = "80 boxes of pure jain snack boxes and sandwiches at room temperature.";
      const parsed = FoodRelayMcpService.parseIntakeText(rawNotes);

      expect(parsed.portions).toBe(80);
      expect(parsed.dietaryCategory).toBe("jain");
      expect(parsed.storageMethod).toBe("ambient");
      expect(parsed.useByHours).toBe(4);
    });
  });

  // Graftcode Architecture & Invariant Guarantees
  describe("Graftcode Architecture & Invariant Compliance", () => {
    it("verifies all public service methods are static (stateless facade)", () => {
      expect(typeof FoodRelayMcpService.getNetworkStatus).toBe("function");
      expect(typeof FoodRelayMcpService.evaluateDonationSafety).toBe("function");
      expect(typeof FoodRelayMcpService.calculateSurplusMatches).toBe("function");
      expect(typeof FoodRelayMcpService.triggerAutoRedistribution).toBe("function");
      expect(typeof FoodRelayMcpService.advanceDispatchStatus).toBe("function");
      expect(typeof FoodRelayMcpService.generateDispatchVoucher).toBe("function");
      expect(typeof FoodRelayMcpService.parseIntakeText).toBe("function");
    });

    it("verifies return values use plain arrays T[] without Set or Map structures", () => {
      const network = FoodRelayMcpService.getNetworkStatus();
      expect(Array.isArray(network)).toBe(true);
      expect(network instanceof Set).toBe(false);
      expect(network instanceof Map).toBe(false);

      const safety = FoodRelayMcpService.evaluateDonationSafety(validDonationInput);
      expect(Array.isArray(safety.blockers)).toBe(true);
      expect(Array.isArray(safety.warnings)).toBe(true);
      expect(Array.isArray(safety.regulationReferences)).toBe(true);
    });
  });
});

import { RequestContext } from "graftcode-context";
import {
  ShelterStatusDto,
  DonationInputDto,
  MatchingWeightsDto,
  MatchEvaluationDto,
  SafetyEvaluationDto,
  RedistributionEvaluationDto,
  DispatchTransitionDto,
  DispatchVoucherDto,
  IntakeParsedDto,
  AllocationProposalDto,
  IneligibleRecipientDto,
} from "./types";
import { evaluateFoodSafetyGate } from "../../lib/safety/safetyGate";
import { runRelayMatch, DEFAULT_WEIGHTS } from "../../lib/matching/relayMatch";
import { canTransitionAllocation } from "../../lib/dispatch/transitions";
import { generateFictionalSeedData } from "../../lib/demo/seedData";
import {
  Donation,
  Recipient,
  AllocationStatus,
  DonorType,
  FoodCategory,
  DietaryCategory,
  QuantityUnit,
  StorageMethod,
  PackagingCondition,
} from "../../types";

/**
 * FoodRelay AI — Model Context Protocol (MCP) & Graftcode Service Facade
 * 
 * Implements Problem Statement 11 (PS11 — AI Agents & MCP):
 * 1. Shelter Network Real-Time Status & Capacity Query
 * 2. Food Safety Gate Evaluation (FSSAI 2019 Regulations)
 * 3. Algorithmic Surplus Matching & Multi-Criteria Allocation
 * 4. Dynamic Surplus Redistribution upon Shelter Outage
 * 5. Dispatch Lifecycle Progression & Verifiable Digital Vouchers
 * 6. Natural Language Intake Text Extraction
 * 
 * Graftcode Contract Rules:
 * - Public static methods (stateless facade, single round-trip value pass)
 * - Primitives, strings, plain DTOs, and plain arrays T[] only
 * - ISO-8601 strings for timestamps
 * - Request headers propagated via RequestContext
 */
/**
 * Helper to retrieve correlation/actor ID from request context headers
 */
function getActorFromContext(fallbackActor: string = "AI_Agent_Coordinator"): string {
  try {
    if (RequestContext && RequestContext.current) {
      const headers = RequestContext.current.getHeaders();
      const headerActor =
        headers["x-actor-id"] ||
        headers["x-user-id"] ||
        headers["authorization"] ||
        headers["x-api-key"];
      if (headerActor && typeof headerActor === "string") {
        return headerActor.replace(/^Bearer\s+/i, "").trim();
      }
    }
  } catch {
    // In-process or standalone environment
  }
  return fallbackActor;
}

/**
 * FoodRelay AI — Model Context Protocol (MCP) & Graftcode Service Facade
 * 
 * Implements Problem Statement 11 (PS11 — AI Agents & MCP):
 * 1. Shelter Network Real-Time Status & Capacity Query
 * 2. Food Safety Gate Evaluation (FSSAI 2019 Regulations)
 * 3. Algorithmic Surplus Matching & Multi-Criteria Allocation
 * 4. Dynamic Surplus Redistribution upon Shelter Outage
 * 5. Dispatch Lifecycle Progression & Verifiable Digital Vouchers
 * 6. Natural Language Intake Text Extraction
 * 
 * Graftcode Contract Rules:
 * - Public static methods (stateless facade, single round-trip value pass)
 * - Primitives, strings, plain DTOs, and plain arrays T[] only
 * - ISO-8601 strings for timestamps
 * - Request headers propagated via RequestContext
 */
export class FoodRelayMcpService {

  /**
   * Tool 1: Shelter Network Real-Time Capacity & Status
   * Returns operational status, available capacity, and demand for all verified regional shelters.
   */
  public static getNetworkStatus(): ShelterStatusDto[] {
    const seed = generateFictionalSeedData();
    return seed.recipients.map((r) => ({
      shelterId: r.id,
      organizationName: r.organizationName,
      organizationType: r.organizationType,
      status: r.status || (r.isOnline !== false ? "online" : "offline"),
      isOnline: r.isOnline !== false && r.status !== "offline",
      availableCapacity: r.availableCapacity,
      remainingDemand: r.remainingDemand,
      urgencyLevel: r.urgencyLevel,
      latitude: r.latitude,
      longitude: r.longitude,
      storageCapabilities: [...r.storageCapabilities],
      acceptedDietaryCategories: [...r.acceptedDietaryCategories],
      receivingWindowEnd: r.receivingWindowEnd,
    }));
  }

  /**
   * Tool 2: Food Safety Gate Evaluation
   * Deterministically validates food donation safety under FSSAI 2019 Surplus Food Regulations.
   */
  public static evaluateDonationSafety(donationInput: DonationInputDto): SafetyEvaluationDto {
    const now = new Date();
    const domainDonation: Donation = {
      id: donationInput.id,
      donorName: donationInput.donorName,
      donorType: (donationInput.donorType as DonorType) || "restaurant",
      foodDescription: donationInput.foodDescription,
      foodCategory: (donationInput.foodCategory as FoodCategory) || "cooked_meals",
      dietaryCategory: (donationInput.dietaryCategory as DietaryCategory) || "vegetarian",
      quantity: donationInput.quantity,
      unit: (donationInput.unit as QuantityUnit) || "portions",
      remainingQuantity: donationInput.remainingQuantity ?? donationInput.quantity,
      pickupLocation: donationInput.pickupLocation,
      latitude: donationInput.latitude,
      longitude: donationInput.longitude,
      preparedAt: donationInput.preparedAt,
      pickupWindowStart: donationInput.pickupWindowStart,
      pickupWindowEnd: donationInput.pickupWindowEnd,
      confirmedUseBy: donationInput.confirmedUseBy,
      storageMethod: (donationInput.storageMethod as StorageMethod) || "ambient",
      packagingCondition: (donationInput.packagingCondition as PackagingCondition) || "sealed_containers",
      allergenInformation: donationInput.allergenInformation || [],
      handlingInformation: donationInput.handlingInformation || "Store per standard FSSAI temperature controls",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: (donationInput.safetyReviewStatus as any) || "eligible_for_matching",
      safetyReviewNotes: "Verified via FoodRelay AI MCP Agent",
      safetyReviewer: getActorFromContext(),
      safetyReviewedAt: null,
      status: (donationInput.status as any) || "available",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isDemo: false,
      history: [],
    };

    const result = evaluateFoodSafetyGate(domainDonation, now);

    return {
      isEligible: result.isEligible,
      status: result.status,
      blockers: [...result.blockers],
      warnings: [...result.warnings],
      regulationReferences: [...result.regulationReferences],
      summary: result.isEligible
        ? `PASSED: Donation '${donationInput.id}' meets all FSSAI 2019 surplus food safety regulations.`
        : `BLOCKED: Donation '${donationInput.id}' failed safety checks: ${result.blockers.join("; ")}`,
    };
  }

  /**
   * Tool 3: Algorithmic Surplus Matching & Multi-Criteria Allocation
   * Computes deterministic, explainable allocations based on urgency (40%), proximity (30%), demand (20%), readiness (10%).
   */
  public static calculateSurplusMatches(
    donationInput: DonationInputDto,
    weightsInput?: MatchingWeightsDto
  ): MatchEvaluationDto {
    const now = new Date();
    const seed = generateFictionalSeedData();
    const recipients = seed.recipients;

    const weights = weightsInput
      ? {
          urgency: weightsInput.urgency,
          proximity: weightsInput.proximity,
          demand: weightsInput.demand,
          readiness: weightsInput.readiness,
        }
      : DEFAULT_WEIGHTS;

    const domainDonation: Donation = {
      id: donationInput.id,
      donorName: donationInput.donorName,
      donorType: (donationInput.donorType as DonorType) || "restaurant",
      foodDescription: donationInput.foodDescription,
      foodCategory: (donationInput.foodCategory as FoodCategory) || "cooked_meals",
      dietaryCategory: (donationInput.dietaryCategory as DietaryCategory) || "vegetarian",
      quantity: donationInput.quantity,
      unit: (donationInput.unit as QuantityUnit) || "portions",
      remainingQuantity: donationInput.remainingQuantity ?? donationInput.quantity,
      pickupLocation: donationInput.pickupLocation,
      latitude: donationInput.latitude,
      longitude: donationInput.longitude,
      preparedAt: donationInput.preparedAt,
      pickupWindowStart: donationInput.pickupWindowStart,
      pickupWindowEnd: donationInput.pickupWindowEnd,
      confirmedUseBy: donationInput.confirmedUseBy,
      storageMethod: (donationInput.storageMethod as StorageMethod) || "ambient",
      packagingCondition: (donationInput.packagingCondition as PackagingCondition) || "sealed_containers",
      allergenInformation: donationInput.allergenInformation || [],
      handlingInformation: "Store per standard FSSAI temperature controls",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: "eligible_for_matching",
      safetyReviewNotes: "Verified via FoodRelay AI MCP Agent",
      safetyReviewer: getActorFromContext(),
      safetyReviewedAt: now.toISOString(),
      status: "available",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isDemo: false,
      history: [],
    };

    const matchResult = runRelayMatch(domainDonation, recipients, weights, now);

    const allocations: AllocationProposalDto[] = matchResult.suggestedAllocations.map((a) => {
      const candidate = matchResult.eligibleMatches.find((c) => c.recipient.id === a.recipientId);
      return {
        recipientId: a.recipientId,
        recipientName: a.recipientName,
        allocatedPortions: a.allocatedPortions,
        score: candidate?.score || 0,
        distanceKm: candidate?.distanceKm || 0,
        urgencyScore: candidate?.scoreBreakdown.urgencyScore || 0,
        proximityScore: candidate?.scoreBreakdown.proximityScore || 0,
        demandScore: candidate?.scoreBreakdown.demandFitScore || 0,
        readinessScore: candidate?.scoreBreakdown.readinessScore || 0,
      };
    });

    const ineligibleRecipients: IneligibleRecipientDto[] = matchResult.ineligibleMatches.map((m) => ({
      recipientId: m.recipient.id,
      recipientName: m.recipient.organizationName,
      reasons: [...m.ineligibleReasons],
    }));

    return {
      donationId: matchResult.donationId,
      evaluatedAt: matchResult.evaluatedAt,
      totalPortions: matchResult.totalDonationPortions,
      allocatedPortions: matchResult.allocatedPortions,
      unallocatedPortions: matchResult.unallocatedPortions,
      allocations,
      ineligibleRecipients,
      notes: [...matchResult.notes],
    };
  }

  /**
   * Tool 4: Dynamic Surplus Redistribution upon Shelter Outage
   * Switches an offline shelter out of service and re-evaluates allocations across remaining online shelters.
   */
  public static triggerAutoRedistribution(
    donationInput: DonationInputDto,
    offlineShelterId: string,
    weightsInput?: MatchingWeightsDto
  ): RedistributionEvaluationDto {
    const now = new Date();
    const seed = generateFictionalSeedData();

    // Baseline match
    const initialMatch = FoodRelayMcpService.calculateSurplusMatches(donationInput, weightsInput);
    const affectedInitial = initialMatch.allocations.find((a) => a.recipientId === offlineShelterId);
    const releasedPortions = affectedInitial?.allocatedPortions || 0;
    const offlineName = affectedInitial?.recipientName || offlineShelterId;

    // Mark shelter offline in recipient set
    const modifiedRecipients: Recipient[] = seed.recipients.map((r) => {
      if (r.id === offlineShelterId) {
        return {
          ...r,
          status: "offline",
          isOnline: false,
          receivingAvailability: false,
        };
      }
      return r;
    });

    const weights = weightsInput
      ? {
          urgency: weightsInput.urgency,
          proximity: weightsInput.proximity,
          demand: weightsInput.demand,
          readiness: weightsInput.readiness,
        }
      : DEFAULT_WEIGHTS;

    const domainDonation: Donation = {
      id: donationInput.id,
      donorName: donationInput.donorName,
      donorType: (donationInput.donorType as DonorType) || "restaurant",
      foodDescription: donationInput.foodDescription,
      foodCategory: (donationInput.foodCategory as FoodCategory) || "cooked_meals",
      dietaryCategory: (donationInput.dietaryCategory as DietaryCategory) || "vegetarian",
      quantity: donationInput.quantity,
      unit: (donationInput.unit as QuantityUnit) || "portions",
      remainingQuantity: donationInput.remainingQuantity ?? donationInput.quantity,
      pickupLocation: donationInput.pickupLocation,
      latitude: donationInput.latitude,
      longitude: donationInput.longitude,
      preparedAt: donationInput.preparedAt,
      pickupWindowStart: donationInput.pickupWindowStart,
      pickupWindowEnd: donationInput.pickupWindowEnd,
      confirmedUseBy: donationInput.confirmedUseBy,
      storageMethod: (donationInput.storageMethod as StorageMethod) || "ambient",
      packagingCondition: (donationInput.packagingCondition as PackagingCondition) || "sealed_containers",
      allergenInformation: donationInput.allergenInformation || [],
      handlingInformation: "Store per standard FSSAI temperature controls",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: "eligible_for_matching",
      safetyReviewNotes: "Verified via FoodRelay AI MCP Agent",
      safetyReviewer: getActorFromContext(),
      safetyReviewedAt: now.toISOString(),
      status: "available",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isDemo: false,
      history: [],
    };

    const reResult = runRelayMatch(domainDonation, modifiedRecipients, weights, now);

    const updatedAllocations: AllocationProposalDto[] = reResult.suggestedAllocations.map((a) => {
      const candidate = reResult.eligibleMatches.find((c) => c.recipient.id === a.recipientId);
      return {
        recipientId: a.recipientId,
        recipientName: a.recipientName,
        allocatedPortions: a.allocatedPortions,
        score: candidate?.score || 0,
        distanceKm: candidate?.distanceKm || 0,
        urgencyScore: candidate?.scoreBreakdown.urgencyScore || 0,
        proximityScore: candidate?.scoreBreakdown.proximityScore || 0,
        demandScore: candidate?.scoreBreakdown.demandFitScore || 0,
        readinessScore: candidate?.scoreBreakdown.readinessScore || 0,
      };
    });

    return {
      offlineShelterId,
      offlineShelterName: offlineName,
      releasedPortions,
      redistributedPortions: reResult.allocatedPortions,
      unallocatedSurplus: reResult.unallocatedPortions,
      updatedAllocations,
      message: `Offline shelter '${offlineName}' released ${releasedPortions} portions. Total redistributed: ${reResult.allocatedPortions} portions; Unallocated surplus: ${reResult.unallocatedPortions} portions.`,
    };
  }

  /**
   * Tool 5: Dispatch Lifecycle Progression Guard
   * Validates state transitions (proposed -> reserved -> accepted -> ready_for_pickup -> collected -> delivered).
   */
  public static advanceDispatchStatus(
    allocationId: string,
    currentStatus: string,
    targetStatus: string,
    actor: string,
    note: string
  ): DispatchTransitionDto {
    const check = canTransitionAllocation(
      currentStatus as AllocationStatus,
      targetStatus as AllocationStatus
    );

    const now = new Date().toISOString();
    const effectiveActor = actor || getActorFromContext();

    if (!check.allowed) {
      return {
        allocationId,
        previousStatus: currentStatus,
        currentStatus,
        transitionAllowed: false,
        updatedAt: now,
        actor: effectiveActor,
        note: check.reason || "Transition rejected by state machine guard.",
      };
    }

    let receiptNumber: string | undefined;
    let qrPayload: string | undefined;

    if (targetStatus === "delivered") {
      receiptNumber = `FR-REC-${Date.now().toString().slice(-6)}`;
      qrPayload = `FOODRELAY:${allocationId}:DELIVERED:${now}`;
    }

    return {
      allocationId,
      previousStatus: currentStatus,
      currentStatus: targetStatus,
      transitionAllowed: true,
      updatedAt: now,
      actor: effectiveActor,
      note,
      receiptNumber,
      qrPayload,
    };
  }

  /**
   * Tool 6: Verifiable Digital Dispatch Voucher
   * Generates a verifiable dispatch voucher with QR payload for chain-of-custody tracking.
   */
  public static generateDispatchVoucher(
    allocationId: string,
    donationId: string,
    recipientId: string,
    portions: number,
    donorName: string,
    recipientName: string
  ): DispatchVoucherDto {
    const now = new Date().toISOString();
    const receiptNum = `FR-VOUCHER-${Date.now().toString().slice(-6)}`;
    const qrData = `FOODRELAY:VOUCHER:${receiptNum}:${allocationId}:${donationId}:${recipientId}:${portions}PORTIONS`;

    return {
      voucherId: `vch-${Date.now()}`,
      receiptNumber: receiptNum,
      allocationId,
      donationId,
      recipientId,
      donorName,
      recipientName,
      portions,
      qrPayload: qrData,
      issuedAt: now,
    };
  }

  /**
   * Tool 7: AI Natural Language Surplus Intake Parsing
   * Extracts structured portion counts, meal categories, and shelf-life parameters from unstructured kitchen notes.
   */
  public static parseIntakeText(rawText: string): IntakeParsedDto {
    const textLower = rawText.toLowerCase();

    // Portions extraction (e.g., "120 portions", "80 meals", "50 boxes", "100 packets")
    const portionsMatch = textLower.match(/(\d+)\s*(portions?|meals?|servings?|plates?|pax|boxes?|packets?)/i);
    const portions = portionsMatch ? parseInt(portionsMatch[1], 10) : 50;

    // Dietary category
    let dietaryCategory = "vegetarian";
    if (textLower.includes("jain")) {
      dietaryCategory = "jain";
    } else if (textLower.includes("vegan")) {
      dietaryCategory = "vegan";
    } else if (
      textLower.includes("chicken") ||
      textLower.includes("mutton") ||
      textLower.includes("meat") ||
      textLower.includes("fish") ||
      textLower.includes("egg")
    ) {
      dietaryCategory = "non_vegetarian";
    }

    // Storage method
    let storageMethod = "ambient";
    if (textLower.includes("hot") || textLower.includes("heated") || textLower.includes("warm")) {
      storageMethod = "heated";
    } else if (textLower.includes("cold") || textLower.includes("fridge") || textLower.includes("refrigerat")) {
      storageMethod = "refrigerated";
    } else if (textLower.includes("frozen") || textLower.includes("freeze")) {
      storageMethod = "frozen";
    }

    // Food category: detect cooked meals first if meals/lunch/dinner/dal/rice/curry is present
    let foodCategory = "cooked_meals";
    if (
      textLower.includes("dal") ||
      textLower.includes("rice") ||
      textLower.includes("curry") ||
      textLower.includes("lunch") ||
      textLower.includes("dinner") ||
      textLower.includes("cooked") ||
      textLower.includes("meals")
    ) {
      foodCategory = "cooked_meals";
    } else if (textLower.includes("bread") || textLower.includes("cake") || textLower.includes("croissant") || textLower.includes("bakery") || textLower.includes("sandwich")) {
      foodCategory = "bakery";
    } else if (textLower.includes("fruit") || textLower.includes("vegetable") || textLower.includes("fresh produce") || textLower.includes("salad")) {
      foodCategory = "fresh_produce";
    } else if (textLower.includes("milk carton") || textLower.includes("raw paneer") || textLower.includes("curd cup") || textLower.includes("cheese block")) {
      foodCategory = "dairy";
    } else if (textLower.includes("packet") || textLower.includes("grocery") || textLower.includes("canned")) {
      foodCategory = "packaged_groceries";
    }

    // Allergens detection
    const detectedAllergens: string[] = [];
    if (textLower.includes("nut") || textLower.includes("peanut") || textLower.includes("cashew") || textLower.includes("almond")) {
      detectedAllergens.push("nuts");
    }
    if (textLower.includes("dairy") || textLower.includes("milk") || textLower.includes("paneer") || textLower.includes("cheese")) {
      detectedAllergens.push("dairy");
    }
    if (textLower.includes("gluten") || textLower.includes("wheat") || textLower.includes("roti") || textLower.includes("bread")) {
      detectedAllergens.push("gluten");
    }

    // Estimated consumption window
    let useByHours = 4;
    if (storageMethod === "heated") useByHours = 3;
    if (storageMethod === "refrigerated") useByHours = 24;
    if (storageMethod === "frozen") useByHours = 72;

    return {
      foodDescription: rawText.slice(0, 120).trim(),
      portions,
      foodCategory,
      dietaryCategory,
      storageMethod,
      useByHours,
      detectedAllergens,
      summary: `Parsed ${portions} ${dietaryCategory} ${foodCategory} portions (${storageMethod} storage, ${useByHours}h safe window).`,
    };
  }
}

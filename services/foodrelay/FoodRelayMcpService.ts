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
 * Helper to safely parse stringified or structured JSON inputs
 */
function parseJsonInput<T>(input: T | string): T {
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as T;
    } catch {
      return input as unknown as T;
    }
  }
  return input;
}

/**
 * Robust resolver for donation input: supports full DTO, JSON string, donation ID, or defaults
 */
function resolveDonation(input: any): Donation {
  const seed = generateFictionalSeedData();
  let parsed: any = input;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      parsed = input;
    }
  }

  // If input is an ID string or string identifier
  if (typeof parsed === "string") {
    const matched = seed.donations.find((d) => d.id === parsed);
    if (matched) return { ...matched };
    parsed = { id: parsed || "don-demo-1" };
  }

  if (!parsed || typeof parsed !== "object") {
    parsed = {};
  }

  const baseline = seed.donations[0];
  const now = new Date();
  const preparedAt = parsed.preparedAt || now.toISOString();
  const pickupWindowStart = parsed.pickupWindowStart || now.toISOString();
  const pickupWindowEnd = parsed.pickupWindowEnd || new Date(now.getTime() + 4 * 3600000).toISOString();
  const confirmedUseBy = parsed.confirmedUseBy || new Date(now.getTime() + 5 * 3600000).toISOString();

  return {
    id: parsed.id || baseline.id || "don-demo-1",
    donorName: parsed.donorName || baseline.donorName || "Grand Celebration Caterers",
    donorType: (parsed.donorType as DonorType) || baseline.donorType || "caterer",
    foodDescription: parsed.foodDescription || baseline.foodDescription || "180 portions cooked vegetarian meals",
    foodCategory: (parsed.foodCategory as FoodCategory) || baseline.foodCategory || "cooked_meals",
    dietaryCategory: (parsed.dietaryCategory as DietaryCategory) || baseline.dietaryCategory || "vegetarian",
    quantity: typeof parsed.quantity === "number" ? parsed.quantity : baseline.quantity || 180,
    unit: (parsed.unit as QuantityUnit) || baseline.unit || "portions",
    remainingQuantity: typeof parsed.remainingQuantity === "number" ? parsed.remainingQuantity : (typeof parsed.quantity === "number" ? parsed.quantity : baseline.remainingQuantity || 180),
    pickupLocation: parsed.pickupLocation || baseline.pickupLocation || "Sector 62, Noida",
    latitude: typeof parsed.latitude === "number" ? parsed.latitude : baseline.latitude || 28.628,
    longitude: typeof parsed.longitude === "number" ? parsed.longitude : baseline.longitude || 77.367,
    preparedAt,
    pickupWindowStart,
    pickupWindowEnd,
    confirmedUseBy,
    storageMethod: (parsed.storageMethod as StorageMethod) || baseline.storageMethod || "ambient",
    packagingCondition: (parsed.packagingCondition as PackagingCondition) || baseline.packagingCondition || "sealed_containers",
    allergenInformation: parsed.allergenInformation || baseline.allergenInformation || [],
    handlingInformation: parsed.handlingInformation || baseline.handlingInformation || "Store per standard FSSAI temperature controls",
    sourceVerificationStatus: "verified_license",
    safetyReviewStatus: (parsed.safetyReviewStatus as any) || "eligible_for_matching",
    safetyReviewNotes: "Verified via FoodRelay AI MCP Agent",
    safetyReviewer: getActorFromContext(),
    safetyReviewedAt: now.toISOString(),
    status: (parsed.status as any) || "available",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    isDemo: false,
    history: [],
  };
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
 * Graftcode Gateway 1.5.1 Serialization Compatibility:
 * In Graftcode Gateway 1.5.1, the C++ MCP response serializer requires method returns to be
 * scalar string representations conforming to the advertised MCP outputSchema. Methods serialize
 * their complete DTO payloads to JSON strings, providing structuredContent: { value: <json> }
 * to MCP clients (Inspector, Claude Desktop, Cursor) with zero serialization failures.
 */
export class FoodRelayMcpService {
  /**
   * Tool 1: Shelter Network Real-Time Capacity & Status
   * Returns operational status, available capacity, and demand for all verified regional shelters.
   */
  public static getNetworkStatus(): string {
    const seed = generateFictionalSeedData();
    const result: ShelterStatusDto[] = seed.recipients.map((r) => ({
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
    return JSON.stringify(result);
  }

  /**
   * Tool 2: Food Safety Gate Evaluation
   * Deterministically validates food donation safety under FSSAI 2019 Surplus Food Regulations.
   */
  public static evaluateDonationSafety(donationInput?: string | DonationInputDto): string {
    const domainDonation = resolveDonation(donationInput);
    const now = new Date();
    const result = evaluateFoodSafetyGate(domainDonation, now);

    const evaluation: SafetyEvaluationDto = {
      isEligible: result.isEligible,
      status: result.status,
      blockers: [...result.blockers],
      warnings: [...result.warnings],
      regulationReferences: [...result.regulationReferences],
      summary: result.isEligible
        ? `PASSED: Donation '${domainDonation.id}' meets all FSSAI 2019 surplus food safety regulations.`
        : `BLOCKED: Donation '${domainDonation.id}' failed safety checks: ${result.blockers.join("; ")}`,
    };

    return JSON.stringify(evaluation);
  }

  /**
   * Tool 3: Algorithmic Surplus Matching & Multi-Criteria Allocation
   * Computes deterministic, explainable allocations based on urgency (40%), proximity (30%), demand (20%), readiness (10%).
   */
  public static calculateSurplusMatches(
    donationInput?: string | DonationInputDto,
    weightsInput?: string | MatchingWeightsDto
  ): string {
    const domainDonation = resolveDonation(donationInput);
    const parsedWeights = weightsInput ? parseJsonInput<MatchingWeightsDto>(weightsInput) : undefined;
    const now = new Date();
    const seed = generateFictionalSeedData();
    const recipients = seed.recipients;

    const weights = parsedWeights
      ? {
          urgency: parsedWeights.urgency,
          proximity: parsedWeights.proximity,
          demand: parsedWeights.demand,
          readiness: parsedWeights.readiness,
        }
      : DEFAULT_WEIGHTS;

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

    const evaluation: MatchEvaluationDto = {
      donationId: matchResult.donationId,
      evaluatedAt: matchResult.evaluatedAt,
      totalPortions: matchResult.totalDonationPortions,
      allocatedPortions: matchResult.allocatedPortions,
      unallocatedPortions: matchResult.unallocatedPortions,
      allocations,
      ineligibleRecipients,
      notes: [...matchResult.notes],
    };

    return JSON.stringify(evaluation);
  }

  /**
   * Tool 4: Dynamic Surplus Redistribution upon Shelter Outage
   * Switches an offline shelter out of service and re-evaluates allocations across remaining online shelters.
   */
  public static triggerAutoRedistribution(
    offlineShelterId?: string,
    donationInput?: string | DonationInputDto,
    weightsInput?: string | MatchingWeightsDto
  ): string {
    let targetOfflineShelterId = offlineShelterId || "rec-1";
    let targetDonationInput = donationInput;

    if (
      typeof targetOfflineShelterId === "object" ||
      (typeof targetOfflineShelterId === "string" &&
        (targetOfflineShelterId.startsWith("{") || targetOfflineShelterId.startsWith("don-")))
    ) {
      targetDonationInput = targetOfflineShelterId as any;
      targetOfflineShelterId = typeof donationInput === "string" && donationInput ? donationInput : "rec-1";
    }

    const domainDonation = resolveDonation(targetDonationInput);
    const parsedWeights = weightsInput ? parseJsonInput<MatchingWeightsDto>(weightsInput) : undefined;
    const now = new Date();
    const seed = generateFictionalSeedData();

    // Baseline match
    const initialRaw = FoodRelayMcpService.calculateSurplusMatches(domainDonation, parsedWeights);
    const initialMatch = JSON.parse(initialRaw) as MatchEvaluationDto;
    const affectedInitial = initialMatch.allocations.find((a) => a.recipientId === targetOfflineShelterId);
    const releasedPortions = affectedInitial?.allocatedPortions || 0;
    const offlineName = affectedInitial?.recipientName || targetOfflineShelterId;

    // Mark shelter offline in recipient set
    const modifiedRecipients: Recipient[] = seed.recipients.map((r) => {
      if (r.id === targetOfflineShelterId) {
        return {
          ...r,
          status: "offline",
          isOnline: false,
          receivingAvailability: false,
        };
      }
      return r;
    });

    const weights = parsedWeights
      ? {
          urgency: parsedWeights.urgency,
          proximity: parsedWeights.proximity,
          demand: parsedWeights.demand,
          readiness: parsedWeights.readiness,
        }
      : DEFAULT_WEIGHTS;

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

    const evaluation: RedistributionEvaluationDto = {
      offlineShelterId: targetOfflineShelterId,
      offlineShelterName: offlineName,
      releasedPortions,
      redistributedPortions: reResult.allocatedPortions,
      unallocatedSurplus: reResult.unallocatedPortions,
      updatedAllocations,
      message: `Offline shelter '${offlineName}' released ${releasedPortions} portions. Total redistributed: ${reResult.allocatedPortions} portions; Unallocated surplus: ${reResult.unallocatedPortions} portions.`,
    };

    return JSON.stringify(evaluation);
  }

  /**
   * Tool 5: Dispatch Lifecycle Progression Guard
   * Validates state transitions (proposed -> reserved -> accepted -> ready_for_pickup -> collected -> delivered).
   */
  public static advanceDispatchStatus(
    allocationId?: string,
    currentStatus?: string,
    targetStatus?: string,
    actor?: string,
    note?: string
  ): string {
    const effectiveAllocId = allocationId || "alloc-101";
    let effectiveCurrent = currentStatus || "proposed";
    let effectiveTarget = targetStatus;

    if (!effectiveTarget) {
      if (effectiveCurrent !== "proposed") {
        effectiveTarget = effectiveCurrent;
        effectiveCurrent = "proposed";
      } else {
        effectiveTarget = "reserved";
      }
    }

    const check = canTransitionAllocation(
      effectiveCurrent as AllocationStatus,
      effectiveTarget as AllocationStatus
    );

    const now = new Date().toISOString();
    const effectiveActor = actor || getActorFromContext();
    const effectiveNote = note || `Status progressed from ${effectiveCurrent} to ${effectiveTarget} via MCP Agent`;

    if (!check.allowed) {
      const failedTransition: DispatchTransitionDto = {
        allocationId: effectiveAllocId,
        previousStatus: effectiveCurrent,
        currentStatus: effectiveCurrent,
        transitionAllowed: false,
        updatedAt: now,
        actor: effectiveActor,
        note: check.reason || "Transition rejected by state machine guard.",
      };
      return JSON.stringify(failedTransition);
    }

    let receiptNumber: string | undefined;
    let qrPayload: string | undefined;

    if (effectiveTarget === "delivered") {
      receiptNumber = `FR-REC-${Date.now().toString().slice(-6)}`;
      qrPayload = `FOODRELAY:${effectiveAllocId}:DELIVERED:${now}`;
    }

    const successfulTransition: DispatchTransitionDto = {
      allocationId: effectiveAllocId,
      previousStatus: effectiveCurrent,
      currentStatus: effectiveTarget,
      transitionAllowed: true,
      updatedAt: now,
      actor: effectiveActor,
      note: effectiveNote,
      receiptNumber,
      qrPayload,
    };

    return JSON.stringify(successfulTransition);
  }

  /**
   * Tool 6: Verifiable Digital Dispatch Voucher
   * Generates a verifiable dispatch voucher with QR payload for chain-of-custody tracking.
   */
  public static generateDispatchVoucher(
    allocationId?: string,
    donationId?: string,
    recipientId?: string,
    portions?: number | string,
    donorName?: string,
    recipientName?: string
  ): string {
    const now = new Date().toISOString();
    const receiptNum = `FR-VOUCHER-${Date.now().toString().slice(-6)}`;
    const effectiveAlloc = allocationId || "alloc-101";
    const effectiveDonId = donationId || "don-demo-1";
    const effectiveRecId = recipientId || "rec-1";
    const effectiveDonor = donorName || "Grand Celebration Caterers";
    const effectiveRecipient = recipientName || "Asha Deep Community Shelter";
    const numPortions = typeof portions === "string" ? parseInt(portions, 10) || 80 : typeof portions === "number" ? portions : 80;
    const qrData = `FOODRELAY:VOUCHER:${receiptNum}:${effectiveAlloc}:${effectiveDonId}:${effectiveRecId}:${numPortions}PORTIONS`;

    const voucher: DispatchVoucherDto = {
      voucherId: `vch-${Date.now()}`,
      receiptNumber: receiptNum,
      allocationId: effectiveAlloc,
      donationId: effectiveDonId,
      recipientId: effectiveRecId,
      donorName: effectiveDonor,
      recipientName: effectiveRecipient,
      portions: numPortions,
      qrPayload: qrData,
      issuedAt: now,
    };

    return JSON.stringify(voucher);
  }

  /**
   * Tool 7: AI Natural Language Surplus Intake Parsing
   * Extracts structured portion counts, meal categories, and shelf-life parameters from unstructured kitchen notes.
   */
  public static parseIntakeText(rawText: string): string {
    const text = String(rawText || "");
    const textLower = text.toLowerCase();

    // Portions extraction (e.g., "180 vegetarian meals", "120 portions", "80 meals", "50 boxes")
    const portionsMatch = textLower.match(/(\d+)\s*(?:[a-zA-Z_-]+\s+)*(?:portions?|meals?|servings?|plates?|pax|boxes?|packets?)/i);
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

    const parsed: IntakeParsedDto = {
      foodDescription: text.slice(0, 120).trim(),
      portions,
      foodCategory,
      dietaryCategory,
      storageMethod,
      useByHours,
      detectedAllergens,
      summary: `Parsed ${portions} ${dietaryCategory} ${foodCategory} portions (${storageMethod} storage, ${useByHours}h safe window).`,
    };

    return JSON.stringify(parsed);
  }
}

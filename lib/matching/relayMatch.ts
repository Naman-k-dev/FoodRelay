import {
  Donation,
  Recipient,
  MatchingWeights,
  MatchResult,
  MatchCandidate,
  ScoreBreakdown,
} from "@/types";
import { evaluateFoodSafetyGate } from "@/lib/safety/safetyGate";
import { calculateHaversineDistanceKm } from "./distance";

export const DEFAULT_WEIGHTS: MatchingWeights = {
  urgency: 40,
  proximity: 30,
  demand: 20,
  readiness: 10,
};

/**
 * RelayMatch Intelligent Allocation Engine
 * Pure, deterministic, transparent, and explainable multi-stage allocation algorithm.
 */
export function runRelayMatch(
  donation: Donation,
  recipients: Recipient[],
  weights: MatchingWeights = DEFAULT_WEIGHTS,
  now: Date = new Date()
): MatchResult {
  const currentTime = now.getTime();
  const notes: string[] = [];

  // STAGE A: Validate Donation Safety Gate
  const safetyCheck = evaluateFoodSafetyGate(donation, now);
  if (!safetyCheck.isEligible) {
    notes.push(
      `Donation '${donation.id}' blocked by safety gate: ${safetyCheck.blockers.join("; ")}`
    );
    return {
      donationId: donation.id,
      evaluatedAt: now.toISOString(),
      eligibleMatches: [],
      ineligibleMatches: recipients.map((r) => ({
        recipient: r,
        eligible: false,
        ineligibleReasons: [`Donation is not eligible for matching: ${safetyCheck.blockers[0]}`],
        distanceKm: calculateHaversineDistanceKm(
          donation.latitude,
          donation.longitude,
          r.latitude,
          r.longitude
        ),
        score: 0,
        scoreBreakdown: emptyScoreBreakdown(weights),
        suggestedPortions: 0,
      })),
      suggestedAllocations: [],
      totalDonationPortions: donation.remainingQuantity,
      allocatedPortions: 0,
      unallocatedPortions: donation.remainingQuantity,
      notes,
    };
  }

  // STAGE B & C: Evaluate Each Recipient's Eligibility and Weighted Score
  const candidates: MatchCandidate[] = [];

  for (const recipient of recipients) {
    const ineligibleReasons: string[] = [];

    // Constraint 0: Recipient Online & Operational Availability (HARD DOMAIN CONSTRAINT)
    const isOffline =
      recipient.status === "offline" ||
      recipient.status === "unavailable" ||
      recipient.status === "inactive" ||
      recipient.isOnline === false ||
      recipient.receivingAvailability === false ||
      recipient.receivingAvailability === "unavailable" ||
      recipient.receivingAvailability === "offline";

    if (isOffline) {
      ineligibleReasons.push("Recipient is currently offline and unable to receive food donations.");
    }

    // Constraint 0B: Transport Availability
    const isTransportUnavailable =
      recipient.transportAvailable === false ||
      recipient.transportAvailability === "unavailable" ||
      recipient.transportAvailability === "none";

    if (isTransportUnavailable) {
      ineligibleReasons.push("Transportation is unavailable for this recipient organization.");
    }

    // Constraint 1: Remaining Demand
    if (recipient.remainingDemand <= 0) {
      ineligibleReasons.push("Recipient has no remaining meal demand.");
    }

    // Constraint 2: Available Capacity
    if (recipient.availableCapacity <= 0) {
      ineligibleReasons.push("Recipient has zero available receiving capacity.");
    }

    // Constraint 3: Dietary Compatibility
    if (!recipient.acceptedDietaryCategories.includes(donation.dietaryCategory)) {
      ineligibleReasons.push(
        `Dietary mismatch: Recipient accepts [${recipient.acceptedDietaryCategories.join(
          ", "
        )}], donation is '${donation.dietaryCategory}'.`
      );
    }

    // Constraint 4: Allergen Compatibility
    if (donation.allergenInformation && donation.allergenInformation.length > 0) {
      const conflictingAllergens = donation.allergenInformation.filter((a) =>
        recipient.allergenRestrictions.includes(a)
      );
      if (conflictingAllergens.length > 0) {
        ineligibleReasons.push(
          `Allergen conflict: Recipient restricts [${conflictingAllergens.join(
            ", "
          )}], which are present in donation.`
        );
      }
    }

    // Constraint 5: Storage Compatibility
    if (!recipient.storageCapabilities.includes(donation.storageMethod)) {
      ineligibleReasons.push(
        `Storage mismatch: Donation requires '${donation.storageMethod}', recipient supports [${recipient.storageCapabilities.join(
          ", "
        )}].`
      );
    }

    // Constraint 6: Receiving Window Time Overlap
    const recEnd = new Date(recipient.receivingWindowEnd).getTime();
    if (isNaN(recEnd) || recEnd <= currentTime) {
      ineligibleReasons.push("Recipient's receiving window has closed.");
    }

    const recStart = new Date(recipient.receivingWindowStart).getTime();
    const donEnd = new Date(donation.pickupWindowEnd).getTime();
    if (!isNaN(recStart) && !isNaN(donEnd) && recStart > donEnd) {
      ineligibleReasons.push("Recipient receiving window opens after donation pickup window ends.");
    }

    // Constraint 7: Verification
    if (recipient.verificationStatus === "pending") {
      ineligibleReasons.push("Recipient NGO verification is pending.");
    }

    // Constraint 8: Valid Coordinates Check
    if (
      typeof recipient.latitude !== "number" ||
      isNaN(recipient.latitude) ||
      recipient.latitude < -90 ||
      recipient.latitude > 90 ||
      typeof recipient.longitude !== "number" ||
      isNaN(recipient.longitude) ||
      recipient.longitude < -180 ||
      recipient.longitude > 180
    ) {
      ineligibleReasons.push("Recipient geographic coordinates are missing or invalid.");
    }

    // Calculate Straight-line Distance (uses manualDistanceKm if explicitly configured)
    const distanceKm =
      typeof recipient.manualDistanceKm === "number" && !isNaN(recipient.manualDistanceKm)
        ? recipient.manualDistanceKm
        : calculateHaversineDistanceKm(
            donation.latitude,
            donation.longitude,
            recipient.latitude,
            recipient.longitude
          );

    // Max service radius limit: 35 km
    if (distanceKm > 35) {
      ineligibleReasons.push(`Distance (${distanceKm} km) exceeds maximum service radius of 35 km.`);
    }

    // Calculate Normalized Score Breakdown (0 to 100)
    const breakdown = calculateScoreBreakdown(donation, recipient, distanceKm, weights);
    const isEligible = ineligibleReasons.length === 0;

    candidates.push({
      recipient,
      eligible: isEligible,
      ineligibleReasons,
      distanceKm,
      score: isEligible ? breakdown.finalScore : 0,
      scoreBreakdown: breakdown.breakdown,
      suggestedPortions: 0,
    });
  }

  // Filter Eligible Candidates
  const eligibleMatches = candidates.filter((c) => c.eligible);
  const ineligibleMatches = candidates.filter((c) => !c.eligible);

  // Deterministic Ranking Sort:
  // 1. Highest Score
  // 2. Shortest Distance
  // 3. Highest Remaining Demand
  // 4. Stable tie-breaker: Recipient ID
  eligibleMatches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    if (b.recipient.remainingDemand !== a.recipient.remainingDemand) {
      return b.recipient.remainingDemand - a.recipient.remainingDemand;
    }
    return a.recipient.id.localeCompare(b.recipient.id);
  });

  // STAGE D: Allocation of Available Portions
  let remainingDonationPortions = donation.remainingQuantity;
  const suggestedAllocations: MatchResult["suggestedAllocations"] = [];

  for (const match of eligibleMatches) {
    if (remainingDonationPortions <= 0) break;

    // Hard Constraint Safeguard: Offline or transport-unavailable recipient NEVER receives new allocations
    const isOffline =
      match.recipient.status === "offline" ||
      match.recipient.status === "unavailable" ||
      match.recipient.status === "inactive" ||
      match.recipient.isOnline === false ||
      match.recipient.receivingAvailability === false ||
      match.recipient.receivingAvailability === "unavailable" ||
      match.recipient.receivingAvailability === "offline";

    const isTransportUnavailable =
      match.recipient.transportAvailable === false ||
      match.recipient.transportAvailability === "unavailable" ||
      match.recipient.transportAvailability === "none";

    if (isOffline || isTransportUnavailable) {
      match.suggestedPortions = 0;
      continue;
    }

    // Minimum of: remaining donation, recipient demand, recipient available capacity (whole integer portions)
    const allocatable = Math.floor(
      Math.min(
        remainingDonationPortions,
        match.recipient.remainingDemand,
        match.recipient.availableCapacity
      )
    );

    if (allocatable > 0) {
      match.suggestedPortions = allocatable;
      remainingDonationPortions -= allocatable;

      suggestedAllocations.push({
        recipientId: match.recipient.id,
        recipientName: match.recipient.organizationName,
        allocatedPortions: allocatable,
        distanceKm: match.distanceKm,
        score: match.score,
      });
    } else {
      match.suggestedPortions = 0;
    }
  }

  // Strictly enforce that all ineligible candidates have zero suggested portions
  for (const match of ineligibleMatches) {
    match.suggestedPortions = 0;
  }

  const totalAllocated = donation.remainingQuantity - remainingDonationPortions;

  notes.push(
    `Evaluated ${recipients.length} recipients. Found ${eligibleMatches.length} eligible, allocated ${totalAllocated} of ${donation.remainingQuantity} portions across ${suggestedAllocations.length} recipient(s).`
  );

  return {
    donationId: donation.id,
    evaluatedAt: now.toISOString(),
    eligibleMatches,
    ineligibleMatches,
    suggestedAllocations,
    totalDonationPortions: donation.remainingQuantity,
    allocatedPortions: totalAllocated,
    unallocatedPortions: remainingDonationPortions,
    notes,
  };
}

/**
 * Normalizes individual score components to 0-100 and computes the weighted total.
 */
function calculateScoreBreakdown(
  donation: Donation,
  recipient: Recipient,
  distanceKm: number,
  weights: MatchingWeights
): { breakdown: ScoreBreakdown; finalScore: number } {
  // 1. Urgency Score (0 - 100)
  const urgencyMap: Record<string, number> = {
    critical: 100,
    high: 75,
    medium: 50,
    moderate: 50,
    low: 25,
  };
  const urgencyScore = urgencyMap[recipient.urgencyLevel] ?? 50;

  // 2. Proximity Score (0 - 100)
  // Linear decay up to 30km: 0km = 100, 15km = 50, >= 30km = 0
  const maxRadiusKm = 30;
  const proximityScore = Math.max(
    0,
    Math.round(100 - (distanceKm / maxRadiusKm) * 100)
  );

  // 3. Demand Fit Score (0 - 100)
  // How well the recipient's requested demand absorbs the donation
  const demandRatio = Math.min(
    1,
    recipient.remainingDemand / Math.max(1, donation.remainingQuantity)
  );
  const demandFitScore = Math.round(demandRatio * 100);

  // 4. Pickup Readiness Score (0 - 100)
  let readinessScore = 50;
  if (recipient.transportAvailability === "self_pickup") {
    readinessScore += 30; // Highly ready to collect
  } else if (recipient.transportAvailability === "flexible") {
    readinessScore += 20;
  }
  if (recipient.verificationStatus === "verified_ngo" || recipient.verificationStatus === "simulated_verified") {
    readinessScore += 20;
  }
  readinessScore = Math.min(100, readinessScore);

  // Weighted calculation
  const totalWeight =
    (weights.urgency || 0) +
    (weights.proximity || 0) +
    (weights.demand || 0) +
    (weights.readiness || 0);

  const safeTotalWeight = totalWeight > 0 ? totalWeight : 100;

  const weightedSum =
    urgencyScore * (weights.urgency || 0) +
    proximityScore * (weights.proximity || 0) +
    demandFitScore * (weights.demand || 0) +
    readinessScore * (weights.readiness || 0);

  const finalScore = Math.round(weightedSum / safeTotalWeight);

  const breakdown: ScoreBreakdown = {
    urgencyScore,
    proximityScore,
    demandFitScore,
    readinessScore,
    rawWeights: { ...weights },
  };

  return { breakdown, finalScore };
}

function emptyScoreBreakdown(weights: MatchingWeights): ScoreBreakdown {
  return {
    urgencyScore: 0,
    proximityScore: 0,
    demandFitScore: 0,
    readinessScore: 0,
    rawWeights: { ...weights },
  };
}

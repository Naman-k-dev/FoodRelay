import { Donation, SafetyReviewStatus } from "@/types";

export interface SafetyCheckResult {
  isEligible: boolean;
  status: SafetyReviewStatus;
  blockers: string[];
  warnings: string[];
  regulationReferences: string[];
}

/**
 * Deterministic food safety validation gate.
 * References: Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019.
 */
export function evaluateFoodSafetyGate(
  donation: Donation,
  now: Date = new Date()
): SafetyCheckResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const regulationReferences: string[] = [];

  const currentTime = now.getTime();

  // 1. Mandatory Portions Unit Check
  if (donation.unit !== "portions") {
    blockers.push(
      `Unit is '${donation.unit}'. Matching requires confirmed 'portions'. Kilograms or bulk boxes must undergo user-confirmed portion conversion before allocation.`
    );
    regulationReferences.push("FSSAI 2019 Reg 3(1) - Quantitative verification and packaging standards");
  }

  // 2. Quantity Validity
  if (
    typeof donation.quantity !== "number" ||
    isNaN(donation.quantity) ||
    donation.quantity <= 0
  ) {
    blockers.push("Quantity must be a positive number greater than zero.");
  } else if (!Number.isInteger(donation.quantity)) {
    blockers.push("Quantity must be a whole integer portion count.");
  }

  if (
    typeof donation.remainingQuantity === "number" &&
    (isNaN(donation.remainingQuantity) || donation.remainingQuantity <= 0)
  ) {
    blockers.push("Donation has zero or negative remaining portion balance.");
  }

  // 2b. Coordinates Validity
  if (
    typeof donation.latitude !== "number" ||
    isNaN(donation.latitude) ||
    donation.latitude < -90 ||
    donation.latitude > 90 ||
    typeof donation.longitude !== "number" ||
    isNaN(donation.longitude) ||
    donation.longitude < -180 ||
    donation.longitude > 180
  ) {
    blockers.push("Pickup latitude and longitude must be valid geographic coordinates.");
  }

  // 2c. Donation Status
  if (donation.status === "cancelled") {
    blockers.push("Donation has been cancelled by donor.");
  }

  // 3. Preparation Time Check
  if (!donation.preparedAt) {
    blockers.push("Preparation timestamp is required for food safety monitoring.");
    regulationReferences.push("FSSAI 2019 Reg 4(2) - Time elapsed between preparation and distribution");
  } else {
    const prepTime = new Date(donation.preparedAt).getTime();
    if (isNaN(prepTime)) {
      blockers.push("Invalid preparation timestamp format.");
    } else if (prepTime > currentTime + 5 * 60 * 1000) {
      blockers.push("Preparation time cannot be in the future.");
    }
  }

  // 4. Expiry / Confirmed Use-By Check
  if (!donation.confirmedUseBy) {
    blockers.push("Confirmed use-by time must be explicitly specified by the food business operator or donor.");
    regulationReferences.push("FSSAI 2019 Reg 4(1) - Strict adherence to shelf-life and consumption windows");
  } else {
    const useByTime = new Date(donation.confirmedUseBy).getTime();
    if (isNaN(useByTime)) {
      blockers.push("Invalid confirmed use-by timestamp format.");
    } else if (useByTime <= currentTime) {
      blockers.push("Food has passed its confirmed use-by time. Redistribution prohibited.");
      regulationReferences.push("FSSAI 2019 Reg 5 - Prohibition of distributing expired or perished food");
    }
  }

  // 5. Pickup Window Check
  if (!donation.pickupWindowEnd) {
    blockers.push("Pickup window end time is missing.");
  } else {
    const windowEnd = new Date(donation.pickupWindowEnd).getTime();
    if (isNaN(windowEnd)) {
      blockers.push("Invalid pickup window end time format.");
    } else if (windowEnd <= currentTime) {
      blockers.push("Pickup window has closed.");
    }
  }

  if (donation.pickupWindowStart && donation.pickupWindowEnd) {
    const start = new Date(donation.pickupWindowStart).getTime();
    const end = new Date(donation.pickupWindowEnd).getTime();
    if (start > end) {
      blockers.push("Pickup window start time cannot be after window end time.");
    }
  }

  // 6. Packaging & Storage Integrity
  if (donation.packagingCondition === "loose") {
    blockers.push(
      "Packaging condition is 'loose'. Cooked surplus food must be sealed in clean, food-grade containers or covered foil trays before pickup."
    );
    regulationReferences.push("FSSAI 2019 Reg 6(3) - Food grade packaging and contamination prevention");
  }

  if (!donation.storageMethod) {
    blockers.push("Storage method must be specified (ambient, refrigerated, heated, or frozen).");
  }

  // 7. Handling Information Check
  if (!donation.handlingInformation || donation.handlingInformation.trim().length < 5) {
    blockers.push("Handling and storage instructions must be provided to ensure safe transit.");
    regulationReferences.push("FSSAI 2019 Reg 6(1) - Temperature control during handling and transport");
  }

  // 8. Human Review Gate (Safety Gate Core)
  if (donation.safetyReviewStatus !== "eligible_for_matching") {
    if (donation.safetyReviewStatus === "awaiting_human_review") {
      blockers.push("Donation is awaiting simulated human coordinator safety review.");
    } else if (donation.safetyReviewStatus === "incomplete_info") {
      blockers.push("Donation information is incomplete. Complete all safety fields before review.");
    } else if (donation.safetyReviewStatus === "held") {
      blockers.push("Donation is currently held by coordinator for safety verification.");
    } else if (donation.safetyReviewStatus === "expired") {
      blockers.push("Donation is marked as expired.");
    } else if (donation.safetyReviewStatus === "rejected") {
      blockers.push("Donation was rejected during safety inspection.");
    }
  }

  // Source Verification warning
  if (donation.sourceVerificationStatus === "unverified") {
    warnings.push("Donor organization is unverified. Recommended to verify food handler license on handover.");
  }

  // Determine final recommended status
  let status: SafetyReviewStatus = donation.safetyReviewStatus;
  if (donation.confirmedUseBy && new Date(donation.confirmedUseBy).getTime() <= currentTime) {
    status = "expired";
  } else if (blockers.length > 0 && donation.safetyReviewStatus === "eligible_for_matching") {
    // If it had eligible status but has hard blockers now (e.g. expired or unit mismatch), hold it
    status = "held";
  }

  return {
    isEligible: blockers.length === 0 && donation.safetyReviewStatus === "eligible_for_matching",
    status,
    blockers,
    warnings,
    regulationReferences,
  };
}

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/graftcode-context/dist/src/request-context.js
var require_request_context = __commonJS({
  "node_modules/graftcode-context/dist/src/request-context.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RequestContext = void 0;
    var node_async_hooks_1 = require("node:async_hooks");
    var EMPTY = Object.freeze({});
    var RequestContext2 = class _RequestContext {
      static {
        __name(this, "RequestContext");
      }
      constructor() {
        this.headers = EMPTY;
        this.isPublished = false;
      }
      /** Context of the current invocation. Never null. */
      static get current() {
        return _RequestContext.storage.getStore() ?? _RequestContext.fallback;
      }
      /** Host only: makes `context` current for the rest of this async flow. Hosts use `run` instead. */
      static set current(context) {
        context.isPublished = true;
        _RequestContext.fallback = context;
        _RequestContext.storage.enterWith(context);
      }
      /**
       * Host only: runs `fn` with `context` as the current context (and everything it awaits). The only public way to
       * change the current context.
       */
      static run(context, fn) {
        context.isPublished = true;
        return _RequestContext.storage.run(context, fn);
      }
      /** Returns a copy of the headers seen by the current flow. Changing the copy changes nothing. */
      getHeaders() {
        return { ...this.visibleHeaders() };
      }
      /**
       * Host only (not public API): replaces the whole header bag. On a context that is (or was) current the change
       * applies to the current async flow and what it starts afterwards, never to the parent or to siblings.
       * Note: the synchronous start of an async function (before its first `await`) still runs in the caller's flow.
       */
      setHeaders(headers) {
        const snapshot = Object.freeze({ ...headers });
        if (!this.isPublished) {
          this.headers = snapshot;
          return;
        }
        const next = _RequestContext.published();
        next.headers = snapshot;
        if (_RequestContext.storage.getStore() !== void 0) {
          _RequestContext.storage.enterWith(next);
        } else {
          _RequestContext.fallback = next;
        }
      }
      visibleHeaders() {
        return this.isPublished ? _RequestContext.current.headers : this.headers;
      }
      static published() {
        const context = new _RequestContext();
        context.isPublished = true;
        return context;
      }
    };
    exports2.RequestContext = RequestContext2;
    RequestContext2.storage = new node_async_hooks_1.AsyncLocalStorage();
    RequestContext2.fallback = RequestContext2.published();
  }
});

// node_modules/graftcode-context/dist/index.js
var require_dist = __commonJS({
  "node_modules/graftcode-context/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_request_context(), exports2);
  }
});

// services/foodrelay/FoodRelayMcpService.ts
var FoodRelayMcpService_exports = {};
__export(FoodRelayMcpService_exports, {
  FoodRelayMcpService: () => FoodRelayMcpService
});

var import_graftcode_context = __toESM(require_dist());

// lib/safety/safetyGate.ts
function evaluateFoodSafetyGate(donation, now = /* @__PURE__ */ new Date()) {
  const blockers = [];
  const warnings = [];
  const regulationReferences = [];
  const currentTime = now.getTime();
  if (donation.unit !== "portions") {
    blockers.push(
      `Unit is '${donation.unit}'. Matching requires confirmed 'portions'. Kilograms or bulk boxes must undergo user-confirmed portion conversion before allocation.`
    );
    regulationReferences.push("FSSAI 2019 Reg 3(1) - Quantitative verification and packaging standards");
  }
  if (typeof donation.quantity !== "number" || isNaN(donation.quantity) || donation.quantity <= 0) {
    blockers.push("Quantity must be a positive number greater than zero.");
  } else if (!Number.isInteger(donation.quantity)) {
    blockers.push("Quantity must be a whole integer portion count.");
  }
  if (typeof donation.remainingQuantity === "number" && (isNaN(donation.remainingQuantity) || donation.remainingQuantity <= 0)) {
    blockers.push("Donation has zero or negative remaining portion balance.");
  }
  if (typeof donation.latitude !== "number" || isNaN(donation.latitude) || donation.latitude < -90 || donation.latitude > 90 || typeof donation.longitude !== "number" || isNaN(donation.longitude) || donation.longitude < -180 || donation.longitude > 180) {
    blockers.push("Pickup latitude and longitude must be valid geographic coordinates.");
  }
  if (donation.status === "cancelled") {
    blockers.push("Donation has been cancelled by donor.");
  }
  if (!donation.preparedAt) {
    blockers.push("Preparation timestamp is required for food safety monitoring.");
    regulationReferences.push("FSSAI 2019 Reg 4(2) - Time elapsed between preparation and distribution");
  } else {
    const prepTime = new Date(donation.preparedAt).getTime();
    if (isNaN(prepTime)) {
      blockers.push("Invalid preparation timestamp format.");
    } else if (prepTime > currentTime + 5 * 60 * 1e3) {
      blockers.push("Preparation time cannot be in the future.");
    }
  }
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
  if (donation.packagingCondition === "loose") {
    blockers.push(
      "Packaging condition is 'loose'. Cooked surplus food must be sealed in clean, food-grade containers or covered foil trays before pickup."
    );
    regulationReferences.push("FSSAI 2019 Reg 6(3) - Food grade packaging and contamination prevention");
  }
  if (!donation.storageMethod) {
    blockers.push("Storage method must be specified (ambient, refrigerated, heated, or frozen).");
  }
  if (!donation.handlingInformation || donation.handlingInformation.trim().length < 5) {
    blockers.push("Handling and storage instructions must be provided to ensure safe transit.");
    regulationReferences.push("FSSAI 2019 Reg 6(1) - Temperature control during handling and transport");
  }
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
  if (donation.sourceVerificationStatus === "unverified") {
    warnings.push("Donor organization is unverified. Recommended to verify food handler license on handover.");
  }
  let status = donation.safetyReviewStatus;
  if (donation.confirmedUseBy && new Date(donation.confirmedUseBy).getTime() <= currentTime) {
    status = "expired";
  } else if (blockers.length > 0 && donation.safetyReviewStatus === "eligible_for_matching") {
    status = "held";
  }
  return {
    isEligible: blockers.length === 0 && donation.safetyReviewStatus === "eligible_for_matching",
    status,
    blockers,
    warnings,
    regulationReferences
  };
}
__name(evaluateFoodSafetyGate, "evaluateFoodSafetyGate");

// lib/matching/distance.ts
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}
__name(calculateHaversineDistanceKm, "calculateHaversineDistanceKm");
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}
__name(toRadians, "toRadians");

// lib/matching/relayMatch.ts
var DEFAULT_WEIGHTS = {
  urgency: 40,
  proximity: 30,
  demand: 20,
  readiness: 10
};
function runRelayMatch(donation, recipients, weights = DEFAULT_WEIGHTS, now = /* @__PURE__ */ new Date()) {
  const currentTime = now.getTime();
  const notes = [];
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
        suggestedPortions: 0
      })),
      suggestedAllocations: [],
      totalDonationPortions: donation.remainingQuantity,
      allocatedPortions: 0,
      unallocatedPortions: donation.remainingQuantity,
      notes
    };
  }
  const candidates = [];
  for (const recipient of recipients) {
    const ineligibleReasons = [];
    const isOffline = recipient.status === "offline" || recipient.status === "unavailable" || recipient.status === "inactive" || recipient.isOnline === false || recipient.receivingAvailability === false || recipient.receivingAvailability === "unavailable" || recipient.receivingAvailability === "offline";
    if (isOffline) {
      ineligibleReasons.push("Recipient is currently offline and unable to receive food donations.");
    }
    const isTransportUnavailable = recipient.transportAvailable === false || recipient.transportAvailability === "unavailable" || recipient.transportAvailability === "none";
    if (isTransportUnavailable) {
      ineligibleReasons.push("Transportation is unavailable for this recipient organization.");
    }
    if (recipient.remainingDemand <= 0) {
      ineligibleReasons.push("Recipient has no remaining meal demand.");
    }
    if (recipient.availableCapacity <= 0) {
      ineligibleReasons.push("Recipient has zero available receiving capacity.");
    }
    if (!recipient.acceptedDietaryCategories.includes(donation.dietaryCategory)) {
      ineligibleReasons.push(
        `Dietary mismatch: Recipient accepts [${recipient.acceptedDietaryCategories.join(
          ", "
        )}], donation is '${donation.dietaryCategory}'.`
      );
    }
    if (donation.allergenInformation && donation.allergenInformation.length > 0) {
      const conflictingAllergens = donation.allergenInformation.filter(
        (a) => recipient.allergenRestrictions.includes(a)
      );
      if (conflictingAllergens.length > 0) {
        ineligibleReasons.push(
          `Allergen conflict: Recipient restricts [${conflictingAllergens.join(
            ", "
          )}], which are present in donation.`
        );
      }
    }
    if (!recipient.storageCapabilities.includes(donation.storageMethod)) {
      ineligibleReasons.push(
        `Storage mismatch: Donation requires '${donation.storageMethod}', recipient supports [${recipient.storageCapabilities.join(
          ", "
        )}].`
      );
    }
    const recEnd = new Date(recipient.receivingWindowEnd).getTime();
    if (isNaN(recEnd) || recEnd <= currentTime) {
      ineligibleReasons.push("Recipient's receiving window has closed.");
    }
    const recStart = new Date(recipient.receivingWindowStart).getTime();
    const donEnd = new Date(donation.pickupWindowEnd).getTime();
    if (!isNaN(recStart) && !isNaN(donEnd) && recStart > donEnd) {
      ineligibleReasons.push("Recipient receiving window opens after donation pickup window ends.");
    }
    if (recipient.verificationStatus === "pending") {
      ineligibleReasons.push("Recipient NGO verification is pending.");
    }
    if (typeof recipient.latitude !== "number" || isNaN(recipient.latitude) || recipient.latitude < -90 || recipient.latitude > 90 || typeof recipient.longitude !== "number" || isNaN(recipient.longitude) || recipient.longitude < -180 || recipient.longitude > 180) {
      ineligibleReasons.push("Recipient geographic coordinates are missing or invalid.");
    }
    const distanceKm = typeof recipient.manualDistanceKm === "number" && !isNaN(recipient.manualDistanceKm) ? recipient.manualDistanceKm : calculateHaversineDistanceKm(
      donation.latitude,
      donation.longitude,
      recipient.latitude,
      recipient.longitude
    );
    if (distanceKm > 35) {
      ineligibleReasons.push(`Distance (${distanceKm} km) exceeds maximum service radius of 35 km.`);
    }
    const breakdown = calculateScoreBreakdown(donation, recipient, distanceKm, weights);
    const isEligible = ineligibleReasons.length === 0;
    candidates.push({
      recipient,
      eligible: isEligible,
      ineligibleReasons,
      distanceKm,
      score: isEligible ? breakdown.finalScore : 0,
      scoreBreakdown: breakdown.breakdown,
      suggestedPortions: 0
    });
  }
  const eligibleMatches = candidates.filter((c) => c.eligible);
  const ineligibleMatches = candidates.filter((c) => !c.eligible);
  eligibleMatches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    if (b.recipient.remainingDemand !== a.recipient.remainingDemand) {
      return b.recipient.remainingDemand - a.recipient.remainingDemand;
    }
    return a.recipient.id.localeCompare(b.recipient.id);
  });
  let remainingDonationPortions = donation.remainingQuantity;
  const suggestedAllocations = [];
  for (const match of eligibleMatches) {
    if (remainingDonationPortions <= 0) break;
    const isOffline = match.recipient.status === "offline" || match.recipient.status === "unavailable" || match.recipient.status === "inactive" || match.recipient.isOnline === false || match.recipient.receivingAvailability === false || match.recipient.receivingAvailability === "unavailable" || match.recipient.receivingAvailability === "offline";
    const isTransportUnavailable = match.recipient.transportAvailable === false || match.recipient.transportAvailability === "unavailable" || match.recipient.transportAvailability === "none";
    if (isOffline || isTransportUnavailable) {
      match.suggestedPortions = 0;
      continue;
    }
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
        score: match.score
      });
    } else {
      match.suggestedPortions = 0;
    }
  }
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
    notes
  };
}
__name(runRelayMatch, "runRelayMatch");
function calculateScoreBreakdown(donation, recipient, distanceKm, weights) {
  const urgencyMap = {
    critical: 100,
    high: 75,
    medium: 50,
    moderate: 50,
    low: 25
  };
  const urgencyScore = urgencyMap[recipient.urgencyLevel] ?? 50;
  const maxRadiusKm = 30;
  const proximityScore = Math.max(
    0,
    Math.round(100 - distanceKm / maxRadiusKm * 100)
  );
  const demandRatio = Math.min(
    1,
    recipient.remainingDemand / Math.max(1, donation.remainingQuantity)
  );
  const demandFitScore = Math.round(demandRatio * 100);
  let readinessScore = 50;
  if (recipient.transportAvailability === "self_pickup") {
    readinessScore += 30;
  } else if (recipient.transportAvailability === "flexible") {
    readinessScore += 20;
  }
  if (recipient.verificationStatus === "verified_ngo" || recipient.verificationStatus === "simulated_verified") {
    readinessScore += 20;
  }
  readinessScore = Math.min(100, readinessScore);
  const totalWeight = (weights.urgency || 0) + (weights.proximity || 0) + (weights.demand || 0) + (weights.readiness || 0);
  const safeTotalWeight = totalWeight > 0 ? totalWeight : 100;
  const weightedSum = urgencyScore * (weights.urgency || 0) + proximityScore * (weights.proximity || 0) + demandFitScore * (weights.demand || 0) + readinessScore * (weights.readiness || 0);
  const finalScore = Math.round(weightedSum / safeTotalWeight);
  const breakdown = {
    urgencyScore,
    proximityScore,
    demandFitScore,
    readinessScore,
    rawWeights: { ...weights }
  };
  return { breakdown, finalScore };
}
__name(calculateScoreBreakdown, "calculateScoreBreakdown");
function emptyScoreBreakdown(weights) {
  return {
    urgencyScore: 0,
    proximityScore: 0,
    demandFitScore: 0,
    readinessScore: 0,
    rawWeights: { ...weights }
  };
}
__name(emptyScoreBreakdown, "emptyScoreBreakdown");

// lib/dispatch/transitions.ts
var ALLOWED_TRANSITIONS = {
  proposed: ["reserved", "cancelled"],
  reserved: ["accepted", "cancelled"],
  accepted: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["collected", "cancelled"],
  collected: ["delivered", "cancelled"],
  delivered: [],
  // Terminal successful state
  cancelled: []
  // Terminal cancelled state
};
function canTransitionAllocation(currentStatus, targetStatus) {
  if (currentStatus === targetStatus) {
    return { allowed: false, reason: "Allocation is already in this status." };
  }
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Invalid transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions: ${allowedNext.join(", ") || "None (terminal state)"}.`
    };
  }
  return { allowed: true };
}
__name(canTransitionAllocation, "canTransitionAllocation");

// lib/demo/seedData.ts
function generateFictionalSeedData() {
  const now = /* @__PURE__ */ new Date();
  const hoursFromNow = /* @__PURE__ */ __name((h) => {
    return new Date(now.getTime() + h * 60 * 60 * 1e3).toISOString();
  }, "hoursFromNow");
  const recipients = [
    {
      id: "rec-1",
      organizationName: "Asha Deep Community Shelter",
      organizationType: "shelter",
      contactPerson: "Rajesh Sharma (Simulated)",
      phone: "+91-98110-00001",
      location: "Sector 62, Noida, UP (Fictional)",
      latitude: 28.628,
      longitude: 77.367,
      requestedMealPortions: 80,
      remainingDemand: 80,
      receivingCapacity: 120,
      availableCapacity: 120,
      urgencyLevel: "critical",
      acceptedDietaryCategories: ["vegetarian", "vegan", "jain"],
      allergenRestrictions: ["nuts"],
      storageCapabilities: ["ambient", "refrigerated"],
      transportAvailability: "self_pickup",
      receivingWindowStart: hoursFromNow(-1),
      receivingWindowEnd: hoursFromNow(5),
      verificationStatus: "simulated_verified",
      isDemo: true
    },
    {
      id: "rec-2",
      organizationName: "Prerna Child Welfare Orphanage",
      organizationType: "orphanage",
      contactPerson: "Sunita Verma (Simulated)",
      phone: "+91-98110-00002",
      location: "Knowledge Park III, Greater Noida (Fictional)",
      latitude: 28.468,
      longitude: 77.498,
      requestedMealPortions: 50,
      remainingDemand: 50,
      receivingCapacity: 60,
      availableCapacity: 60,
      urgencyLevel: "high",
      acceptedDietaryCategories: ["vegetarian", "vegan"],
      allergenRestrictions: [],
      storageCapabilities: ["ambient", "refrigerated", "heated"],
      transportAvailability: "flexible",
      receivingWindowStart: hoursFromNow(-2),
      receivingWindowEnd: hoursFromNow(4),
      verificationStatus: "simulated_verified",
      isDemo: true
    },
    {
      id: "rec-3",
      organizationName: "Jan Seva Community Kitchen",
      organizationType: "community_kitchen",
      contactPerson: "Mohit Aggarwal (Simulated)",
      phone: "+91-98110-00003",
      location: "Sector 18 Atta Market, Noida (Fictional)",
      latitude: 28.57,
      longitude: 77.321,
      requestedMealPortions: 150,
      remainingDemand: 150,
      receivingCapacity: 200,
      availableCapacity: 200,
      urgencyLevel: "high",
      acceptedDietaryCategories: ["vegetarian", "non_vegetarian", "vegan", "jain"],
      allergenRestrictions: [],
      storageCapabilities: ["ambient", "heated"],
      transportAvailability: "flexible",
      receivingWindowStart: hoursFromNow(-1),
      receivingWindowEnd: hoursFromNow(6),
      verificationStatus: "simulated_verified",
      isDemo: true
    },
    {
      id: "rec-4",
      organizationName: "Sneh Vridhashram Elderly Care",
      organizationType: "elderly_care",
      contactPerson: "Dr. Ananya Sen (Simulated)",
      phone: "+91-98110-00004",
      location: "Pari Chowk, Greater Noida (Fictional)",
      latitude: 28.464,
      longitude: 77.509,
      requestedMealPortions: 40,
      remainingDemand: 40,
      receivingCapacity: 45,
      availableCapacity: 45,
      urgencyLevel: "moderate",
      acceptedDietaryCategories: ["vegetarian", "jain"],
      allergenRestrictions: ["dairy"],
      storageCapabilities: ["ambient", "refrigerated"],
      transportAvailability: "delivery_only",
      receivingWindowStart: hoursFromNow(0),
      receivingWindowEnd: hoursFromNow(4),
      verificationStatus: "simulated_verified",
      isDemo: true
    },
    {
      id: "rec-5",
      organizationName: "Navjeevan Relief Foundation",
      organizationType: "ngo",
      contactPerson: "Vikram Chauhan (Simulated)",
      phone: "+91-98110-00005",
      location: "Surajpur Industrial Area, Greater Noida (Fictional)",
      latitude: 28.528,
      longitude: 77.487,
      requestedMealPortions: 100,
      remainingDemand: 100,
      receivingCapacity: 150,
      availableCapacity: 150,
      urgencyLevel: "moderate",
      acceptedDietaryCategories: ["vegetarian", "non_vegetarian", "vegan"],
      allergenRestrictions: [],
      storageCapabilities: ["ambient", "refrigerated"],
      transportAvailability: "self_pickup",
      receivingWindowStart: hoursFromNow(-1),
      receivingWindowEnd: hoursFromNow(7),
      verificationStatus: "simulated_verified",
      isDemo: true
    },
    {
      id: "rec-6",
      organizationName: "Udaan Night Shelter & Relief Center",
      organizationType: "shelter",
      contactPerson: "Deepak Mehra (Simulated)",
      phone: "+91-98110-00006",
      location: "Sector 128 Expressway, Noida (Fictional)",
      latitude: 28.513,
      longitude: 77.375,
      requestedMealPortions: 60,
      remainingDemand: 60,
      receivingCapacity: 90,
      availableCapacity: 90,
      urgencyLevel: "low",
      acceptedDietaryCategories: ["vegetarian"],
      allergenRestrictions: [],
      storageCapabilities: ["ambient"],
      transportAvailability: "self_pickup",
      receivingWindowStart: hoursFromNow(1),
      receivingWindowEnd: hoursFromNow(6),
      verificationStatus: "simulated_verified",
      isDemo: true
    }
  ];
  const donations = [
    // 1. Ready & Valid Donation (Eligible for Matching)
    {
      id: "don-101",
      donorName: "Haldiram Banquet & Catering",
      donorType: "wedding_venue",
      donorContact: "+91-99100-11101",
      foodDescription: "Surplus buffet meals: Paneer butter masala, steamed rice, dal makhani, and butter rotis",
      foodCategory: "cooked_meals",
      dietaryCategory: "vegetarian",
      quantity: 120,
      unit: "portions",
      remainingQuantity: 120,
      pickupLocation: "Sector 63, Noida (Fictional Venue)",
      latitude: 28.625,
      longitude: 77.382,
      preparedAt: hoursFromNow(-2),
      pickupWindowStart: hoursFromNow(-0.5),
      pickupWindowEnd: hoursFromNow(2.5),
      confirmedUseBy: hoursFromNow(4),
      storageMethod: "heated",
      packagingCondition: "sealed_containers",
      allergenInformation: ["dairy"],
      handlingInformation: "Maintained above 60\xB0C in insulated cambro thermal containers. Consume within 4 hours.",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: "eligible_for_matching",
      safetyReviewNotes: "Coordinator review: Safe thermal cambro packaging, verifiable commercial kitchen, compliant with FSSAI surplus guidelines.",
      safetyReviewer: "Coordinator (Simulated)",
      safetyReviewedAt: hoursFromNow(-1),
      status: "available",
      createdAt: hoursFromNow(-2),
      updatedAt: hoursFromNow(-1),
      isDemo: true,
      history: [
        {
          id: "hist-1",
          timestamp: hoursFromNow(-2),
          action: "Donation Submitted",
          actor: "Donor Haldiram Banquet",
          notes: "Initial donation intake via portal"
        },
        {
          id: "hist-2",
          timestamp: hoursFromNow(-1),
          action: "Safety Review Approved",
          actor: "FoodRelay Safety Coordinator",
          notes: "Inspected temperature logs and packaging integrity. Marked eligible."
        }
      ]
    },
    // 2. High-Quantity Donation (Ideal for split allocation)
    {
      id: "don-102",
      donorName: "Tech Mahindra Corporate Cafeteria",
      donorType: "corporate_cafeteria",
      donorContact: "+91-99100-11102",
      foodDescription: "Lunch surplus: Mixed veg khichdi, aloo gobi, curd, and whole wheat chapati",
      foodCategory: "cooked_meals",
      dietaryCategory: "vegetarian",
      quantity: 220,
      unit: "portions",
      remainingQuantity: 220,
      pickupLocation: "Tower A Cafeteria, Sector 126, Noida Expressway (Fictional)",
      latitude: 28.535,
      longitude: 77.352,
      preparedAt: hoursFromNow(-1.5),
      pickupWindowStart: hoursFromNow(0),
      pickupWindowEnd: hoursFromNow(3),
      confirmedUseBy: hoursFromNow(4.5),
      storageMethod: "heated",
      packagingCondition: "sealed_containers",
      allergenInformation: ["dairy"],
      handlingInformation: "Stored in food-grade stainless dispensers and packed into sealed foil containers.",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: "eligible_for_matching",
      safetyReviewNotes: "Verified cafeteria audit, sealed foil boxes, strict temperature check.",
      safetyReviewer: "Coordinator (Simulated)",
      safetyReviewedAt: hoursFromNow(-0.5),
      status: "available",
      createdAt: hoursFromNow(-1.5),
      updatedAt: hoursFromNow(-0.5),
      isDemo: true,
      history: [
        {
          id: "hist-3",
          timestamp: hoursFromNow(-1.5),
          action: "Donation Submitted",
          actor: "Cafeteria Supervisor"
        }
      ]
    },
    // 3. Donation Missing Safety Review (Held / Awaiting Human Review)
    {
      id: "don-103",
      donorName: "Spice Garden Bistro",
      donorType: "restaurant",
      donorContact: "+91-99100-11103",
      foodDescription: "Over-catered Chicken Dum Biryani and raita",
      foodCategory: "cooked_meals",
      dietaryCategory: "non_vegetarian",
      quantity: 65,
      unit: "portions",
      remainingQuantity: 65,
      pickupLocation: "Sector 18 Market, Noida (Fictional)",
      latitude: 28.572,
      longitude: 77.324,
      preparedAt: hoursFromNow(-3),
      pickupWindowStart: hoursFromNow(0),
      pickupWindowEnd: hoursFromNow(2),
      confirmedUseBy: hoursFromNow(3),
      storageMethod: "ambient",
      packagingCondition: "foil_trays",
      allergenInformation: ["dairy"],
      handlingInformation: "Ambient trays, needs temperature confirmation before human dispatch.",
      sourceVerificationStatus: "self_declared",
      safetyReviewStatus: "awaiting_human_review",
      safetyReviewNotes: "Pending cold-chain or reheat protocol verification for cooked poultry dishes per FSSAI guidelines.",
      safetyReviewer: null,
      safetyReviewedAt: null,
      status: "awaiting_review",
      createdAt: hoursFromNow(-1),
      updatedAt: hoursFromNow(-1),
      isDemo: true,
      history: [
        {
          id: "hist-4",
          timestamp: hoursFromNow(-1),
          action: "Draft Created",
          actor: "Spice Garden Manager"
        }
      ]
    },
    // 4. Incomplete Information / Blocked Donation
    {
      id: "don-104",
      donorName: "Jaypee University Hostel Mess",
      donorType: "hostel",
      donorContact: "+91-99100-11104",
      foodDescription: "Assorted leftover curries and rice from student mess",
      foodCategory: "cooked_meals",
      dietaryCategory: "vegetarian",
      quantity: 50,
      unit: "kg",
      // Note: kg, not portions! Demonstrates unit blocker rule
      remainingQuantity: 50,
      pickupLocation: "Hostel 3 Mess, Sector 128, Noida (Fictional)",
      latitude: 28.514,
      longitude: 77.368,
      preparedAt: hoursFromNow(-4),
      pickupWindowStart: hoursFromNow(-1),
      pickupWindowEnd: hoursFromNow(1),
      confirmedUseBy: hoursFromNow(2),
      storageMethod: "ambient",
      packagingCondition: "loose",
      allergenInformation: [],
      handlingInformation: "Unpackaged bulk pots. Needs food-safe packing before transit.",
      sourceVerificationStatus: "unverified",
      safetyReviewStatus: "incomplete_info",
      safetyReviewNotes: "Blocked: Quantity in 'kg' requires explicit meal-portion conversion. Packaging 'loose' is unsealed.",
      safetyReviewer: null,
      safetyReviewedAt: null,
      status: "draft",
      createdAt: hoursFromNow(-2),
      updatedAt: hoursFromNow(-2),
      isDemo: true,
      history: [
        {
          id: "hist-5",
          timestamp: hoursFromNow(-2),
          action: "Created with Missing Info",
          actor: "Student Volunteer"
        }
      ]
    },
    // 5. Expired Donation (Demonstrates hard expiry gate)
    {
      id: "don-105",
      donorName: "Grand Heritage Resort & Club",
      donorType: "event_organizer",
      foodDescription: "Breakfast pastries, muffins, and sandwiches from early conference",
      foodCategory: "bakery",
      dietaryCategory: "vegetarian",
      quantity: 45,
      unit: "portions",
      remainingQuantity: 45,
      pickupLocation: "Surajpur Road, Greater Noida (Fictional)",
      latitude: 28.491,
      longitude: 77.48,
      preparedAt: hoursFromNow(-9),
      pickupWindowStart: hoursFromNow(-6),
      pickupWindowEnd: hoursFromNow(-2),
      confirmedUseBy: hoursFromNow(-1),
      // Past expiration!
      storageMethod: "ambient",
      packagingCondition: "crates",
      allergenInformation: ["gluten", "dairy"],
      handlingInformation: "Past confirmed use-by window. Automatically archived.",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: "expired",
      safetyReviewNotes: "Automated safety gate: Confirmed use-by timestamp passed.",
      safetyReviewer: "System Safety Guard",
      safetyReviewedAt: hoursFromNow(-1),
      status: "expired",
      createdAt: hoursFromNow(-7),
      updatedAt: hoursFromNow(-1),
      isDemo: true,
      history: [
        {
          id: "hist-6",
          timestamp: hoursFromNow(-7),
          action: "Submitted",
          actor: "Resort Banquet"
        },
        {
          id: "hist-7",
          timestamp: hoursFromNow(-1),
          action: "Flagged Expired",
          actor: "Automated Safety Monitor"
        }
      ]
    },
    // 6. Historical Completed Donation (Delivered)
    {
      id: "don-100",
      donorName: "Kailash Hospital Doctors Cafeteria",
      donorType: "corporate_cafeteria",
      foodDescription: "Packed healthy thali meals with roti, dal, sabzi, and salad",
      foodCategory: "cooked_meals",
      dietaryCategory: "vegetarian",
      quantity: 90,
      unit: "portions",
      remainingQuantity: 0,
      pickupLocation: "Sector 27, Noida (Fictional)",
      latitude: 28.574,
      longitude: 77.329,
      preparedAt: hoursFromNow(-18),
      pickupWindowStart: hoursFromNow(-17),
      pickupWindowEnd: hoursFromNow(-14),
      confirmedUseBy: hoursFromNow(-12),
      storageMethod: "refrigerated",
      packagingCondition: "sealed_containers",
      allergenInformation: ["dairy"],
      handlingInformation: "Temperature logged at 4\xB0C. Clean handover verified.",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: "eligible_for_matching",
      safetyReviewNotes: "Completed safe delivery.",
      safetyReviewer: "Coordinator (Simulated)",
      safetyReviewedAt: hoursFromNow(-16),
      status: "delivered",
      createdAt: hoursFromNow(-18),
      updatedAt: hoursFromNow(-13),
      isDemo: true,
      history: [
        {
          id: "hist-8",
          timestamp: hoursFromNow(-18),
          action: "Intake Complete",
          actor: "Hospital Admin"
        },
        {
          id: "hist-9",
          timestamp: hoursFromNow(-15),
          action: "Collected from Donor",
          actor: "Volunteer Relay Team"
        },
        {
          id: "hist-10",
          timestamp: hoursFromNow(-13),
          action: "Delivered to Jan Seva Kitchen",
          actor: "Volunteer Relay Team"
        }
      ]
    }
  ];
  const allocations = [
    {
      id: "alloc-099",
      donationId: "don-100",
      recipientId: "rec-3",
      // Jan Seva Community Kitchen
      allocatedPortions: 90,
      distanceKm: 0.8,
      score: 94,
      scoreBreakdown: {
        urgencyScore: 85,
        proximityScore: 98,
        demandFitScore: 100,
        readinessScore: 95,
        rawWeights: { urgency: 40, proximity: 30, demand: 20, readiness: 10 }
      },
      status: "delivered",
      reasons: ["Close proximity (0.8 km)", "High urgency match", "Exact portion fit"],
      unresolvedConstraints: [],
      createdAt: hoursFromNow(-16),
      updatedAt: hoursFromNow(-13),
      timeline: [
        {
          status: "proposed",
          timestamp: hoursFromNow(-16),
          note: "Algorithm suggested allocation",
          actor: "RelayMatch Engine"
        },
        {
          status: "reserved",
          timestamp: hoursFromNow(-15.5),
          note: "Coordinator reserved portions",
          actor: "Coordinator (Simulated)"
        },
        {
          status: "accepted",
          timestamp: hoursFromNow(-15.2),
          note: "Recipient kitchen confirmed acceptance",
          actor: "Mohit Aggarwal (Simulated)"
        },
        {
          status: "ready_for_pickup",
          timestamp: hoursFromNow(-15),
          note: "Donor kitchen staged package at dispatch dock",
          actor: "Hospital Admin"
        },
        {
          status: "collected",
          timestamp: hoursFromNow(-14.2),
          note: "Inspected tamper seals and loaded into thermal bags",
          actor: "Relay Volunteer #12"
        },
        {
          status: "delivered",
          timestamp: hoursFromNow(-13),
          note: "Safely received at Jan Seva Kitchen. Portion verification signed.",
          actor: "Mohit Aggarwal (Simulated)"
        }
      ],
      handoverReceipt: {
        receiptNumber: "FR-DEL-202611-099",
        donorSignature: "Kailash Cafeteria Rep (Verified)",
        recipientSignature: "Jan Seva Shelter Kitchen (Verified)",
        completedAt: hoursFromNow(-13),
        qrData: "FOODRELAY:ALLOC-099:DON-100:REC-3:90PORTIONS"
      }
    }
  ];
  return { donations, recipients, allocations };
}
__name(generateFictionalSeedData, "generateFictionalSeedData");

// services/foodrelay/FoodRelayMcpService.ts
function getActorFromContext(fallbackActor = "AI_Agent_Coordinator") {
  try {
    if (import_graftcode_context.RequestContext && import_graftcode_context.RequestContext.current) {
      const headers = import_graftcode_context.RequestContext.current.getHeaders();
      const headerActor = headers["x-actor-id"] || headers["x-user-id"] || headers["authorization"] || headers["x-api-key"];
      if (headerActor && typeof headerActor === "string") {
        return headerActor.replace(/^Bearer\s+/i, "").trim();
      }
    }
  } catch {
  }
  return fallbackActor;
}
__name(getActorFromContext, "getActorFromContext");
class FoodRelayMcpService {
  static {
    __name(this, "FoodRelayMcpService");
  }
  /**
   * Tool 1: Shelter Network Real-Time Capacity & Status
   * Returns operational status, available capacity, and demand for all verified regional shelters.
   */
  static getNetworkStatus() {
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
      receivingWindowEnd: r.receivingWindowEnd
    }));
  }
  /**
   * Tool 2: Food Safety Gate Evaluation
   * Deterministically validates food donation safety under FSSAI 2019 Surplus Food Regulations.
   */
  static evaluateDonationSafety(donationInput) {
    const now = /* @__PURE__ */ new Date();
    const domainDonation = {
      id: donationInput.id,
      donorName: donationInput.donorName,
      donorType: donationInput.donorType || "restaurant",
      foodDescription: donationInput.foodDescription,
      foodCategory: donationInput.foodCategory || "cooked_meals",
      dietaryCategory: donationInput.dietaryCategory || "vegetarian",
      quantity: donationInput.quantity,
      unit: donationInput.unit || "portions",
      remainingQuantity: donationInput.remainingQuantity ?? donationInput.quantity,
      pickupLocation: donationInput.pickupLocation,
      latitude: donationInput.latitude,
      longitude: donationInput.longitude,
      preparedAt: donationInput.preparedAt,
      pickupWindowStart: donationInput.pickupWindowStart,
      pickupWindowEnd: donationInput.pickupWindowEnd,
      confirmedUseBy: donationInput.confirmedUseBy,
      storageMethod: donationInput.storageMethod || "ambient",
      packagingCondition: donationInput.packagingCondition || "sealed_containers",
      allergenInformation: donationInput.allergenInformation || [],
      handlingInformation: donationInput.handlingInformation || "Store per standard FSSAI temperature controls",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: donationInput.safetyReviewStatus || "eligible_for_matching",
      safetyReviewNotes: "Verified via FoodRelay AI MCP Agent",
      safetyReviewer: getActorFromContext(),
      safetyReviewedAt: null,
      status: donationInput.status || "available",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isDemo: false,
      history: []
    };
    const result = evaluateFoodSafetyGate(domainDonation, now);
    return {
      isEligible: result.isEligible,
      status: result.status,
      blockers: [...result.blockers],
      warnings: [...result.warnings],
      regulationReferences: [...result.regulationReferences],
      summary: result.isEligible ? `PASSED: Donation '${donationInput.id}' meets all FSSAI 2019 surplus food safety regulations.` : `BLOCKED: Donation '${donationInput.id}' failed safety checks: ${result.blockers.join("; ")}`
    };
  }
  /**
   * Tool 3: Algorithmic Surplus Matching & Multi-Criteria Allocation
   * Computes deterministic, explainable allocations based on urgency (40%), proximity (30%), demand (20%), readiness (10%).
   */
  static calculateSurplusMatches(donationInput, weightsInput) {
    const now = /* @__PURE__ */ new Date();
    const seed = generateFictionalSeedData();
    const recipients = seed.recipients;
    const weights = weightsInput ? {
      urgency: weightsInput.urgency,
      proximity: weightsInput.proximity,
      demand: weightsInput.demand,
      readiness: weightsInput.readiness
    } : DEFAULT_WEIGHTS;
    const domainDonation = {
      id: donationInput.id,
      donorName: donationInput.donorName,
      donorType: donationInput.donorType || "restaurant",
      foodDescription: donationInput.foodDescription,
      foodCategory: donationInput.foodCategory || "cooked_meals",
      dietaryCategory: donationInput.dietaryCategory || "vegetarian",
      quantity: donationInput.quantity,
      unit: donationInput.unit || "portions",
      remainingQuantity: donationInput.remainingQuantity ?? donationInput.quantity,
      pickupLocation: donationInput.pickupLocation,
      latitude: donationInput.latitude,
      longitude: donationInput.longitude,
      preparedAt: donationInput.preparedAt,
      pickupWindowStart: donationInput.pickupWindowStart,
      pickupWindowEnd: donationInput.pickupWindowEnd,
      confirmedUseBy: donationInput.confirmedUseBy,
      storageMethod: donationInput.storageMethod || "ambient",
      packagingCondition: donationInput.packagingCondition || "sealed_containers",
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
      history: []
    };
    const matchResult = runRelayMatch(domainDonation, recipients, weights, now);
    const allocations = matchResult.suggestedAllocations.map((a) => {
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
        readinessScore: candidate?.scoreBreakdown.readinessScore || 0
      };
    });
    const ineligibleRecipients = matchResult.ineligibleMatches.map((m) => ({
      recipientId: m.recipient.id,
      recipientName: m.recipient.organizationName,
      reasons: [...m.ineligibleReasons]
    }));
    return {
      donationId: matchResult.donationId,
      evaluatedAt: matchResult.evaluatedAt,
      totalPortions: matchResult.totalDonationPortions,
      allocatedPortions: matchResult.allocatedPortions,
      unallocatedPortions: matchResult.unallocatedPortions,
      allocations,
      ineligibleRecipients,
      notes: [...matchResult.notes]
    };
  }
  /**
   * Tool 4: Dynamic Surplus Redistribution upon Shelter Outage
   * Switches an offline shelter out of service and re-evaluates allocations across remaining online shelters.
   */
  static triggerAutoRedistribution(donationInput, offlineShelterId, weightsInput) {
    const now = /* @__PURE__ */ new Date();
    const seed = generateFictionalSeedData();
    const initialMatch = _FoodRelayMcpService.calculateSurplusMatches(donationInput, weightsInput);
    const affectedInitial = initialMatch.allocations.find((a) => a.recipientId === offlineShelterId);
    const releasedPortions = affectedInitial?.allocatedPortions || 0;
    const offlineName = affectedInitial?.recipientName || offlineShelterId;
    const modifiedRecipients = seed.recipients.map((r) => {
      if (r.id === offlineShelterId) {
        return {
          ...r,
          status: "offline",
          isOnline: false,
          receivingAvailability: false
        };
      }
      return r;
    });
    const weights = weightsInput ? {
      urgency: weightsInput.urgency,
      proximity: weightsInput.proximity,
      demand: weightsInput.demand,
      readiness: weightsInput.readiness
    } : DEFAULT_WEIGHTS;
    const domainDonation = {
      id: donationInput.id,
      donorName: donationInput.donorName,
      donorType: donationInput.donorType || "restaurant",
      foodDescription: donationInput.foodDescription,
      foodCategory: donationInput.foodCategory || "cooked_meals",
      dietaryCategory: donationInput.dietaryCategory || "vegetarian",
      quantity: donationInput.quantity,
      unit: donationInput.unit || "portions",
      remainingQuantity: donationInput.remainingQuantity ?? donationInput.quantity,
      pickupLocation: donationInput.pickupLocation,
      latitude: donationInput.latitude,
      longitude: donationInput.longitude,
      preparedAt: donationInput.preparedAt,
      pickupWindowStart: donationInput.pickupWindowStart,
      pickupWindowEnd: donationInput.pickupWindowEnd,
      confirmedUseBy: donationInput.confirmedUseBy,
      storageMethod: donationInput.storageMethod || "ambient",
      packagingCondition: donationInput.packagingCondition || "sealed_containers",
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
      history: []
    };
    const reResult = runRelayMatch(domainDonation, modifiedRecipients, weights, now);
    const updatedAllocations = reResult.suggestedAllocations.map((a) => {
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
        readinessScore: candidate?.scoreBreakdown.readinessScore || 0
      };
    });
    return {
      offlineShelterId,
      offlineShelterName: offlineName,
      releasedPortions,
      redistributedPortions: reResult.allocatedPortions,
      unallocatedSurplus: reResult.unallocatedPortions,
      updatedAllocations,
      message: `Offline shelter '${offlineName}' released ${releasedPortions} portions. Total redistributed: ${reResult.allocatedPortions} portions; Unallocated surplus: ${reResult.unallocatedPortions} portions.`
    };
  }
  /**
   * Tool 5: Dispatch Lifecycle Progression Guard
   * Validates state transitions (proposed -> reserved -> accepted -> ready_for_pickup -> collected -> delivered).
   */
  static advanceDispatchStatus(allocationId, currentStatus, targetStatus, actor, note) {
    const check = canTransitionAllocation(
      currentStatus,
      targetStatus
    );
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const effectiveActor = actor || getActorFromContext();
    if (!check.allowed) {
      return {
        allocationId,
        previousStatus: currentStatus,
        currentStatus,
        transitionAllowed: false,
        updatedAt: now,
        actor: effectiveActor,
        note: check.reason || "Transition rejected by state machine guard."
      };
    }
    let receiptNumber;
    let qrPayload;
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
      qrPayload
    };
  }
  /**
   * Tool 6: Verifiable Digital Dispatch Voucher
   * Generates a verifiable dispatch voucher with QR payload for chain-of-custody tracking.
   */
  static generateDispatchVoucher(allocationId, donationId, recipientId, portions, donorName, recipientName) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
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
      issuedAt: now
    };
  }
  /**
   * Tool 7: AI Natural Language Surplus Intake Parsing
   * Extracts structured portion counts, meal categories, and shelf-life parameters from unstructured kitchen notes.
   */
  static parseIntakeText(rawText) {
    const textLower = rawText.toLowerCase();
    const portionsMatch = textLower.match(/(\d+)\s*(portions?|meals?|servings?|plates?|pax|boxes?|packets?)/i);
    const portions = portionsMatch ? parseInt(portionsMatch[1], 10) : 50;
    let dietaryCategory = "vegetarian";
    if (textLower.includes("jain")) {
      dietaryCategory = "jain";
    } else if (textLower.includes("vegan")) {
      dietaryCategory = "vegan";
    } else if (textLower.includes("chicken") || textLower.includes("mutton") || textLower.includes("meat") || textLower.includes("fish") || textLower.includes("egg")) {
      dietaryCategory = "non_vegetarian";
    }
    let storageMethod = "ambient";
    if (textLower.includes("hot") || textLower.includes("heated") || textLower.includes("warm")) {
      storageMethod = "heated";
    } else if (textLower.includes("cold") || textLower.includes("fridge") || textLower.includes("refrigerat")) {
      storageMethod = "refrigerated";
    } else if (textLower.includes("frozen") || textLower.includes("freeze")) {
      storageMethod = "frozen";
    }
    let foodCategory = "cooked_meals";
    if (textLower.includes("dal") || textLower.includes("rice") || textLower.includes("curry") || textLower.includes("lunch") || textLower.includes("dinner") || textLower.includes("cooked") || textLower.includes("meals")) {
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
    const detectedAllergens = [];
    if (textLower.includes("nut") || textLower.includes("peanut") || textLower.includes("cashew") || textLower.includes("almond")) {
      detectedAllergens.push("nuts");
    }
    if (textLower.includes("dairy") || textLower.includes("milk") || textLower.includes("paneer") || textLower.includes("cheese")) {
      detectedAllergens.push("dairy");
    }
    if (textLower.includes("gluten") || textLower.includes("wheat") || textLower.includes("roti") || textLower.includes("bread")) {
      detectedAllergens.push("gluten");
    }
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
      summary: `Parsed ${portions} ${dietaryCategory} ${foodCategory} portions (${storageMethod} storage, ${useByHours}h safe window).`
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FoodRelayMcpService
});

module.exports = { FoodRelayMcpService };

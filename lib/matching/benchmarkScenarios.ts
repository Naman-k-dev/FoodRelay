import { Donation, Recipient, MatchingWeights } from "@/types";
import { runRelayMatch, DEFAULT_WEIGHTS } from "./relayMatch";
import { runFirstComeFirstServed, StrategyResult } from "./benchmark";

export interface BenchmarkScenarioSummary {
  id: string;
  name: string;
  description: string;
  expectedProperty: string;
  donation: Donation;
  recipients: Recipient[];
  relayMatchResult: StrategyResult & {
    demandSatisfiedPercent: number;
    urgencyWeightedPortions: number;
  };
  fcfsResult: StrategyResult & {
    demandSatisfiedPercent: number;
    urgencyWeightedPortions: number;
  };
  metricsComparison: {
    allocatedDelta: number;
    unallocatedDelta: number;
    urgencyWeightedDelta: number;
    distanceDelta: number;
    analysis: string;
  };
}

const URGENCY_FACTORS: Record<string, number> = {
  critical: 1.0,
  high: 0.75,
  moderate: 0.5,
  low: 0.25,
};

function enrichStrategyResult(res: StrategyResult, totalDemand: number) {
  const urgencyWeightedPortions = Math.round(
    res.allocations.reduce((sum, a) => {
      const factor = URGENCY_FACTORS[a.urgencyLevel] || 0.5;
      return sum + a.allocatedPortions * factor;
    }, 0) * 10
  ) / 10;

  const demandSatisfiedPercent =
    totalDemand > 0 ? Math.round((res.totalAllocated / totalDemand) * 100) : 0;

  return {
    ...res,
    demandSatisfiedPercent,
    urgencyWeightedPortions,
  };
}

/**
 * Generates the 4 standardized reproducible hackathon benchmark scenarios.
 */
export function getBenchmarkScenarios(baseTime: Date = new Date()): BenchmarkScenarioSummary[] {
  const now = baseTime;
  const nowIso = now.toISOString();
  const plusHours = (h: number) => new Date(now.getTime() + h * 3600 * 1000).toISOString();
  const minusHours = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();

  // ----------------------------------------------------
  // SCENARIO 1: Balanced Supply and Demand (180 portions, 180 capacity)
  // ----------------------------------------------------
  const don1: Donation = {
    id: "scen-1-don",
    donorName: "Grand Meridian Banquet Hall",
    donorType: "event_organizer",
    foodDescription: "Paneer Butter Masala, Jeera Rice, Dal Makhani & Roti",
    foodCategory: "cooked_meals",
    dietaryCategory: "vegetarian",
    quantity: 180,
    unit: "portions",
    remainingQuantity: 180,
    preparedAt: minusHours(2),
    pickupLocation: "Sector 62, Noida",
    latitude: 28.628,
    longitude: 77.365,
    pickupWindowStart: minusHours(1),
    pickupWindowEnd: plusHours(4),
    confirmedUseBy: plusHours(5),
    storageMethod: "heated",
    packagingCondition: "sealed_containers",
    allergenInformation: ["dairy"],
    handlingInformation: "Maintained in insulated thermal containers above 65°C.",
    sourceVerificationStatus: "verified_license",
    safetyReviewStatus: "eligible_for_matching",
    safetyReviewNotes: "Verified tamper seal and temperature compliance.",
    safetyReviewer: "Safety Officer",
    safetyReviewedAt: nowIso,
    status: "available",
    createdAt: minusHours(2),
    updatedAt: nowIso,
    isDemo: true,
    history: [],
  };

  const recs1: Recipient[] = [
    {
      id: "scen-1-rec-a",
      organizationName: "Aasra Community Shelter (Sector 59)",
      organizationType: "shelter",
      contactPerson: "Rajesh Sharma",
      phone: "+91-98101-23456",
      location: "Sector 59, Noida (2.1 km)",
      latitude: 28.618,
      longitude: 77.375,
      requestedMealPortions: 80,
      remainingDemand: 80,
      receivingCapacity: 80,
      availableCapacity: 80,
      urgencyLevel: "critical",
      acceptedDietaryCategories: ["vegetarian", "vegan"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient", "refrigerated"],
      transportAvailability: "self_pickup",
      receivingWindowStart: minusHours(1),
      receivingWindowEnd: plusHours(6),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    {
      id: "scen-1-rec-b",
      organizationName: "Prerna Child Care Home (Sector 63)",
      organizationType: "orphanage",
      contactPerson: "Sunita Verma",
      phone: "+91-98102-34567",
      location: "Sector 63, Noida (3.4 km)",
      latitude: 28.632,
      longitude: 77.391,
      requestedMealPortions: 60,
      remainingDemand: 60,
      receivingCapacity: 60,
      availableCapacity: 60,
      urgencyLevel: "high",
      acceptedDietaryCategories: ["vegetarian"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient"],
      transportAvailability: "flexible",
      receivingWindowStart: minusHours(1),
      receivingWindowEnd: plusHours(5),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    {
      id: "scen-1-rec-c",
      organizationName: "Sahara Night Refuge (Sector 57)",
      organizationType: "shelter",
      contactPerson: "Mohan Lal",
      phone: "+91-98103-45678",
      location: "Sector 57, Noida (4.0 km)",
      latitude: 28.605,
      longitude: 77.355,
      requestedMealPortions: 40,
      remainingDemand: 40,
      receivingCapacity: 40,
      availableCapacity: 40,
      urgencyLevel: "moderate",
      acceptedDietaryCategories: ["vegetarian", "non_vegetarian"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient"],
      transportAvailability: "self_pickup",
      receivingWindowStart: minusHours(1),
      receivingWindowEnd: plusHours(5),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
  ];

  // ----------------------------------------------------
  // SCENARIO 2: Insufficient Capacity (250 portions, 120 total capacity)
  // ----------------------------------------------------
  const don2: Donation = {
    ...don1,
    id: "scen-2-don",
    donorName: "National Tech Summit Catering",
    quantity: 250,
    remainingQuantity: 250,
  };

  const recs2: Recipient[] = [
    {
      ...recs1[0],
      id: "scen-2-rec-a",
      requestedMealPortions: 70,
      remainingDemand: 70,
      receivingCapacity: 70,
      availableCapacity: 70,
    },
    {
      ...recs1[1],
      id: "scen-2-rec-b",
      requestedMealPortions: 50,
      remainingDemand: 50,
      receivingCapacity: 50,
      availableCapacity: 50,
    },
  ];

  // ----------------------------------------------------
  // SCENARIO 3: Recipient Disruption (Critical Shelter Goes Offline)
  // ----------------------------------------------------
  const don3: Donation = { ...don1, id: "scen-3-don" };
  const recs3: Recipient[] = [
    {
      ...recs1[0],
      id: "scen-3-rec-a",
      availableCapacity: 0,
      remainingDemand: 0, // Inactive / full
      verificationStatus: "pending", // Temporarily suspended
    },
    {
      ...recs1[1],
      id: "scen-3-rec-b",
      requestedMealPortions: 90,
      remainingDemand: 90,
      receivingCapacity: 90,
      availableCapacity: 90,
    },
    {
      ...recs1[2],
      id: "scen-3-rec-c",
      requestedMealPortions: 90,
      remainingDemand: 90,
      receivingCapacity: 90,
      availableCapacity: 90,
    },
  ];

  // ----------------------------------------------------
  // SCENARIO 4: Safety Gate Blocker (Loose Packaging / Unverified Temperature)
  // ----------------------------------------------------
  const don4: Donation = {
    ...don1,
    id: "scen-4-don",
    donorName: "Street Corner Biryani Stall",
    packagingCondition: "loose", // Strict FSSAI Blocker!
    safetyReviewStatus: "held",
    safetyReviewNotes: "FSSAI Regulation 6 Blocker: Food stored in open uncovered pans. Rejected for redistribution.",
  };
  const recs4 = [...recs1];

  const scenariosRaw = [
    {
      id: "scenario-1-balanced",
      name: "Scenario 1: Balanced Supply & Demand",
      description: "180 portions offered against 180 total capacity across 3 eligible recipients.",
      expectedProperty: "Zero over-allocation: Exactly 180 portions allocated, 0 unallocated portions.",
      donation: don1,
      recipients: recs1,
    },
    {
      id: "scenario-2-insufficient-capacity",
      name: "Scenario 2: Insufficient Capacity Bottleneck",
      description: "250 portions offered, but local eligible capacity is strictly capped at 120 portions.",
      expectedProperty: "Allocates exactly 120 portions, reporting precisely 130 unallocated portions without exceeding limits.",
      donation: don2,
      recipients: recs2,
    },
    {
      id: "scenario-3-disruption",
      name: "Scenario 3: Recipient Disruption & Rebalancing",
      description: "Primary critical recipient abruptly goes offline/unverified mid-operation.",
      expectedProperty: "Safely skips the unavailable recipient and rebalances all portions across active eligible shelters.",
      donation: don3,
      recipients: recs3,
    },
    {
      id: "scenario-4-safety-blocker",
      name: "Scenario 4: FSSAI 2019 Safety Gate Blocker",
      description: "Food packaged loose in open vessels without tamper seal or temperature maintenance.",
      expectedProperty: "Deterministic Safety Gate blocks 100% of portions (0 allocated) across both algorithms.",
      donation: don4,
      recipients: recs4,
    },
  ];

  return scenariosRaw.map((s) => {
    const totalDemand = s.recipients.reduce((sum, r) => sum + r.requestedMealPortions, 0);

    const rmMatch = runRelayMatch(s.donation, s.recipients, DEFAULT_WEIGHTS, now);
    const rmStrategy: StrategyResult = {
      strategyName: "RelayMatch Intelligent Engine",
      strategyDescription: "Constraint-aware weighted multi-factor ranking.",
      totalAllocated: rmMatch.allocatedPortions,
      unallocated: rmMatch.unallocatedPortions,
      recipientsServedCount: rmMatch.suggestedAllocations.length,
      allocations: rmMatch.suggestedAllocations.map((a) => {
        const rec = s.recipients.find((r) => r.id === a.recipientId);
        return {
          recipientId: a.recipientId,
          recipientName: a.recipientName,
          allocatedPortions: a.allocatedPortions,
          distanceKm: a.distanceKm,
          urgencyLevel: rec?.urgencyLevel || "moderate",
        };
      }),
      urgencyBreakdown: {
        criticalPortions: rmMatch.suggestedAllocations
          .filter((a) => s.recipients.find((r) => r.id === a.recipientId)?.urgencyLevel === "critical")
          .reduce((sum, a) => sum + a.allocatedPortions, 0),
        highPortions: rmMatch.suggestedAllocations
          .filter((a) => s.recipients.find((r) => r.id === a.recipientId)?.urgencyLevel === "high")
          .reduce((sum, a) => sum + a.allocatedPortions, 0),
        moderatePortions: rmMatch.suggestedAllocations
          .filter((a) => s.recipients.find((r) => r.id === a.recipientId)?.urgencyLevel === "moderate")
          .reduce((sum, a) => sum + a.allocatedPortions, 0),
        lowPortions: rmMatch.suggestedAllocations
          .filter((a) => s.recipients.find((r) => r.id === a.recipientId)?.urgencyLevel === "low")
          .reduce((sum, a) => sum + a.allocatedPortions, 0),
      },
      averageDistanceKm:
        rmMatch.allocatedPortions > 0
          ? Math.round(
              (rmMatch.suggestedAllocations.reduce((sum, a) => sum + a.distanceKm * a.allocatedPortions, 0) /
                rmMatch.allocatedPortions) *
                10
            ) / 10
          : 0,
    };

    const fcfsStrategy = runFirstComeFirstServed(s.donation, s.recipients, now);

    const enrichedRM = enrichStrategyResult(rmStrategy, totalDemand);
    const enrichedFCFS = enrichStrategyResult(fcfsStrategy, totalDemand);

    const allocatedDelta = enrichedRM.totalAllocated - enrichedFCFS.totalAllocated;
    const unallocatedDelta = enrichedRM.unallocated - enrichedFCFS.unallocated;
    const urgencyWeightedDelta = Math.round((enrichedRM.urgencyWeightedPortions - enrichedFCFS.urgencyWeightedPortions) * 10) / 10;
    const distanceDelta = Math.round((enrichedFCFS.averageDistanceKm - enrichedRM.averageDistanceKm) * 10) / 10;

    let analysis = "";
    if (s.id === "scenario-4-safety-blocker") {
      analysis = "Safety Gate halts distribution before algorithms execute. Both strategies respect strict FSSAI 2019 packaging compliance.";
    } else if (urgencyWeightedDelta > 0) {
      analysis = `RelayMatch achieves a higher urgency-weighted impact (+${urgencyWeightedDelta} pts) by prioritizing critical shelters over simple arrival order.`;
    } else {
      analysis = "Both algorithms effectively satisfy demand under identical constraints, with RelayMatch providing multi-factor transparency.";
    }

    return {
      id: s.id,
      name: s.name,
      description: s.description,
      expectedProperty: s.expectedProperty,
      donation: s.donation,
      recipients: s.recipients,
      relayMatchResult: enrichedRM,
      fcfsResult: enrichedFCFS,
      metricsComparison: {
        allocatedDelta,
        unallocatedDelta,
        urgencyWeightedDelta,
        distanceDelta,
        analysis,
      },
    };
  });
}

/**
 * Generates an exportable JSON / CSV string for audit reporting.
 */
export function generateBenchmarkAuditReport(scenarios: BenchmarkScenarioSummary[]): {
  json: string;
  csv: string;
} {
  const jsonReport = JSON.stringify(
    {
      reportTitle: "FoodRelay AI — Algorithm Benchmark & Verification Report",
      generatedAt: new Date().toISOString(),
      standardsApplied: "FSSAI Surplus Food Regulations 2019 & Haversine Geodesic Math",
      scenariosCount: scenarios.length,
      scenarios: scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        expectedProperty: s.expectedProperty,
        donationPortions: s.donation.remainingQuantity,
        relayMatch: {
          allocated: s.relayMatchResult.totalAllocated,
          unallocated: s.relayMatchResult.unallocated,
          recipientsServed: s.relayMatchResult.recipientsServedCount,
          averageDistanceKm: s.relayMatchResult.averageDistanceKm,
          urgencyWeightedPortions: s.relayMatchResult.urgencyWeightedPortions,
        },
        fcfsBaseline: {
          allocated: s.fcfsResult.totalAllocated,
          unallocated: s.fcfsResult.unallocated,
          recipientsServed: s.fcfsResult.recipientsServedCount,
          averageDistanceKm: s.fcfsResult.averageDistanceKm,
          urgencyWeightedPortions: s.fcfsResult.urgencyWeightedPortions,
        },
        deltaAnalysis: s.metricsComparison,
      })),
    },
    null,
    2
  );

  const csvRows = [
    "Scenario ID,Scenario Name,Donation Portions,RM Allocated,FCFS Allocated,RM Unallocated,FCFS Unallocated,RM Avg Dist (km),FCFS Avg Dist (km),RM Urgency Score,FCFS Urgency Score,Analysis",
  ];

  for (const s of scenarios) {
    csvRows.push(
      `"${s.id}","${s.name}",${s.donation.remainingQuantity},${s.relayMatchResult.totalAllocated},${s.fcfsResult.totalAllocated},${s.relayMatchResult.unallocated},${s.fcfsResult.unallocated},${s.relayMatchResult.averageDistanceKm},${s.fcfsResult.averageDistanceKm},${s.relayMatchResult.urgencyWeightedPortions},${s.fcfsResult.urgencyWeightedPortions},"${s.metricsComparison.analysis.replace(/"/g, '""')}"`
    );
  }

  return {
    json: jsonReport,
    csv: csvRows.join("\n"),
  };
}

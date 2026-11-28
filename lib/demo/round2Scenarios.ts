import { Donation, Recipient, UrgencyLevel } from "@/types";

/**
 * Creates the 6 official fictional NGOs for the Round 2 interactive demo
 * strictly matching Prompt Section 5 specifications.
 */
export function createRound2Recipients(now: Date = new Date()): Recipient[] {
  const minusHours = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
  const plusHours = (h: number) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

  return [
    {
      id: "demo-rec-a",
      organizationName: "Community Kitchen A",
      organizationType: "community_kitchen",
      contactPerson: "Rajesh Sharma (Coordinator)",
      phone: "+91-98111-10001",
      location: "Sector 59, Noida (2.5 km)",
      latitude: 28.618,
      longitude: 77.375,
      manualDistanceKm: 2.5,
      requestedMealPortions: 100,
      remainingDemand: 100,
      receivingCapacity: 80,
      availableCapacity: 80,
      urgencyLevel: "critical", // 100
      acceptedDietaryCategories: ["vegetarian", "vegan", "jain"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient", "refrigerated"],
      transportAvailability: "self_pickup",
      transportAvailable: true,
      status: "online",
      isOnline: true,
      receivingWindowStart: minusHours(1),
      receivingWindowEnd: plusHours(6),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    {
      id: "demo-rec-b",
      organizationName: "Hope Shelter B",
      organizationType: "shelter",
      contactPerson: "Sunita Verma (Director)",
      phone: "+91-98111-10002",
      location: "Sector 63, Noida (4.2 km)",
      latitude: 28.632,
      longitude: 77.391,
      manualDistanceKm: 4.2,
      requestedMealPortions: 100,
      remainingDemand: 100,
      receivingCapacity: 100,
      availableCapacity: 100,
      urgencyLevel: "high", // 75
      acceptedDietaryCategories: ["vegetarian", "vegan"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient"],
      transportAvailability: "flexible",
      transportAvailable: true,
      status: "online",
      isOnline: true,
      receivingWindowStart: minusHours(1),
      receivingWindowEnd: plusHours(5),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    {
      id: "demo-rec-c",
      organizationName: "Care Centre C",
      organizationType: "shelter",
      contactPerson: "Sister Maria (Logistics)",
      phone: "+91-98111-10003",
      location: "Sector 60, Noida (1.8 km)",
      latitude: 28.605,
      longitude: 77.355,
      manualDistanceKm: 1.8,
      requestedMealPortions: 120,
      remainingDemand: 120,
      receivingCapacity: 120,
      availableCapacity: 120,
      urgencyLevel: "medium", // 50
      acceptedDietaryCategories: ["vegetarian", "non_vegetarian", "vegan"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient"],
      transportAvailability: "self_pickup",
      transportAvailable: true,
      status: "online",
      isOnline: true,
      receivingWindowStart: minusHours(1),
      receivingWindowEnd: plusHours(5),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    {
      id: "demo-rec-d",
      organizationName: "Helping Hands D",
      organizationType: "ngo",
      contactPerson: "Anil Gupta (Field Lead)",
      phone: "+91-98111-10004",
      location: "Sector 58, Noida (6.5 km)",
      latitude: 28.61,
      longitude: 77.36,
      manualDistanceKm: 6.5,
      requestedMealPortions: 60,
      remainingDemand: 60,
      receivingCapacity: 60,
      availableCapacity: 60,
      urgencyLevel: "low", // 25
      acceptedDietaryCategories: ["vegetarian", "vegan"],
      allergenRestrictions: [],
      storageCapabilities: ["ambient", "refrigerated"],
      transportAvailability: "flexible",
      transportAvailable: true,
      status: "online",
      isOnline: true,
      receivingWindowStart: minusHours(1),
      receivingWindowEnd: plusHours(5),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    {
      id: "demo-rec-e",
      organizationName: "Sunrise Foundation E",
      organizationType: "community_kitchen",
      contactPerson: "Vikram Malhotra (Duty Manager)",
      phone: "+91-98111-10005",
      location: "Sector 62 Industrial Area (3.1 km)",
      latitude: 28.625,
      longitude: 77.368,
      manualDistanceKm: 3.1,
      requestedMealPortions: 150,
      remainingDemand: 150,
      receivingCapacity: 150,
      availableCapacity: 150,
      urgencyLevel: "critical", // 100
      acceptedDietaryCategories: ["vegetarian", "vegan"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient"],
      transportAvailability: "self_pickup",
      transportAvailable: true,
      status: "offline", // Non-negotiable initial offline status
      isOnline: false,
      receivingWindowStart: minusHours(1),
      receivingWindowEnd: plusHours(5),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    {
      id: "demo-rec-f",
      organizationName: "Community Support F",
      organizationType: "shelter",
      contactPerson: "Deepak Rawat (Dispatch Desk)",
      phone: "+91-98111-10006",
      location: "Sector 57, Noida (5.0 km)",
      latitude: 28.598,
      longitude: 77.345,
      manualDistanceKm: 5.0,
      requestedMealPortions: 90,
      remainingDemand: 90,
      receivingCapacity: 90,
      availableCapacity: 90,
      urgencyLevel: "high", // 75
      acceptedDietaryCategories: ["vegetarian", "vegan"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient"],
      transportAvailability: "unavailable", // Non-negotiable transport unavailable
      transportAvailable: false,
      status: "online",
      isOnline: true,
      receivingWindowStart: minusHours(1),
      receivingWindowEnd: plusHours(5),
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
  ];
}

/**
 * Creates the initial Greenfield College Canteen donation.
 */
export function createRound2Donation(now: Date = new Date()): Donation {
  const minusHours = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
  const plusHours = (h: number) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

  return {
    id: "demo-don-greenfield",
    donorName: "Greenfield College Canteen",
    donorType: "hostel",
    donorContact: "Manoj Kumar (Mess Manager, +91-98765-43210)",
    foodDescription: "Fresh vegetable biryani, dal makhani, and roti portions prepared for campus seminar.",
    foodCategory: "cooked_meals",
    dietaryCategory: "vegetarian",
    quantity: 180,
    unit: "portions",
    remainingQuantity: 180,
    preparedAt: minusHours(1.5),
    pickupLocation: "Sector 62, Noida (Demonstration Campus)",
    latitude: 28.628,
    longitude: 77.365,
    pickupWindowStart: minusHours(0.5),
    pickupWindowEnd: plusHours(3),
    confirmedUseBy: plusHours(4.5),
    storageMethod: "heated",
    packagingCondition: "sealed_containers",
    allergenInformation: ["dairy"],
    handlingInformation: "Maintained above 60°C in thermal insulated cambro transport containers.",
    sourceVerificationStatus: "verified_license",
    safetyReviewStatus: "eligible_for_matching",
    safetyReviewNotes: "Verified tamper-evident seal and thermal container temperature > 60°C per FSSAI 2019.",
    safetyReviewer: "Coordinator (Live Evaluation)",
    safetyReviewedAt: new Date().toISOString(),
    status: "available",
    createdAt: minusHours(1.5),
    updatedAt: minusHours(0.5),
    isDemo: true,
    history: [],
  };
}

export interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  expectedOutcome: string;
  apply: (
    currentDonation: Donation,
    currentRecipients: Recipient[],
    now: Date
  ) => { donation: Donation; recipients: Recipient[] };
}

export const ROUND2_SCENARIOS: ScenarioPreset[] = [
  {
    id: "scenario-a",
    name: "Scenario A: Normal Food Rescue",
    badge: "Baseline",
    description: "Standard 180-portion vegetarian surplus from college canteen matched to online recipients.",
    expectedOutcome: "180 portions allocated across online eligible NGOs according to weighted ranking.",
    apply: (_don, _recs, now) => ({
      donation: createRound2Donation(now),
      recipients: createRound2Recipients(now),
    }),
  },
  {
    id: "scenario-b",
    name: "Scenario B: Critical Hunger Demand",
    badge: "Urgency Shift",
    description: "Care Centre C (1.8 km) experiences an emergency surge, shifting urgency from Medium (50) to Critical (100).",
    expectedOutcome: "Care Centre C score jumps to top ranking; allocated maximum capacity first.",
    apply: (don, recs) => {
      const updatedRecs = recs.map((r) =>
        r.id === "demo-rec-c" ? { ...r, urgencyLevel: "critical" as UrgencyLevel } : r
      );
      return { donation: { ...don }, recipients: updatedRecs };
    },
  },
  {
    id: "scenario-c",
    name: "Scenario C: NGO Goes Offline",
    badge: "Hard Constraint",
    description: "Community Kitchen A (highest rank) loses power and switches offline.",
    expectedOutcome: "Community Kitchen A immediately receives exactly 0 portions; portions redistributed to remaining online NGOs.",
    apply: (don, recs) => {
      const updatedRecs = recs.map((r) =>
        r.id === "demo-rec-a"
          ? { ...r, status: "offline" as const, isOnline: false }
          : r
      );
      return { donation: { ...don }, recipients: updatedRecs };
    },
  },
  {
    id: "scenario-d",
    name: "Scenario D: Capacity Shortage",
    badge: "Unallocated Surplus",
    description: "Donation quantity increased to 250 portions, but total online receiving capacity is restricted to 120 portions.",
    expectedOutcome: "Exactly 120 portions allocated; remaining 130 portions clearly reported as unallocated surplus.",
    apply: (don, recs) => {
      const updatedDon: Donation = {
        ...don,
        quantity: 250,
        remainingQuantity: 250,
      };
      // Restrict online recipients so total capacity = 120 (Care Centre C = 120, all others offline)
      const updatedRecs = recs.map((r) => {
        if (r.id === "demo-rec-c") {
          return { ...r, status: "online" as const, isOnline: true, availableCapacity: 120, remainingDemand: 120 };
        }
        return { ...r, status: "offline" as const, isOnline: false };
      });
      return { donation: updatedDon, recipients: updatedRecs };
    },
  },
  {
    id: "scenario-e",
    name: "Scenario E: Transport Failure",
    badge: "Logistics Block",
    description: "Hope Shelter B reports van mechanical failure; transport becomes unavailable.",
    expectedOutcome: "Hope Shelter B is excluded with 'Transportation unavailable'; portions re-routed to other partners.",
    apply: (don, recs) => {
      const updatedRecs = recs.map((r) =>
        r.id === "demo-rec-b"
          ? { ...r, transportAvailable: false, transportAvailability: "unavailable" as const }
          : r
      );
      return { donation: { ...don }, recipients: updatedRecs };
    },
  },
  {
    id: "scenario-f",
    name: "Scenario F: Dietary Mismatch",
    badge: "Safety / Diet",
    description: "Donation contains chicken curry (non_vegetarian) while primary shelters only accept strictly vegetarian/vegan food.",
    expectedOutcome: "Strictly vegetarian shelters excluded due to dietary mismatch; food allocated only to compatible shelters.",
    apply: (don, recs) => {
      const updatedDon: Donation = {
        ...don,
        foodDescription: "Chicken Biryani & Egg Curry portions",
        dietaryCategory: "non_vegetarian",
      };
      return { donation: updatedDon, recipients: recs };
    },
  },
  {
    id: "scenario-g",
    name: "Scenario G: Food Safety Blocker",
    badge: "FSSAI Safety Gate",
    description: "Food packaging is loose or simulated human safety coordinator inspection is pending/unapproved.",
    expectedOutcome: "Matching engine strictly halts matching. Zero portions allocated until safety compliance is satisfied.",
    apply: (don, recs) => {
      const updatedDon: Donation = {
        ...don,
        packagingCondition: "loose",
        safetyReviewStatus: "awaiting_human_review",
        status: "awaiting_review",
        handlingInformation: "Uncovered aluminum trays",
      };
      return { donation: updatedDon, recipients: recs };
    },
  },
  {
    id: "scenario-h",
    name: "Scenario H: No NGOs Available",
    badge: "Network Blackout",
    description: "All 6 recipient organizations are set offline simultaneously.",
    expectedOutcome: "Zero allocated portions. 100% of donation reported as unallocated. System explains no recipients available.",
    apply: (don, recs) => {
      const updatedRecs = recs.map((r) => ({
        ...r,
        status: "offline" as const,
        isOnline: false,
      }));
      return { donation: { ...don }, recipients: updatedRecs };
    },
  },
  {
    id: "scenario-i",
    name: "Scenario I: Large Scale Event (1000 Portions)",
    badge: "Mega Surge",
    description: "Large 1000-portion surplus from wedding banquet distributed across network.",
    expectedOutcome: "All available capacity across eligible online NGOs is absorbed; remaining surplus explicitly displayed.",
    apply: (don, recs) => {
      const updatedDon: Donation = {
        ...don,
        donorName: "Grand Noida Convention Center",
        foodDescription: "1000 portions of fresh banquet meals (Dal Makhani, Shahi Paneer, Pulao, Naan)",
        quantity: 1000,
        remainingQuantity: 1000,
      };
      // Restore online recipients with full capacities
      const updatedRecs = recs.map((r) => {
        if (r.id === "demo-rec-e" || r.id === "demo-rec-f") return r; // keep E offline, F no transport
        return { ...r, status: "online" as const, isOnline: true };
      });
      return { donation: updatedDon, recipients: updatedRecs };
    },
  },
];

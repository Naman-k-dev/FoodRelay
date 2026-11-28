"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  Donation,
  Recipient,
  MatchResult,
  MatchingWeights,
  UrgencyLevel,
  DietaryCategory,
  FoodCategory,
  StorageMethod,
  PackagingCondition,
} from "@/types";
import { runRelayMatch, DEFAULT_WEIGHTS } from "@/lib/matching/relayMatch";
import {
  createRound2Donation,
  createRound2Recipients,
  ROUND2_SCENARIOS,
  ScenarioPreset,
} from "@/lib/demo/round2Scenarios";

export interface DemoReservation {
  id: string;
  recipientId: string;
  recipientName: string;
  portions: number;
  status: "reserved" | "accepted" | "collected" | "delivered" | "cancelled";
  confirmedAt: string;
  isDisrupted?: boolean;
  disruptionReason?: string;
  qrCodeHash?: string;
}

export interface RedistributionEvent {
  timestamp: string;
  affectedRecipientId: string;
  affectedRecipientName: string;
  releasedPortions: number;
  redistributedPortions: number;
  unallocatedPortions: number;
  message: string;
}

export interface SafetyReviewState {
  isApproved: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  temperatureStatus: "safe" | "marginal" | "unsafe";
  storageCondition: "compliant" | "non_compliant";
  packagingIntegrity: "intact" | "compromised";
  timeWindowVerified: boolean;
  fssaiChecklist: {
    packagingSealed: boolean;
    temperatureControlled: boolean;
    useByWithinLimit: boolean;
    donorIdentityConfirmed: boolean;
    sensoryInspectionPassed: boolean;
  };
  notes?: string;
}

export interface DemoSessionContextType {
  // Core Domain State
  donation: Donation;
  recipients: Recipient[];
  safetyReview: SafetyReviewState;
  reservations: DemoReservation[];
  weights: MatchingWeights;
  activeScenarioId: string;
  isPresentationMode: boolean;
  lastSaved: string | null;
  lastRedistributionEvent: RedistributionEvent | null;

  // Derived Match Result (Deterministic & Pure)
  matchResult: MatchResult;

  // Mutation Actions
  updateDonation: (updater: (prev: Donation) => Donation) => void;
  updateDonationField: <K extends keyof Donation>(field: K, value: Donation[K]) => void;
  updateRecipientStatus: (recipientId: string, isOnline: boolean) => void;
  updateRecipientUrgency: (recipientId: string, urgency: UrgencyLevel) => void;
  updateRecipientTransport: (recipientId: string, available: boolean) => void;
  updateRecipientField: <K extends keyof Recipient>(recipientId: string, field: K, value: Recipient[K]) => void;
  addCustomRecipient: (recipient: Recipient) => void;
  removeRecipient: (recipientId: string) => void;

  // Safety Gate Actions
  approveSafety: (notes?: string) => void;
  revokeSafety: (reason?: string) => void;
  updateSafetyChecklist: (key: keyof SafetyReviewState["fssaiChecklist"], checked: boolean) => void;

  // Reservation & Dispatch Actions
  confirmAllocationPlan: () => void;
  advanceDispatchStatus: (reservationId: string) => void;
  resolveDisruptedReservation: (reservationId: string) => void;

  // Presets & Presentation
  applyScenario: (scenarioId: string) => void;
  togglePresentationMode: () => void;
  dismissRedistributionEvent: () => void;
  resetDemo: () => void;
}

const STORAGE_KEY = "foodrelay_demo_session_v2";

const DEFAULT_SAFETY_REVIEW: SafetyReviewState = {
  isApproved: true, // Default to approved for quick demo exploration, but fully togglable
  reviewedAt: new Date().toISOString(),
  reviewedBy: "Dr. A. Verma (Simulated FSSAI Food Safety Coordinator)",
  temperatureStatus: "safe",
  storageCondition: "compliant",
  packagingIntegrity: "intact",
  timeWindowVerified: true,
  fssaiChecklist: {
    packagingSealed: true,
    temperatureControlled: true,
    useByWithinLimit: true,
    donorIdentityConfirmed: true,
    sensoryInspectionPassed: true,
  },
  notes: "Simulated review: Fresh hot meal inspected under FSSAI 2019 guidelines.",
};

const DemoSessionContext = createContext<DemoSessionContextType | null>(null);

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [now] = useState(() => new Date());

  // Core State
  const [donation, setDonation] = useState<Donation>(() => createRound2Donation(now));
  const [recipients, setRecipients] = useState<Recipient[]>(() => createRound2Recipients(now));
  const [safetyReview, setSafetyReview] = useState<SafetyReviewState>(DEFAULT_SAFETY_REVIEW);
  const [reservations, setReservations] = useState<DemoReservation[]>([]);
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_WEIGHTS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("scenario-a");
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [lastRedistributionEvent, setLastRedistributionEvent] = useState<RedistributionEvent | null>(null);

  // Client Hydration & LocalStorage Restore
  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.donation && Array.isArray(parsed.recipients)) {
          setDonation(parsed.donation);
          setRecipients(parsed.recipients);
          if (parsed.safetyReview) setSafetyReview(parsed.safetyReview);
          if (Array.isArray(parsed.reservations)) setReservations(parsed.reservations);
          if (parsed.weights) setWeights(parsed.weights);
          if (parsed.activeScenarioId) setActiveScenarioId(parsed.activeScenarioId);
          if (typeof parsed.isPresentationMode === "boolean") setIsPresentationMode(parsed.isPresentationMode);
          setLastSaved(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.warn("Failed to restore FoodRelay demo session from LocalStorage:", e);
    }
  }, []);

  // Save to LocalStorage whenever authoritative session state changes
  useEffect(() => {
    if (!isClient) return;
    try {
      const sessionData = {
        donation,
        recipients,
        safetyReview,
        reservations,
        weights,
        activeScenarioId,
        isPresentationMode,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      setLastSaved(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn("Failed to write FoodRelay demo session to LocalStorage:", e);
    }
  }, [donation, recipients, safetyReview, reservations, weights, activeScenarioId, isPresentationMode, isClient]);

  // Pure Deterministic RelayMatch Engine Execution
  const matchResult: MatchResult = useMemo(() => {
    // Safety review gate: if not approved, donation is marked awaiting review
    const testDonation: Donation = {
      ...donation,
      safetyReviewStatus: safetyReview.isApproved ? "eligible_for_matching" : "awaiting_human_review",
      status: safetyReview.isApproved ? "available" : "awaiting_review",
    };

    // Calculate existing active reservations per recipient to avoid duplicate over-allocation
    const reservedPortionsMap = new Map<string, number>();
    for (const res of reservations) {
      if (res.status === "reserved" || res.status === "accepted" || res.status === "collected") {
        reservedPortionsMap.set(res.recipientId, (reservedPortionsMap.get(res.recipientId) || 0) + res.portions);
      }
    }

    // Adjust recipient remaining capacity and demand based on active reservations
    const adjustedRecipients = recipients.map((r) => {
      const alreadyReserved = reservedPortionsMap.get(r.id) || 0;
      return {
        ...r,
        availableCapacity: Math.max(0, r.receivingCapacity - alreadyReserved),
        remainingDemand: Math.max(0, r.requestedMealPortions - alreadyReserved),
      };
    });

    return runRelayMatch(testDonation, adjustedRecipients, weights, now);
  }, [donation, recipients, safetyReview, reservations, weights, now]);

  // Invalidate uncommitted proposals when donation inputs change
  const updateDonation = useCallback((updater: (prev: Donation) => Donation) => {
    setDonation((prev) => {
      const next = updater(prev);
      return next;
    });
  }, []);

  const updateDonationField = useCallback(<K extends keyof Donation>(field: K, value: Donation[K]) => {
    setDonation((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "quantity" ? { remainingQuantity: typeof value === "number" ? value : prev.remainingQuantity } : {}),
    }));
  }, []);

  // AUTOMATIC REDISTRIBUTION ENGINE: Triggered when an NGO becomes offline or returns online
  const updateRecipientStatus = useCallback(
    (recipientId: string, isOnline: boolean) => {
      // 1. Snapshot previous proposed allocations for this recipient
      const prevAllocation = matchResult.suggestedAllocations.find((a) => a.recipientId === recipientId);
      const releasedPortions = prevAllocation ? prevAllocation.allocatedPortions : 0;
      const targetNgo = recipients.find((r) => r.id === recipientId);
      const targetName = targetNgo ? targetNgo.organizationName : "Recipient NGO";

      // 2. Update recipient state
      setRecipients((prev) =>
        prev.map((r) =>
          r.id === recipientId
            ? {
                ...r,
                isOnline,
                status: isOnline ? "online" : "offline",
                receivingAvailability: isOnline ? true : false,
              }
            : r
        )
      );

      // 3. Check for disrupted confirmed reservations (if NGO went offline while reservation active)
      if (!isOnline) {
        setReservations((prev) =>
          prev.map((res) => {
            if (res.recipientId === recipientId && (res.status === "reserved" || res.status === "accepted")) {
              return {
                ...res,
                isDisrupted: true,
                disruptionReason: `${targetName} went offline while reservation was awaiting collection.`,
              };
            }
            return res;
          })
        );
      }

      // 4. Calculate reactive redistribution if portions were released
      if (!isOnline && releasedPortions > 0) {
        // Compute what new allocations would look like without this recipient
        const nextRecipients = recipients.map((r) =>
          r.id === recipientId
            ? { ...r, isOnline: false, status: "offline" as const, receivingAvailability: false }
            : r
        );
        const nextMatch = runRelayMatch(
          {
            ...donation,
            safetyReviewStatus: safetyReview.isApproved ? "eligible_for_matching" : "awaiting_human_review",
            status: safetyReview.isApproved ? "available" : "awaiting_review",
          },
          nextRecipients,
          weights,
          now
        );

        // Sum newly gained portions by other eligible recipients
        let gainedPortions = 0;
        for (const nextAlloc of nextMatch.suggestedAllocations) {
          const prevAlloc = matchResult.suggestedAllocations.find((a) => a.recipientId === nextAlloc.recipientId);
          const prevPortions = prevAlloc ? prevAlloc.allocatedPortions : 0;
          if (nextAlloc.allocatedPortions > prevPortions) {
            gainedPortions += nextAlloc.allocatedPortions - prevPortions;
          }
        }

        const unallocated = Math.max(0, releasedPortions - gainedPortions);

        setLastRedistributionEvent({
          timestamp: new Date().toLocaleTimeString(),
          affectedRecipientId: recipientId,
          affectedRecipientName: targetName,
          releasedPortions,
          redistributedPortions: gainedPortions,
          unallocatedPortions: unallocated,
          message: `${targetName} is offline. ${releasedPortions} portions released: ${gainedPortions} redistributed to eligible partners${
            unallocated > 0 ? `, ${unallocated} unallocated due to network capacity limits.` : "."
          }`,
        });
      } else if (isOnline) {
        setLastRedistributionEvent({
          timestamp: new Date().toLocaleTimeString(),
          affectedRecipientId: recipientId,
          affectedRecipientName: targetName,
          releasedPortions: 0,
          redistributedPortions: 0,
          unallocatedPortions: 0,
          message: `${targetName} returned online. Allocations re-evaluated across active partners.`,
        });
      }
    },
    [matchResult, recipients, donation, safetyReview, weights, now]
  );

  const updateRecipientUrgency = useCallback((recipientId: string, urgency: UrgencyLevel) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === recipientId ? { ...r, urgencyLevel: urgency } : r))
    );
  }, []);

  const updateRecipientTransport = useCallback((recipientId: string, available: boolean) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === recipientId
          ? {
              ...r,
              transportAvailable: available,
              transportAvailability: available ? "self_pickup" : "unavailable",
            }
          : r
      )
    );
  }, []);

  const updateRecipientField = useCallback(
    <K extends keyof Recipient>(recipientId: string, field: K, value: Recipient[K]) => {
      setRecipients((prev) =>
        prev.map((r) => (r.id === recipientId ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  const addCustomRecipient = useCallback((recipient: Recipient) => {
    setRecipients((prev) => [recipient, ...prev]);
  }, []);

  const removeRecipient = useCallback((recipientId: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== recipientId));
  }, []);

  // Safety Gate Handlers
  const approveSafety = useCallback((notes?: string) => {
    setSafetyReview((prev) => ({
      ...prev,
      isApproved: true,
      reviewedAt: new Date().toISOString(),
      notes: notes || prev.notes,
    }));
  }, []);

  const revokeSafety = useCallback((reason?: string) => {
    setSafetyReview((prev) => ({
      ...prev,
      isApproved: false,
      reviewedAt: undefined,
      notes: reason || "Safety review revoked by coordinator.",
    }));
  }, []);

  const updateSafetyChecklist = useCallback((key: keyof SafetyReviewState["fssaiChecklist"], checked: boolean) => {
    setSafetyReview((prev) => {
      const nextChecklist = { ...prev.fssaiChecklist, [key]: checked };
      // All items must be checked for safety approval
      const allChecked = Object.values(nextChecklist).every(Boolean);
      return {
        ...prev,
        fssaiChecklist: nextChecklist,
        isApproved: allChecked,
      };
    });
  }, []);

  // Allocation Confirmation & Dispatch Progression
  const confirmAllocationPlan = useCallback(() => {
    if (!matchResult.suggestedAllocations.length) return;

    const newReservations: DemoReservation[] = matchResult.suggestedAllocations.map((alloc) => {
      const cryptoHash = Math.random().toString(36).substring(2, 10).toUpperCase();
      return {
        id: `res-${alloc.recipientId}-${Date.now()}`,
        recipientId: alloc.recipientId,
        recipientName: alloc.recipientName,
        portions: alloc.allocatedPortions,
        status: "reserved",
        confirmedAt: new Date().toISOString(),
        qrCodeHash: `FOODRELAY-VERIFY-${cryptoHash}-${alloc.allocatedPortions}P`,
      };
    });

    setReservations(newReservations);
  }, [matchResult]);

  const advanceDispatchStatus = useCallback((reservationId: string) => {
    setReservations((prev) =>
      prev.map((res) => {
        if (res.id !== reservationId) return res;
        if (res.isDisrupted) return res; // Block progression of disrupted operations

        let nextStatus: DemoReservation["status"] = res.status;
        if (res.status === "reserved") nextStatus = "accepted";
        else if (res.status === "accepted") nextStatus = "collected";
        else if (res.status === "collected") nextStatus = "delivered";

        return { ...res, status: nextStatus };
      })
    );
  }, []);

  const resolveDisruptedReservation = useCallback(
    (reservationId: string) => {
      setReservations((prev) => {
        const target = prev.find((r) => r.id === reservationId);
        if (!target) return prev;

        // Cancel the reservation, release portions back to donation
        const remaining = prev.filter((r) => r.id !== reservationId);
        return remaining;
      });

      // Clear the event and allow automatic redistribution to absorb the released portions
      setLastRedistributionEvent({
        timestamp: new Date().toLocaleTimeString(),
        affectedRecipientId: "disrupted",
        affectedRecipientName: "Disrupted NGO",
        releasedPortions: 0,
        redistributedPortions: 0,
        unallocatedPortions: 0,
        message: "Disrupted reservation resolved. Food released and automatically redistributed to eligible partners.",
      });
    },
    []
  );

  // Scenario Preset Trigger
  const applyScenario = useCallback(
    (scenarioId: string) => {
      const preset = ROUND2_SCENARIOS.find((s) => s.id === scenarioId);
      if (!preset) return;

      setActiveScenarioId(preset.id);
      const updated = preset.apply(donation, recipients, now);
      setDonation(updated.donation);
      setRecipients(updated.recipients);

      if (preset.id === "scenario-g") {
        setSafetyReview((prev) => ({ ...prev, isApproved: false }));
      } else {
        setSafetyReview((prev) => ({ ...prev, isApproved: true }));
      }

      setReservations([]);
      setLastRedistributionEvent({
        timestamp: new Date().toLocaleTimeString(),
        affectedRecipientId: preset.id,
        affectedRecipientName: preset.name,
        releasedPortions: 0,
        redistributedPortions: 0,
        unallocatedPortions: 0,
        message: `Applied ${preset.name}: ${preset.description}`,
      });
    },
    [donation, recipients, now]
  );

  const togglePresentationMode = useCallback(() => {
    setIsPresentationMode((prev) => !prev);
  }, []);

  const dismissRedistributionEvent = useCallback(() => {
    setLastRedistributionEvent(null);
  }, []);

  // Global Demo Reset
  const resetDemo = useCallback(() => {
    const freshNow = new Date();
    const freshDonation = createRound2Donation(freshNow);
    const freshRecipients = createRound2Recipients(freshNow);

    setDonation(freshDonation);
    setRecipients(freshRecipients);
    setSafetyReview(DEFAULT_SAFETY_REVIEW);
    setReservations([]);
    setWeights(DEFAULT_WEIGHTS);
    setActiveScenarioId("scenario-a");
    setLastRedistributionEvent(null);

    try {
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn("Failed to clear LocalStorage:", e);
    }
  }, []);

  return (
    <DemoSessionContext.Provider
      value={{
        donation,
        recipients,
        safetyReview,
        reservations,
        weights,
        activeScenarioId,
        isPresentationMode,
        lastSaved,
        lastRedistributionEvent,
        matchResult,
        updateDonation,
        updateDonationField,
        updateRecipientStatus,
        updateRecipientUrgency,
        updateRecipientTransport,
        updateRecipientField,
        addCustomRecipient,
        removeRecipient,
        approveSafety,
        revokeSafety,
        updateSafetyChecklist,
        confirmAllocationPlan,
        advanceDispatchStatus,
        resolveDisruptedReservation,
        applyScenario,
        togglePresentationMode,
        dismissRedistributionEvent,
        resetDemo,
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext);
  if (!context) {
    throw new Error("useDemoSession must be used within a DemoSessionProvider");
  }
  return context;
}

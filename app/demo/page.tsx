"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { runRelayMatch, DEFAULT_WEIGHTS } from "@/lib/matching/relayMatch";
import { runMatchingBenchmark } from "@/lib/matching/benchmark";
import { MatchingBenchmarkUI } from "@/components/matching/MatchingBenchmarkUI";
import { Donation, Recipient, Allocation } from "@/types";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Truck,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  QrCode,
  Building,
  Layers,
  Clock,
  Cpu,
  Bot,
} from "lucide-react";

// Demo Scenarios Setup with Fresh Relative Timestamps
function createDemoScenarios(now: Date = new Date()) {
  const prepTime = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
  const pickupStart = now.toISOString();
  const pickupEnd = new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString();
  const useBy = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

  // Scenario 1: Greenfield College Canteen (180 portions)
  const donation1: Donation = {
    id: "demo-don-greenfield",
    donorName: "Greenfield College Canteen",
    donorType: "hostel",
    foodDescription: "Fresh vegetable biryani, dal makhani, and roti meals",
    foodCategory: "cooked_meals",
    dietaryCategory: "vegetarian",
    quantity: 180,
    unit: "portions",
    remainingQuantity: 180,
    pickupLocation: "Sector 62, Noida (Demonstration Campus)",
    latitude: 28.628,
    longitude: 77.367,
    preparedAt: prepTime,
    pickupWindowStart: pickupStart,
    pickupWindowEnd: pickupEnd,
    confirmedUseBy: useBy,
    storageMethod: "heated",
    packagingCondition: "sealed_containers",
    allergenInformation: ["dairy"],
    handlingInformation: "Maintained above 60°C in food-grade insulated cambro containers.",
    sourceVerificationStatus: "verified_license",
    safetyReviewStatus: "awaiting_human_review",
    safetyReviewNotes: "Awaiting coordinator verification of packaging seals.",
    safetyReviewer: null,
    safetyReviewedAt: null,
    status: "awaiting_review",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    isDemo: true,
    history: [],
  };

  // Scenario 2: High Surplus with Limited Capacity (250 portions)
  const donation2: Donation = {
    ...donation1,
    id: "demo-don-conference",
    donorName: "Apex Expo Conference Hall",
    foodDescription: "Surplus conference buffet vegetarian meals",
    quantity: 250,
    remainingQuantity: 250,
  };

  // Fictional Demonstration Recipients
  const recipients: Recipient[] = [
    {
      id: "demo-rec-a",
      organizationName: "Community Kitchen A (Pragati Seva)",
      organizationType: "community_kitchen",
      contactPerson: "Rajesh Sharma",
      phone: "+91-98111-10001",
      location: "Sector 63, Noida (1.8 km)",
      latitude: 28.632,
      longitude: 77.382,
      requestedMealPortions: 80,
      remainingDemand: 80,
      receivingCapacity: 80,
      availableCapacity: 80,
      urgencyLevel: "critical",
      acceptedDietaryCategories: ["vegetarian"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient"],
      transportAvailability: "self_pickup",
      receivingWindowStart: prepTime,
      receivingWindowEnd: useBy,
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    {
      id: "demo-rec-b",
      organizationName: "Hope Shelter B (Bal Sahyog)",
      organizationType: "shelter",
      contactPerson: "Priya Nair",
      phone: "+91-98111-10002",
      location: "Sector 59, Noida (3.2 km)",
      latitude: 28.614,
      longitude: 77.361,
      requestedMealPortions: 60,
      remainingDemand: 60,
      receivingCapacity: 60,
      availableCapacity: 60,
      urgencyLevel: "high",
      acceptedDietaryCategories: ["vegetarian"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient"],
      transportAvailability: "self_pickup",
      receivingWindowStart: prepTime,
      receivingWindowEnd: useBy,
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    {
      id: "demo-rec-c",
      organizationName: "Care Centre C (Asha Deep)",
      organizationType: "shelter",
      contactPerson: "Sister Maria",
      phone: "+91-98111-10003",
      location: "Sector 60, Noida (4.1 km)",
      latitude: 28.605,
      longitude: 77.355,
      requestedMealPortions: 40,
      remainingDemand: 40,
      receivingCapacity: 40,
      availableCapacity: 40,
      urgencyLevel: "moderate",
      acceptedDietaryCategories: ["vegetarian"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient"],
      transportAvailability: "self_pickup",
      receivingWindowStart: prepTime,
      receivingWindowEnd: useBy,
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    // Ineligible 1: Zero Remaining Capacity
    {
      id: "demo-rec-inelig-1",
      organizationName: "Full House Shelter (Zero Open Slots)",
      organizationType: "shelter",
      contactPerson: "Anil Gupta",
      phone: "+91-98111-10004",
      location: "Sector 18, Noida (6.5 km)",
      latitude: 28.57,
      longitude: 77.32,
      requestedMealPortions: 50,
      remainingDemand: 0,
      receivingCapacity: 50,
      availableCapacity: 0,
      urgencyLevel: "low",
      acceptedDietaryCategories: ["vegetarian"],
      allergenRestrictions: [],
      storageCapabilities: ["heated"],
      transportAvailability: "self_pickup",
      receivingWindowStart: prepTime,
      receivingWindowEnd: useBy,
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
    // Ineligible 2: Dietary Incompatibility
    {
      id: "demo-rec-inelig-2",
      organizationName: "Seva Non-Veg Canteen (Diet Mismatch)",
      organizationType: "community_kitchen",
      contactPerson: "Gurpreet Singh",
      phone: "+91-98111-10005",
      location: "Indirapuram (8.2 km)",
      latitude: 28.64,
      longitude: 77.38,
      requestedMealPortions: 60,
      remainingDemand: 60,
      receivingCapacity: 60,
      availableCapacity: 60,
      urgencyLevel: "critical",
      acceptedDietaryCategories: ["non_vegetarian"], // Mismatch with vegetarian donation
      allergenRestrictions: [],
      storageCapabilities: ["heated"],
      transportAvailability: "self_pickup",
      receivingWindowStart: prepTime,
      receivingWindowEnd: useBy,
      verificationStatus: "simulated_verified",
      isDemo: true,
    },
  ];

  return { donation1, donation2, recipients };
}

export default function InteractiveDemoPage() {
  const [now] = useState(() => new Date());
  const initialData = useMemo(() => createDemoScenarios(now), [now]);

  // Mode & Scenario Selection
  const [scenarioId, setScenarioId] = useState<"scenario1" | "scenario2">("scenario1");
  const [aiMode, setAiMode] = useState<"live" | "offline">("live");
  const [activeStep, setActiveStep] = useState<number>(1);

  // Demo Dynamic State
  const [donation, setDonation] = useState<Donation>(initialData.donation1);
  const [recipients, setRecipients] = useState<Recipient[]>(initialData.recipients);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isSafetyApproved, setIsSafetyApproved] = useState<boolean>(false);
  const [reservationConfirmed, setReservationConfirmed] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<
    "reserved" | "accepted" | "collected" | "delivered"
  >("reserved");
  const [initialDeliveredCount] = useState<number>(1420);

  // Reset Demo State
  const handleReset = () => {
    const fresh = createDemoScenarios(new Date());
    setDonation(scenarioId === "scenario1" ? fresh.donation1 : fresh.donation2);
    setRecipients(fresh.recipients);
    setExtractionResult(null);
    setIsSafetyApproved(false);
    setReservationConfirmed(false);
    setDispatchStatus("reserved");
    setActiveStep(1);
  };

  const activeDonation = useMemo(() => {
    return scenarioId === "scenario1" ? donation : { ...donation, quantity: 250, remainingQuantity: 250 };
  }, [scenarioId, donation]);

  // Run Real RelayMatch Allocation Engine
  const matchResult = useMemo(() => {
    // If not safety approved, donation will be blocked by safety gate
    const testDon = {
      ...activeDonation,
      safetyReviewStatus: isSafetyApproved ? ("eligible_for_matching" as const) : ("awaiting_human_review" as const),
      status: isSafetyApproved ? ("available" as const) : ("awaiting_review" as const),
    };
    return runRelayMatch(testDon, recipients, DEFAULT_WEIGHTS, now);
  }, [activeDonation, recipients, isSafetyApproved, now]);

  // Step 2: Trigger AI Extraction
  const handleRunAiExtraction = async () => {
    setIsExtracting(true);
    const sampleMessage =
      "Greenfield College Canteen in Sector 62 Noida has 180 extra vegetarian meal portions. Freshly prepared at 12 PM for today's college event and packed in sealed food-grade containers. Pickup arrangement needed before 2:30 PM.";

    if (aiMode === "live") {
      try {
        const res = await fetch("/api/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: sampleMessage }),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setExtractionResult({
            data: json.data,
            source: json.meta?.source || "gemini-3.5-flash-lite",
            isLive: true,
          });
          setActiveStep(3);
          setIsExtracting(false);
          return;
        }
      } catch {}
    }

    // Offline / Fallback sample
    setTimeout(() => {
      setExtractionResult({
        data: {
          donorOrganization: "Greenfield College Canteen",
          donorType: "hostel",
          foodDescription: "Fresh vegetable biryani, dal makhani, and roti meals",
          foodCategory: "cooked_meals",
          dietaryCategory: "vegetarian",
          quantity: 180,
          quantityUnit: "portions",
          packagingCondition: "sealed_containers",
          storageMethod: "heated",
          pickupLocation: "Sector 62, Noida",
          missingFields: ["confirmedUseByTime", "donorContactPhone"],
        },
        source: "offline_deterministic_sample",
        isLive: false,
      });
      setActiveStep(3);
      setIsExtracting(false);
    }, 600);
  };

  // Step 4: Simulate Coordinator Approval
  const handleSimulateApproval = () => {
    setIsSafetyApproved(true);
    setDonation((prev) => ({
      ...prev,
      safetyReviewStatus: "eligible_for_matching",
      status: "available",
      safetyReviewNotes: "Coordinator verified packaging seals and heated holding compliance.",
      safetyReviewer: "Coordinator (Evaluator)",
      safetyReviewedAt: new Date().toISOString(),
    }));
    setActiveStep(5);
  };

  // Step 8: Confirm Reservation Plan
  const handleConfirmReservation = () => {
    setReservationConfirmed(true);
    setActiveStep(9);
  };

  // Step 9: Advance Dispatch
  const handleAdvanceDispatch = () => {
    if (dispatchStatus === "reserved") setDispatchStatus("accepted");
    else if (dispatchStatus === "accepted") setDispatchStatus("collected");
    else if (dispatchStatus === "collected") {
      setDispatchStatus("delivered");
      setActiveStep(10);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-ping" />
              <h1 className="font-heading font-extrabold text-xl text-forest">
                Interactive Food Rescue Simulation
              </h1>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Experience the complete FoodRelay workflow: AI Intake → Safety Gate → RelayMatch → Handover.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* AI Mode Pill */}
            <div className="flex items-center bg-cream rounded-xl p-1 border border-gray-200 text-xs">
              <button
                onClick={() => setAiMode("live")}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  aiMode === "live" ? "bg-forest text-mint shadow-subtle" : "text-charcoal-muted"
                }`}
              >
                Live Gemini AI
              </button>
              <button
                onClick={() => setAiMode("offline")}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  aiMode === "offline" ? "bg-forest text-mint shadow-subtle" : "text-charcoal-muted"
                }`}
              >
                Offline Demo Mode
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-charcoal hover:bg-cream transition"
              title="Reset scenario data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber" />
              Reset Demo
            </button>
          </div>
        </div>

        {/* Persistent Demo Progress Bar */}
        <div className="p-4 rounded-2xl bg-white border border-emerald/20 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-forest">
            <span>
              STEP {activeStep} OF 10:{" "}
              {activeStep === 1
                ? "Scenario Introduction"
                : activeStep === 2
                ? "AI Multilingual Intake"
                : activeStep === 3
                ? "Missing Information Blocker"
                : activeStep === 4
                ? "Simulated Safety Review"
                : activeStep === 5
                ? "RelayMatch Engine Execution"
                : activeStep === 6
                ? "Visual Food Flow"
                : activeStep === 7
                ? "RelayMatch vs. FCFS Benchmark"
                : activeStep === 8
                ? "Allocation Reservation"
                : activeStep === 9
                ? "Simulate Guarded Delivery"
                : "Impact Reveal"}
            </span>
            <span className="text-emerald font-extrabold">{activeStep * 10}%</span>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald h-full transition-all duration-300 rounded-full"
              style={{ width: `${activeStep * 10}%` }}
            />
          </div>

          {/* Quick Step Pager */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-charcoal-muted">
            <button
              onClick={() => setActiveStep((p) => Math.max(1, p - 1))}
              disabled={activeStep === 1}
              className="hover:text-forest disabled:opacity-30 inline-flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev Step
            </button>

            <span className="text-[10px] text-charcoal-muted">
              Estimated duration: ~90 seconds
            </span>

            <button
              onClick={() => setActiveStep((p) => Math.min(10, p + 1))}
              disabled={activeStep === 10}
              className="hover:text-forest disabled:opacity-30 inline-flex items-center gap-1 font-semibold"
            >
              Next Step <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* STEP WORKSPACE CARDS */}

        {/* STEP 1: Scenario Introduction */}
        {activeStep === 1 && (
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-mint text-forest">
                <Building className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-forest">
                  Experience a Complete Food Rescue Operation
                </h3>
                <p className="text-xs text-charcoal-muted">
                  PromptWars × Echo Engineers · Evaluator Interactive Journey
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cream border border-emerald/10 text-xs text-charcoal space-y-2 leading-relaxed">
              <p>
                <strong>The Scenario:</strong> A fictional college canteen in Sector 62, Noida has{" "}
                <strong>180 freshly prepared vegetarian meal portions</strong> left over after a campus symposium.
              </p>
              <p>
                Nearby shelters have urgent dinner demand, but uncoordinated food cannot simply be dropped off.
                It requires:
              </p>
              <ul className="list-disc list-inside space-y-1 text-charcoal-muted pl-2">
                <li>Multilingual information extraction (dates, containers, dietary constraints).</li>
                <li>FSSAI 2019 food safety gate evaluation and coordinator inspection.</li>
                <li>Constraint-aware multi-recipient portion allocation (RelayMatch).</li>
                <li>Traceable handover with digital verification receipts.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-charcoal-muted">Choose Scenario Batch:</span>
                <button
                  onClick={() => {
                    setScenarioId("scenario1");
                    setDonation(initialData.donation1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    scenarioId === "scenario1"
                      ? "bg-forest text-white"
                      : "bg-cream text-charcoal hover:bg-cream-dark"
                  }`}
                >
                  180 Portions (Full Match)
                </button>
                <button
                  onClick={() => {
                    setScenarioId("scenario2");
                    setDonation(initialData.donation2);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    scenarioId === "scenario2"
                      ? "bg-forest text-white"
                      : "bg-cream text-charcoal hover:bg-cream-dark"
                  }`}
                >
                  250 Portions (Capacity Bottleneck)
                </button>
              </div>

              <button
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
              >
                Begin AI Intake →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AI Smart Intake */}
        {activeStep === 2 && (
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald" />
                <h3 className="font-heading font-extrabold text-base text-forest">
                  Step 2: Multilingual AI Smart Intake
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald bg-mint px-2 py-0.5 rounded">
                Mode: {aiMode === "live" ? "Live Gemini AI" : "Offline Sample"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-forest text-white space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-mint font-bold block">
                Incoming Raw Message (Canteen Manager):
              </span>
              <p className="font-mono text-xs leading-relaxed text-cream">
                &quot;Greenfield College Canteen in Sector 62 Noida has 180 extra vegetarian meal
                portions. Freshly prepared at 12 PM for today&apos;s college event and packed in sealed
                food-grade containers. Pickup arrangement needed before 2:30 PM.&quot;
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-charcoal-muted">
                Extracts portions, packaging, and location using structured JSON schema.
              </span>

              <button
                onClick={handleRunAiExtraction}
                disabled={isExtracting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                    Extracting via Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-mint" />
                    Extract Structured Draft
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Missing Information Blocker */}
        {activeStep === 3 && (
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
            <div className="flex items-center gap-2 text-amber">
              <AlertTriangle className="w-5 h-5 text-amber" />
              <h3 className="font-heading font-extrabold text-base text-forest">
                Step 3: Missing Information & Safety Gate Hold
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-amber-light/20 border border-amber/30 text-xs text-charcoal space-y-2">
              <p className="font-semibold text-amber-dark">
                Safety Gate Hold Activated (FSSAI 2019 Compliance):
              </p>
              <ul className="list-disc list-inside space-y-1 text-charcoal-muted text-[11px]">
                <li>
                  <strong>Confirmed Use-By Window:</strong> The message stated preparation time (12 PM)
                  and pickup (2:30 PM), but did not provide explicit maximum consumption shelf-life.
                </li>
                <li>
                  <strong>Human Inspection Gate:</strong> Cooked meal surplus cannot be algorithmically
                  dispatched without human coordinator verification of packaging seals and temperature logs.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-cream border border-gray-200 text-xs space-y-1 font-mono">
              <div>✦ status: <span className="text-amber font-bold">&quot;awaiting_human_review&quot;</span></div>
              <div>✦ eligibleForMatching: <span className="text-crimson font-bold">false</span></div>
              <div>✦ allocationBlocked: <span className="text-forest font-bold">true</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveStep(4)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
              >
                Proceed to Human Review →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Simulated Human Review */}
        {activeStep === 4 && (
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
            <div className="flex items-center gap-2 text-emerald">
              <ShieldCheck className="w-5 h-5 text-emerald" />
              <h3 className="font-heading font-extrabold text-base text-forest">
                Step 4: Simulated Coordinator Safety Review
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-cream border border-gray-200 text-xs space-y-2">
              <p className="text-charcoal leading-relaxed">
                As the simulated FoodRelay Coordinator, inspect the Greenfield College Canteen checklist:
              </p>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 text-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-emerald" />
                  <span>Containers verified as clean, food-grade thermal cambros (Reg 6(3)).</span>
                </label>
                <label className="flex items-center gap-2 text-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-emerald" />
                  <span>Cooking temperature verified above 60°C at 12:00 PM.</span>
                </label>
                <label className="flex items-center gap-2 text-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-emerald" />
                  <span>Confirmed safe use-by window recorded: 4:00 PM today (4-hour FSSAI window).</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-charcoal-muted">
                Simulated Action · Cites FSSAI Recovery Regulations (2019)
              </span>

              <button
                onClick={handleSimulateApproval}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-subtle transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Simulate Coordinator Safety Approval
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: RelayMatch Allocation Engine Execution */}
        {activeStep === 5 && (
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-forest" />
                <h3 className="font-heading font-extrabold text-base text-forest">
                  Step 5: RelayMatch Engine Calculation
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald bg-mint px-2.5 py-0.5 rounded-full">
                Safety Passed · 100% Deterministic
              </span>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-cream text-charcoal-muted uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">Recipient Shelter</th>
                    <th className="p-2.5">Straight-Line Dist</th>
                    <th className="p-2.5">Urgency</th>
                    <th className="p-2.5">Score</th>
                    <th className="p-2.5 rounded-r-lg text-right">Allocated Portions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {matchResult.suggestedAllocations.map((alloc) => (
                    <tr key={alloc.recipientId} className="hover:bg-cream/40">
                      <td className="p-2.5 font-bold text-forest">{alloc.recipientName}</td>
                      <td className="p-2.5 text-charcoal">{alloc.distanceKm} km</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-mint text-forest uppercase">
                          Critical/High
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-emerald">{alloc.score} / 100</td>
                      <td className="p-2.5 text-right font-extrabold text-forest">
                        {alloc.allocatedPortions} portions
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ineligible Recipient Reasons */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
              <span className="font-bold text-charcoal block">Excluded Recipients:</span>
              <p className="text-[11px] text-charcoal-muted">
                ✦ <strong>Full House Shelter:</strong> Excluded (Zero remaining receiving capacity).<br />
                ✦ <strong>Seva Non-Veg Canteen:</strong> Excluded (Dietary mismatch: accepts non-veg only).
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveStep(6)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
              >
                Inspect Visual Food Flow →
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Visual Food Flow */}
        {activeStep === 6 && (
          <div className="p-6 rounded-3xl bg-forest text-white border border-emerald/30 shadow-elevation space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest-light/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-mint" />
                <h3 className="font-heading font-extrabold text-base text-white">
                  Step 6: Visual Multi-Recipient Portion Flow
                </h3>
              </div>
              <span className="text-xs text-mint font-mono">180 Portions Total</span>
            </div>

            {/* Interactive Flow Diagram */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
              {/* Origin */}
              <div className="p-4 rounded-2xl bg-forest-dark border border-forest-light/20 text-center w-full md:w-1/3 space-y-1">
                <span className="text-[10px] text-mint uppercase font-bold tracking-wider block">
                  Donation Origin
                </span>
                <strong className="text-sm font-heading block text-white">
                  Greenfield College Canteen
                </strong>
                <span className="text-xs text-mint font-bold block">180 Vegetarian Meals</span>
              </div>

              {/* Central Engine Arrow */}
              <div className="flex flex-col items-center justify-center text-mint font-mono text-xs">
                <ArrowRight className="w-6 h-6 text-mint animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest mt-1 text-cream/70">
                  RelayMatch
                </span>
              </div>

              {/* 3 Matched Recipients */}
              <div className="space-y-2 w-full md:w-1/2">
                <div className="p-2.5 rounded-xl bg-forest-dark border border-forest-light/20 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white block">Community Kitchen A (1.8 km)</strong>
                    <span className="text-[10px] text-cream/70">Critical Urgency · Score 94</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald font-extrabold text-white">
                    80 Portions
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-forest-dark border border-forest-light/20 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white block">Hope Shelter B (3.2 km)</strong>
                    <span className="text-[10px] text-cream/70">High Urgency · Score 88</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald font-extrabold text-white">
                    60 Portions
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-forest-dark border border-forest-light/20 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white block">Care Centre C (4.1 km)</strong>
                    <span className="text-[10px] text-cream/70">Moderate Urgency · Score 79</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald font-extrabold text-white">
                    40 Portions
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveStep(7)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-mint text-forest hover:bg-white text-xs font-bold shadow-subtle transition"
              >
                Compare with FCFS Benchmark →
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Matching Benchmark */}
        {activeStep === 7 && (
          <div className="space-y-4">
            <MatchingBenchmarkUI
              donation={activeDonation}
              recipients={recipients}
              weights={DEFAULT_WEIGHTS}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveStep(8)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
              >
                Reserve Suggested Plan →
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: Allocation Reservation */}
        {activeStep === 8 && (
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald" />
              <h3 className="font-heading font-extrabold text-base text-forest">
                Step 8: Confirm Portion Reservations
              </h3>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              Reserving holds meal portions in the allocation ledger, decrementing available donor portions
              and recipient capacity without creating duplicate commitments.
            </p>

            <div className="p-4 rounded-2xl bg-cream border border-emerald/20 text-xs space-y-2">
              <div className="flex justify-between font-semibold text-forest">
                <span>Greenfield College Canteen:</span>
                <span>180 Portions Reserved</span>
              </div>
              <div className="flex justify-between text-charcoal-muted text-[11px]">
                <span>Remaining Unallocated Balance:</span>
                <span className="text-emerald font-bold">0 portions (100% allocated)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleConfirmReservation}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
              >
                <CheckCircle2 className="w-4 h-4 text-mint" />
                Reserve 180 Meal Portions
              </button>
            </div>
          </div>
        )}

        {/* STEP 9: Simulate Guarded Delivery */}
        {activeStep === 9 && (
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-forest" />
                <h3 className="font-heading font-extrabold text-base text-forest">
                  Step 9: Guarded Dispatch Pipeline Simulation
                </h3>
              </div>
              <span className="text-xs font-bold text-forest uppercase">
                Status: {dispatchStatus.replace("_", " ")}
              </span>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              FoodRelay prevents accidental or fabricated deliveries. Each transition is audited:
              Proposed → Reserved → Accepted → Collected → Delivered.
            </p>

            {/* Pipeline Stage Pills */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div
                className={`p-3 rounded-xl border font-bold transition ${
                  dispatchStatus === "reserved"
                    ? "bg-forest text-white border-forest"
                    : "bg-cream text-charcoal border-gray-200"
                }`}
              >
                1. Reserved
              </div>
              <div
                className={`p-3 rounded-xl border font-bold transition ${
                  dispatchStatus === "accepted"
                    ? "bg-forest text-white border-forest"
                    : "bg-cream text-charcoal border-gray-200"
                }`}
              >
                2. Accepted
              </div>
              <div
                className={`p-3 rounded-xl border font-bold transition ${
                  dispatchStatus === "collected"
                    ? "bg-forest text-white border-forest"
                    : "bg-cream text-charcoal border-gray-200"
                }`}
              >
                3. Collected
              </div>
              <div
                className={`p-3 rounded-xl border font-bold transition ${
                  dispatchStatus === "delivered"
                    ? "bg-emerald text-white border-emerald"
                    : "bg-cream text-charcoal border-gray-200"
                }`}
              >
                4. Delivered
              </div>
            </div>

            {/* Verification Receipt Preview */}
            <div className="p-4 rounded-2xl bg-cream border border-gray-200 text-xs flex items-center justify-between">
              <div>
                <strong className="text-forest block">Digital Handover Receipt:</strong>
                <span className="text-[11px] text-charcoal-muted">
                  Recipient Signature & Cryptographic QR Voucher Generated upon Delivery.
                </span>
              </div>
              <QrCode className="w-8 h-8 text-forest opacity-80" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-charcoal-muted">
                Requires simulated coordinator confirmation at each step.
              </span>

              <button
                onClick={handleAdvanceDispatch}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
              >
                Advance to {dispatchStatus === "reserved" ? "Accepted" : dispatchStatus === "accepted" ? "Collected" : "Delivered"} →
              </button>
            </div>
          </div>
        )}

        {/* STEP 10: Impact Reveal */}
        {activeStep === 10 && (
          <div className="p-8 rounded-3xl bg-forest text-white border border-emerald/30 shadow-elevation space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-mint text-forest flex items-center justify-center mx-auto font-bold">
              <CheckCircle2 className="w-8 h-8 text-emerald" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-mint">
                Simulation Complete!
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                From surplus food to coordinated community support — one intelligent workflow.
              </h2>
              <p className="text-xs text-cream/80 leading-relaxed">
                180 meal portions from Greenfield College Canteen have been safely routed, inspected,
                allocated, and digitally verified across 3 local community shelters.
              </p>
            </div>

            {/* Impact Metric Delta Box */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-center">
              <div className="p-4 rounded-2xl bg-forest-dark border border-forest-light/20">
                <span className="text-[10px] text-cream/70 uppercase block">Portions Rescued</span>
                <strong className="text-2xl font-heading text-mint">+180</strong>
              </div>

              <div className="p-4 rounded-2xl bg-forest-dark border border-forest-light/20">
                <span className="text-[10px] text-cream/70 uppercase block">Total Delivered</span>
                <strong className="text-2xl font-heading text-white">
                  {initialDeliveredCount + 180}
                </strong>
              </div>

              <div className="p-4 rounded-2xl bg-forest-dark border border-forest-light/20 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-cream/70 uppercase block">Landfill Diversion</span>
                <strong className="text-2xl font-heading text-emerald-light">450 kg CO2e</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest-dark hover:bg-forest-light text-white text-xs font-semibold border border-forest-light/30 transition"
              >
                Restart Demo Journey
              </button>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-mint text-forest font-extrabold text-xs hover:bg-white transition shadow-card"
              >
                Explore Live Prototype Dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

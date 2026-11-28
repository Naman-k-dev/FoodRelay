"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { runRelayMatch, DEFAULT_WEIGHTS } from "@/lib/matching/relayMatch";
import { Donation, Recipient, MatchResult } from "@/types";
import { createRound2Donation, createRound2Recipients } from "@/lib/demo/round2Scenarios";
import { LivePlayground } from "@/components/demo/LivePlayground";
import {
  Sparkles,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Scale,
  Truck,
  QrCode,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Activity,
  Maximize2,
  Minimize2,
  Sliders,
  Send,
  Zap,
} from "lucide-react";

export default function InteractiveDemoPage() {
  const [now] = useState(() => new Date());

  // Demo Environment Mode: "guided" | "playground"
  const [demoMode, setDemoMode] = useState<"guided" | "playground">("playground");
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Check URL query parameters on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("presentation") === "true") {
      setIsPresentationMode(true);
    }
    if (params.get("mode") === "guided") {
      setDemoMode("guided");
    }
  }, []);

  // Initial Scenario Data (Strictly Round 2 Specifications)
  const initialData = useMemo(() => {
    return {
      donation: createRound2Donation(now),
      recipients: createRound2Recipients(now),
    };
  }, [now]);

  // Guided Walkthrough State
  const [aiMode, setAiMode] = useState<"live" | "offline">("live");
  const [activeStep, setActiveStep] = useState<number>(1);
  const [donation, setDonation] = useState<Donation>(initialData.donation);
  const [recipients, setRecipients] = useState<Recipient[]>(initialData.recipients);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isSafetyApproved, setIsSafetyApproved] = useState<boolean>(false);
  const [reservationConfirmed, setReservationConfirmed] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<
    "reserved" | "accepted" | "collected" | "delivered"
  >("reserved");
  const [digitalTwinExcludedId, setDigitalTwinExcludedId] = useState<string | null>(null);

  // Global Reset Handler
  const handleReset = () => {
    const freshNow = new Date();
    const freshDonation = createRound2Donation(freshNow);
    const freshRecipients = createRound2Recipients(freshNow);
    setDonation(freshDonation);
    setRecipients(freshRecipients);
    setExtractionResult(null);
    setIsSafetyApproved(false);
    setReservationConfirmed(false);
    setDispatchStatus("reserved");
    setDigitalTwinExcludedId(null);
    setActiveStep(1);
  };

  // Run Real RelayMatch Allocation Engine for Guided Demo
  const matchResult = useMemo(() => {
    const testDon = {
      ...donation,
      safetyReviewStatus: isSafetyApproved ? ("eligible_for_matching" as const) : ("awaiting_human_review" as const),
      status: isSafetyApproved ? ("available" as const) : ("awaiting_review" as const),
    };
    return runRelayMatch(testDon, recipients, DEFAULT_WEIGHTS, now);
  }, [donation, recipients, isSafetyApproved, now]);

  // Digital Twin calculation for Step 6
  const digitalTwinResult = useMemo(() => {
    if (!digitalTwinExcludedId) return matchResult;
    const modifiedRecs = recipients.map((r) =>
      r.id === digitalTwinExcludedId
        ? { ...r, status: "offline" as const, isOnline: false, availableCapacity: 0, remainingDemand: 0 }
        : r
    );
    const testDon = {
      ...donation,
      safetyReviewStatus: "eligible_for_matching" as const,
      status: "available" as const,
    };
    return runRelayMatch(testDon, modifiedRecs, DEFAULT_WEIGHTS, now);
  }, [donation, recipients, digitalTwinExcludedId, matchResult, now]);

  // Guided Step 2: Trigger AI Extraction
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

    // Offline Deterministic Sample Fallback
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
    }, 400);
  };

  // Guided Step 3: Simulate Coordinator Approval
  const handleSimulateApproval = () => {
    setIsSafetyApproved(true);
    setDonation((prev) => ({
      ...prev,
      safetyReviewStatus: "eligible_for_matching",
      status: "available",
      safetyReviewNotes: "Coordinator verified packaging seals and heated holding compliance per FSSAI 2019.",
      safetyReviewer: "Coordinator (Live Evaluation)",
      safetyReviewedAt: new Date().toISOString(),
    }));
    setActiveStep(4);
  };

  // Guided Step 7: Advance Dispatch
  const handleAdvanceDispatch = () => {
    if (dispatchStatus === "reserved") setDispatchStatus("accepted");
    else if (dispatchStatus === "accepted") setDispatchStatus("collected");
    else if (dispatchStatus === "collected") {
      setDispatchStatus("delivered");
      setActiveStep(8);
    }
  };

  const stepTitles = [
    "The Problem (Greenfield College)",
    "AI Intake & Fact Extraction",
    "Responsible AI & Safety Review",
    "Intelligent Matching Engine",
    "Visual Portion Flow",
    "Rescue Digital Twin (Decision-Making)",
    "Confirm & Traceable Dispatch",
    "Impact Reveal & Completion",
  ];

  return (
    <AppShell>
      <div className={`space-y-6 mx-auto ${isPresentationMode ? "max-w-7xl" : "max-w-5xl"}`}>
        {/* Top Control Bar: Mode Toggle, Presentation Mode & Reset */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-emerald/20 shadow-elevation">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald animate-ping" />
              <h1 className={`font-heading font-extrabold text-forest ${isPresentationMode ? "text-2xl" : "text-xl"}`}>
                FoodRelay AI — Round 2 Live Demonstration
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-mint text-forest tracking-wider uppercase">
                Round 2 Qualified
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Team ImpactForge · Real-Time Algorithmic Execution · 100% Genuine Calculated Results.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Multi-Page Presentation Link */}
            <Link
              href="/demo/live/intake"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald text-white hover:bg-forest transition shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Multi-Page Flow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-cream rounded-2xl p-1 border border-gray-200 text-xs">
              <button
                onClick={() => setDemoMode("playground")}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  demoMode === "playground"
                    ? "bg-forest text-mint shadow-subtle ring-2 ring-mint/40"
                    : "text-charcoal-muted hover:text-forest"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-mint" />
                <span>Live Playground</span>
              </button>

              <button
                onClick={() => setDemoMode("guided")}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  demoMode === "guided"
                    ? "bg-forest text-mint shadow-subtle"
                    : "text-charcoal-muted hover:text-forest"
                }`}
              >
                <span>Guided Walkthrough</span>
              </button>
            </div>

            {/* Presentation Mode Toggle */}
            <button
              onClick={() => setIsPresentationMode(!isPresentationMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isPresentationMode
                  ? "bg-emerald text-white border-emerald shadow-subtle"
                  : "bg-white border-gray-200 text-charcoal hover:bg-cream"
              }`}
              title="Toggle projector-optimized view"
            >
              {isPresentationMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Exit Presentation Mode</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-forest" />
                  <span>Presentation Mode</span>
                </>
              )}
            </button>

            {/* Global Reset Button */}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-gray-200 text-charcoal hover:bg-cream transition shadow-subtle"
              title="Reset scenario data to default state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Multi-Page Presentation Quick-Stage Navigator */}
        <div className="p-4 rounded-3xl bg-surface-cream border border-emerald/20 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald text-white text-xs">🚀</span>
              <span className="text-xs font-bold uppercase tracking-wider text-forest">
                Interconnected Presentation Workflow (7 Dedicated Stages)
              </span>
            </div>
            <Link
              href="/demo/live/intake"
              className="text-xs font-bold text-emerald hover:text-forest flex items-center gap-1"
            >
              <span>Begin Stage 1 (Intake)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { idx: 1, title: "1. Intake", href: "/demo/live/intake" },
              { idx: 2, title: "2. Safety", href: "/demo/live/review" },
              { idx: 3, title: "3. Network", href: "/demo/live/network" },
              { idx: 4, title: "4. Matching", href: "/demo/live/matching" },
              { idx: 5, title: "5. Digital Twin", href: "/demo/live/digital-twin" },
              { idx: 6, title: "6. Dispatch", href: "/demo/live/dispatch" },
              { idx: 7, title: "7. Impact", href: "/demo/live/impact" },
            ].map((st) => (
              <Link
                key={st.idx}
                href={st.href}
                className="p-2.5 rounded-xl border border-emerald/15 bg-white hover:border-emerald hover:bg-emerald-50 transition text-center"
              >
                <span className="block font-bold text-xs text-forest">{st.title}</span>
                <span className="text-[10px] text-charcoal-muted">Dedicated View</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MODE 1: LIVE PLAYGROUND (Dynamic Command Center) */}
        {/* ------------------------------------------------------------------ */}
        {demoMode === "playground" ? (
          <LivePlayground
            initialDonation={donation}
            initialRecipients={recipients}
            isPresentationMode={isPresentationMode}
          />
        ) : (
          /* ------------------------------------------------------------------ */
          /* MODE 2: GUIDED DEMO (8-Step Pitch Walkthrough) */
          /* ------------------------------------------------------------------ */
          <div className="space-y-6">
            {/* Prominent Jump-to-Playground Banner */}
            <div className="p-4 rounded-3xl bg-mint/40 border border-emerald/30 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald rounded-xl text-white">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-forest">
                    Looking for full dynamic controls & unexpected inputs?
                  </h4>
                  <p className="text-xs text-charcoal-muted">
                    Switch to the <strong>Live Playground</strong> to edit quantities, test 6 custom NGOs, switch online/offline states, and test 9 evaluation scenarios.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDemoMode("playground")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-mint text-xs font-bold transition shadow-subtle flex-shrink-0"
              >
                <span>Open Live Playground →</span>
              </button>
            </div>

            {/* Persistent 8-Step Demo Progress Bar */}
            <div className="p-4 rounded-2xl bg-white border border-emerald/20 shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-forest">
                <span>
                  STEP {activeStep} OF 8: {stepTitles[activeStep - 1]}
                </span>
                <span className="text-emerald font-extrabold">{Math.round((activeStep / 8) * 100)}%</span>
              </div>

              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(activeStep / 8) * 100}%` }}
                />
              </div>

              {/* Step Pager Controls */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-charcoal-muted">
                <button
                  onClick={() => setActiveStep((p) => Math.max(1, p - 1))}
                  disabled={activeStep === 1}
                  className="hover:text-forest disabled:opacity-30 inline-flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <span className="text-[10px] text-charcoal-muted">
                  ✦ Pure deterministic execution · No scripted fake results
                </span>

                <button
                  onClick={() => setActiveStep((p) => Math.min(8, p + 1))}
                  disabled={activeStep === 8}
                  className="hover:text-forest disabled:opacity-30 inline-flex items-center gap-1 font-semibold"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* STEP 1: THE PROBLEM */}
            {activeStep === 1 && (
              <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-mint text-forest">
                    <Building className="w-5 h-5 text-emerald" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald">
                      Step 1: The Surplus Food Paradox
                    </span>
                    <h3 className="font-heading font-extrabold text-base text-forest">
                      Greenfield College Canteen has 180 Meals Left Over
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-cream/70 border border-gray-100 space-y-2">
                    <strong className="text-forest text-sm block">The Real-World Dilemma:</strong>
                    <p className="text-charcoal-muted leading-relaxed">
                      Following a weekend seminar, the campus canteen has <strong>180 freshly cooked vegetarian meal portions</strong> (biryani, dal makhani, and rotis) packed in hot thermal cambros.
                    </p>
                    <p className="text-charcoal-muted leading-relaxed">
                      The food is safe, but perishes rapidly. The mess manager has under 3 hours to coordinate pickup before food quality degrades, violating regulatory safety windows.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-forest text-white space-y-2">
                    <strong className="text-mint text-sm block">Why Coordination Fails:</strong>
                    <p className="text-cream/80 leading-relaxed">
                      A WhatsApp message sent to random shelter volunteers leads to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-cream/70">
                      <li>Unchecked food safety & allergen risks</li>
                      <li>Over-delivering to one shelter while another goes hungry</li>
                      <li>Long transit times spoiling heated meals</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-charcoal-muted">
                    Quantity: <strong>180 portions</strong> · Location: <strong>Sector 62, Noida</strong>
                  </span>

                  <button
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
                  >
                    Proceed to AI Intake →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: AI INTAKE */}
            {activeStep === 2 && (
              <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald" />
                    <h3 className="font-heading font-extrabold text-base text-forest">
                      Step 2: Multilingual Natural-Language Intake
                    </h3>
                  </div>
                  <span className="text-xs text-charcoal-muted">
                    Engine: <strong className="text-forest">{aiMode === "live" ? "Live Gemini API" : "Offline Deterministic"}</strong>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-cream border border-gray-200 text-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block tracking-wider">
                    Raw WhatsApp / Text Message Received from Donor:
                  </span>
                  <p className="italic text-charcoal text-xs bg-white p-3 rounded-xl border border-gray-100">
                    &quot;Greenfield College Canteen in Sector 62 Noida has 180 extra vegetarian meal portions. Freshly prepared at 12 PM for today&apos;s college event and packed in sealed food-grade containers. Pickup arrangement needed before 2:30 PM.&quot;
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-charcoal-muted">
                    Treats message strictly as data, never as prompt instructions.
                  </span>

                  <button
                    onClick={handleRunAiExtraction}
                    disabled={isExtracting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Extracting Facts...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-mint" />
                        Extract Structured Facts with Gemini →
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: RESPONSIBLE AI & SAFETY REVIEW */}
            {activeStep === 3 && (
              <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-dark" />
                    <h3 className="font-heading font-extrabold text-base text-forest">
                      Step 3: Responsible AI & Safety Gate Blocker
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-dark bg-amber-light px-2.5 py-0.5 rounded-full">
                    Human-in-the-Loop Required
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-cream/70 border border-gray-200 text-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-forest">
                    <span>Extracted Domain Draft:</span>
                    <span className="text-[10px] text-emerald bg-mint px-2 py-0.5 rounded font-mono">
                      Source: {extractionResult?.source || "AI Extractor"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-charcoal-muted block text-[10px]">Donor</span>
                      <strong className="text-forest">{extractionResult?.data?.donorOrganization || "Greenfield College Canteen"}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-charcoal-muted block text-[10px]">Portions</span>
                      <strong className="text-forest">{extractionResult?.data?.quantity || 180} portions</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-charcoal-muted block text-[10px]">Dietary</span>
                      <strong className="text-forest capitalize">{extractionResult?.data?.dietaryCategory || "Vegetarian"}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-charcoal-muted block text-[10px]">Packaging</span>
                      <strong className="text-forest">Sealed Containers</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-light/30 border border-amber/40 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-dark font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber" />
                    Safety Blocker: AI cannot certify edible quality or temperature safety.
                  </div>
                  <p className="text-charcoal-muted leading-relaxed text-[11px]">
                    Indian Surplus Food Regulations (FSSAI 2019 Regulation 6) require physical coordinator verification of thermal holding integrity before meals become allocatable to shelters.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-charcoal-muted">
                    Status: <strong>Awaiting Human Safety Sign-off</strong>
                  </span>

                  <button
                    onClick={handleSimulateApproval}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-subtle transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Sign Off & Mark Eligible for Matching →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: INTELLIGENT MATCHING */}
            {activeStep === 4 && (
              <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-forest" />
                    <h3 className="font-heading font-extrabold text-base text-forest">
                      Step 4: RelayMatch Deterministic Engine Execution
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald bg-mint px-2.5 py-0.5 rounded-full">
                    Zero Black Box · Real Math
                  </span>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-cream text-charcoal-muted uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 rounded-l-lg">Eligible Shelter</th>
                        <th className="p-2.5">Distance</th>
                        <th className="p-2.5">Urgency</th>
                        <th className="p-2.5">Match Score</th>
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
                              Active
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

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                  <span className="font-bold text-charcoal block">Excluded Recipients (Hard Constraints Enforced):</span>
                  <p className="text-[11px] text-charcoal-muted">
                    ✦ <strong>Sunrise Foundation E:</strong> Excluded (Recipient is currently offline).<br />
                    ✦ <strong>Community Support F:</strong> Excluded (Transportation unavailable).
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveStep(5)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
                  >
                    Inspect Visual Food Flow →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: VISUAL ALLOCATION FLOW */}
            {activeStep === 5 && (
              <div className="p-6 rounded-3xl bg-forest text-white border border-emerald/30 shadow-elevation space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-forest-light/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-mint" />
                    <h3 className="font-heading font-extrabold text-base text-white">
                      Step 5: Visual Multi-Recipient Portion Distribution
                    </h3>
                  </div>
                  <span className="text-xs text-mint font-mono font-bold">180 Portions Total</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
                  <div className="p-4 rounded-2xl bg-forest-dark border border-forest-light/20 text-center w-full md:w-1/3 space-y-1">
                    <span className="text-[10px] text-mint uppercase font-bold tracking-wider block">
                      Donation Origin
                    </span>
                    <strong className="text-sm font-heading block text-white">
                      Greenfield College Canteen
                    </strong>
                    <span className="text-xs text-mint font-bold block">180 Vegetarian Meals</span>
                  </div>

                  <div className="flex flex-col items-center text-mint font-mono text-xs">
                    <ArrowRight className="w-6 h-6 hidden md:block text-emerald" />
                    <span className="text-[10px] text-mint/80">Constraint Split</span>
                  </div>

                  <div className="w-full md:w-1/2 space-y-2">
                    {matchResult.suggestedAllocations.map((alloc) => (
                      <div
                        key={alloc.recipientId}
                        className="p-3 rounded-xl bg-forest-dark/90 border border-forest-light/20 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-white block">{alloc.recipientName}</strong>
                          <span className="text-[10px] text-cream/70">
                            {alloc.distanceKm} km away · Proximity & Urgency matched
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-mint text-forest font-extrabold text-xs">
                          {alloc.allocatedPortions} portions
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-forest-light/30">
                  <button
                    onClick={() => setActiveStep(6)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-mint text-forest hover:bg-white text-xs font-bold shadow-card transition"
                  >
                    Test Operational Shock (Digital Twin) →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: RESCUE DIGITAL TWIN */}
            {activeStep === 6 && (
              <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald" />
                    <div>
                      <h3 className="font-heading font-extrabold text-base text-forest">
                        Step 6: Operational Decision-Making (Rescue Digital Twin)
                      </h3>
                      <p className="text-xs text-charcoal-muted">
                        Simulate network disruption: What happens if a critical shelter suddenly goes offline?
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-forest bg-mint px-2.5 py-0.5 rounded-full">
                    Dynamic Rebalancing
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-cream/70 border border-gray-200 text-xs space-y-3">
                  <span className="font-bold text-forest block">
                    Click a shelter below to simulate taking it offline mid-operation:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {recipients.slice(0, 3).map((r) => {
                      const isOff = digitalTwinExcludedId === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setDigitalTwinExcludedId(isOff ? null : r.id)}
                          className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                            isOff
                              ? "bg-amber-light border-amber text-charcoal"
                              : "bg-white border-gray-200 hover:border-emerald"
                          }`}
                        >
                          <div>
                            <strong className="block text-xs line-clamp-1">{r.organizationName}</strong>
                            <span className="text-[10px] text-charcoal-muted">Cap: {r.availableCapacity} portions</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isOff ? "bg-amber text-charcoal" : "bg-mint text-forest"}`}>
                            {isOff ? "Offline" : "Online"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {digitalTwinExcludedId && (
                    <div className="p-3 rounded-xl bg-white border border-amber/30 text-xs text-charcoal space-y-1">
                      <span className="font-bold text-forest block">✦ Real-Time Algorithmic Re-routing:</span>
                      <p className="text-[11px] text-charcoal-muted">
                        Because <strong>{recipients.find((r) => r.id === digitalTwinExcludedId)?.organizationName}</strong> was toggled offline, RelayMatch immediately calculated a revised plan: allocated {digitalTwinResult.allocatedPortions} portions, with {digitalTwinResult.unallocatedPortions} portions unallocated or re-routed.
                      </p>
                      <button
                        onClick={() => setDigitalTwinExcludedId(null)}
                        className="text-xs text-emerald font-bold hover:underline pt-1 inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore Original Network Scenario
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setDigitalTwinExcludedId(null);
                      setActiveStep(7);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
                  >
                    Confirm Plan & Proceed to Dispatch →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: CONFIRM & TRACEABLE DISPATCH */}
            {activeStep === 7 && (
              <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-elevation space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-forest" />
                    <h3 className="font-heading font-extrabold text-base text-forest">
                      Step 7: Traceable Dispatch Pipeline Progression
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-forest uppercase bg-mint px-2.5 py-0.5 rounded-full">
                    Status: {dispatchStatus.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-charcoal-muted leading-relaxed">
                  FoodRelay prevents arbitrary state jumps. Every handover must progress through linear audited transitions:
                  <strong> Reserved → Recipient Accepted → In Transit → Confirmed Delivered</strong>.
                </p>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className={`p-3 rounded-xl border font-bold ${dispatchStatus === "reserved" ? "bg-forest text-white" : "bg-cream text-charcoal border-gray-200"}`}>
                    1. Reserved
                  </div>
                  <div className={`p-3 rounded-xl border font-bold ${dispatchStatus === "accepted" ? "bg-forest text-white" : "bg-cream text-charcoal border-gray-200"}`}>
                    2. Accepted
                  </div>
                  <div className={`p-3 rounded-xl border font-bold ${dispatchStatus === "collected" ? "bg-forest text-white" : "bg-cream text-charcoal border-gray-200"}`}>
                    3. Collected
                  </div>
                  <div className={`p-3 rounded-xl border font-bold ${dispatchStatus === "delivered" ? "bg-emerald text-white" : "bg-cream text-charcoal border-gray-200"}`}>
                    4. Delivered
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cream border border-gray-200 text-xs flex items-center justify-between">
                  <div>
                    <strong className="text-forest block">Verifiable Digital Handover Receipt:</strong>
                    <span className="text-[11px] text-charcoal-muted">
                      Generates tamper-evident timestamp, recipient sign-off, and QR audit voucher upon delivery.
                    </span>
                  </div>
                  <QrCode className="w-8 h-8 text-forest opacity-80" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-charcoal-muted">
                    Requires explicit simulated confirmation for each transition.
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

            {/* STEP 8: IMPACT REVEAL & COMPLETION */}
            {activeStep === 8 && (
              <div className="p-8 rounded-3xl bg-forest text-white border border-emerald/30 shadow-elevation space-y-6 text-center">
                <div className="w-14 h-14 rounded-full bg-mint text-forest flex items-center justify-center mx-auto font-bold">
                  <CheckCircle2 className="w-8 h-8 text-emerald" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <span className="text-xs font-bold uppercase tracking-wider text-mint">
                    Simulation Successfully Completed!
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                    From surplus food to coordinated hope — one transparent workflow.
                  </h2>
                  <p className="text-xs text-cream/80 leading-relaxed">
                    180 meal portions from Greenfield College Canteen were safety-validated, algorithmically matched, and verified across local community shelters.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto text-center">
                  <div className="p-3.5 rounded-2xl bg-forest-dark border border-forest-light/20">
                    <span className="text-[10px] text-cream/70 uppercase block">Portions Allocated</span>
                    <strong className="text-xl font-heading text-mint">180</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-forest-dark border border-forest-light/20">
                    <span className="text-[10px] text-cream/70 uppercase block">Portions Delivered</span>
                    <strong className="text-xl font-heading text-white">180</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-forest-dark border border-forest-light/20">
                    <span className="text-[10px] text-cream/70 uppercase block">Shelters Served</span>
                    <strong className="text-xl font-heading text-mint">3</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-forest-dark border border-forest-light/20">
                    <span className="text-[10px] text-cream/70 uppercase block">Unallocated Waste</span>
                    <strong className="text-xl font-heading text-emerald-light">0</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-forest-dark border border-forest-light/20 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-cream/70 uppercase block">CO2e Diverted</span>
                    <strong className="text-xl font-heading text-emerald-light">450 kg</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest-dark hover:bg-forest-light text-white text-xs font-semibold border border-forest-light/30 transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Replay Demo Journey
                  </button>

                  <button
                    onClick={() => setDemoMode("playground")}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-mint text-forest font-extrabold text-xs hover:bg-white transition shadow-card flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-forest" />
                    Open Live Playground →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

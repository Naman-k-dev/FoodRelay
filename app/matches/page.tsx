"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import { runRelayMatch, DEFAULT_WEIGHTS } from "@/lib/matching/relayMatch";
import { MatchingBenchmarkUI } from "@/components/matching/MatchingBenchmarkUI";
import { Donation, MatchingWeights, MatchResult, Allocation } from "@/types";
import { formatDateTime } from "@/lib/utils/format";
import {
  GitCompare,
  Sliders,
  Scale,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Info,
  Clock,
  RotateCcw,
  Building,
  Sparkles,
  Layers,
} from "lucide-react";

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDonationId = searchParams.get("donationId");

  const {
    isHydrated,
    donations,
    recipients,
    weights: storedWeights,
    saveWeights,
    saveDonation,
    saveRecipient,
    saveAllocation,
  } = useFoodRelay();

  // Active Donation Selection
  const [selectedDonationId, setSelectedDonationId] = useState<string>("");
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_WEIGHTS);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [matchViewMode, setMatchViewMode] = useState<"ranking" | "benchmark">("ranking");

  useEffect(() => {
    if (storedWeights) {
      setWeights(storedWeights);
    }
  }, [storedWeights]);

  // Set default selected donation when loaded
  useEffect(() => {
    if (donations.length > 0) {
      if (initialDonationId && donations.some((d) => d.id === initialDonationId)) {
        setSelectedDonationId(initialDonationId);
      } else {
        // Pick first eligible or available donation
        const eligible = donations.find(
          (d) => d.safetyReviewStatus === "eligible_for_matching" && d.remainingQuantity > 0
        );
        setSelectedDonationId(eligible ? eligible.id : donations[0].id);
      }
    }
  }, [donations, initialDonationId]);

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
        </div>
      </AppShell>
    );
  }

  const selectedDonation = donations.find((d) => d.id === selectedDonationId);

  // Run Matching Algorithm
  const handleExecuteMatching = () => {
    if (!selectedDonation) return;
    setReservationSuccess(false);
    const result = runRelayMatch(selectedDonation, recipients, weights, new Date());
    setMatchResult(result);
  };

  // Auto-run when donation changes if eligible
  const handleSelectDonation = (id: string) => {
    setSelectedDonationId(id);
    const don = donations.find((d) => d.id === id);
    if (don) {
      const res = runRelayMatch(don, recipients, weights, new Date());
      setMatchResult(res);
      setReservationSuccess(false);
    }
  };

  // Confirm Plan: Reserve allocations, adjust balances
  const handleConfirmReservationPlan = () => {
    if (!selectedDonation || !matchResult || matchResult.suggestedAllocations.length === 0) return;

    const nowIso = new Date().toISOString();
    let totalAllocatedInPlan = 0;

    for (const item of matchResult.suggestedAllocations) {
      const recipient = recipients.find((r) => r.id === item.recipientId);
      if (!recipient) continue;

      const allocId = `alloc-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`;
      const candidate = matchResult.eligibleMatches.find((m) => m.recipient.id === item.recipientId);

      const allocation: Allocation = {
        id: allocId,
        donationId: selectedDonation.id,
        recipientId: recipient.id,
        allocatedPortions: item.allocatedPortions,
        distanceKm: item.distanceKm,
        score: item.score,
        scoreBreakdown: candidate?.scoreBreakdown || {
          urgencyScore: 70,
          proximityScore: 80,
          demandFitScore: 80,
          readinessScore: 75,
          rawWeights: weights,
        },
        status: "reserved",
        reasons: [
          `Matched with composite score ${item.score}/100`,
          `Estimated straight-line distance: ${item.distanceKm} km`,
          `Allocated ${item.allocatedPortions} meal portions`,
        ],
        unresolvedConstraints: [],
        createdAt: nowIso,
        updatedAt: nowIso,
        timeline: [
          {
            status: "proposed",
            timestamp: nowIso,
            note: "RelayMatch heuristic allocation suggested",
            actor: "RelayMatch Engine",
          },
          {
            status: "reserved",
            timestamp: nowIso,
            note: "Coordinator confirmed suggested allocation plan",
            actor: "Coordinator (Simulated)",
          },
        ],
      };

      // Save allocation
      saveAllocation(allocation);

      // Decrement recipient balances
      const updatedRecipient = {
        ...recipient,
        remainingDemand: Math.max(0, recipient.remainingDemand - item.allocatedPortions),
        availableCapacity: Math.max(0, recipient.availableCapacity - item.allocatedPortions),
      };
      saveRecipient(updatedRecipient);

      totalAllocatedInPlan += item.allocatedPortions;
    }

    // Decrement donation remaining balance
    const updatedDonation = {
      ...selectedDonation,
      remainingQuantity: Math.max(0, selectedDonation.remainingQuantity - totalAllocatedInPlan),
      status: (selectedDonation.remainingQuantity - totalAllocatedInPlan === 0
        ? "fully_allocated"
        : "reserved") as any,
      updatedAt: nowIso,
      history: [
        ...selectedDonation.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          action: "Allocations Reserved",
          actor: "Relay Coordinator",
          notes: `Reserved ${totalAllocatedInPlan} portions across ${matchResult.suggestedAllocations.length} recipient(s).`,
        },
      ],
    };
    saveDonation(updatedDonation);

    setReservationSuccess(true);
    // Re-run matching to refresh remaining view
    const refreshedResult = runRelayMatch(updatedDonation, recipients, weights, new Date());
    setMatchResult(refreshedResult);
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    saveWeights(DEFAULT_WEIGHTS);
    if (selectedDonation) {
      setMatchResult(runRelayMatch(selectedDonation, recipients, DEFAULT_WEIGHTS, new Date()));
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
              RelayMatch Center
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Explainable, constraint-aware surplus food allocation engine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWeightSliders(!showWeightSliders)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-charcoal hover:bg-cream transition"
            >
              <Sliders className="w-3.5 h-3.5 text-forest" />
              Tune Weights ({weights.urgency}/{weights.proximity}/{weights.demand}/{weights.readiness})
            </button>
            <button
              onClick={handleExecuteMatching}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-forest hover:bg-forest-light text-white shadow-subtle transition"
            >
              <GitCompare className="w-4 h-4 text-mint" />
              Run Algorithm
            </button>
          </div>
        </div>

        {/* Weights Configuration Box */}
        {showWeightSliders && (
          <div className="p-5 rounded-2xl bg-white border border-emerald/20 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald" />
                <h3 className="font-heading font-bold text-sm text-forest">
                  Configurable Multi-Factor Ranking Weights
                </h3>
              </div>
              <button
                onClick={handleResetWeights}
                className="text-xs text-charcoal-muted hover:text-charcoal flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-amber" />
                Reset Defaults (40/30/20/10)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-charcoal">Recipient Urgency</span>
                  <span className="text-emerald font-bold">{weights.urgency}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.urgency}
                  onChange={(e) => {
                    const w = { ...weights, urgency: Number(e.target.value) };
                    setWeights(w);
                    saveWeights(w);
                  }}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-charcoal">Proximity (Distance)</span>
                  <span className="text-emerald font-bold">{weights.proximity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.proximity}
                  onChange={(e) => {
                    const w = { ...weights, proximity: Number(e.target.value) };
                    setWeights(w);
                    saveWeights(w);
                  }}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-charcoal">Demand Absorption</span>
                  <span className="text-emerald font-bold">{weights.demand}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.demand}
                  onChange={(e) => {
                    const w = { ...weights, demand: Number(e.target.value) };
                    setWeights(w);
                    saveWeights(w);
                  }}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-charcoal">Pickup Readiness</span>
                  <span className="text-emerald font-bold">{weights.readiness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.readiness}
                  onChange={(e) => {
                    const w = { ...weights, readiness: Number(e.target.value) };
                    setWeights(w);
                    saveWeights(w);
                  }}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Donation Selector Box */}
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-subtle space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-forest block">
            Select Donation to Match & Allocate:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {donations.map((d) => {
              const isSelected = d.id === selectedDonationId;
              const isEligible = d.safetyReviewStatus === "eligible_for_matching";

              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelectDonation(d.id)}
                  className={`p-3.5 rounded-xl text-left border transition flex flex-col justify-between ${
                    isSelected
                      ? "border-forest bg-forest text-white shadow-subtle ring-2 ring-mint/40"
                      : "border-gray-100 bg-cream/40 hover:bg-cream text-charcoal"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold truncate">{d.donorName}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isSelected
                            ? "bg-mint text-forest"
                            : isEligible
                            ? "bg-mint/80 text-forest"
                            : "bg-amber text-charcoal"
                        }`}
                      >
                        {d.safetyReviewStatus.replace("_", " ")}
                      </span>
                    </div>
                    <p
                      className={`text-xs line-clamp-1 ${
                        isSelected ? "text-cream/90" : "text-charcoal-muted"
                      }`}
                    >
                      {d.foodDescription}
                    </p>
                  </div>

                  <div
                    className={`mt-3 pt-2 border-t text-[11px] flex justify-between font-medium ${
                      isSelected ? "border-forest-light/30 text-mint" : "border-gray-200 text-charcoal"
                    }`}
                  >
                    <span>Remaining: {d.remainingQuantity} portions</span>
                    <span className="capitalize">{d.dietaryCategory}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Donation Inspection Details */}
        {selectedDonation && (
          <div className="p-4 rounded-xl bg-white border border-gray-100 text-xs flex flex-wrap items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
              <div>
                <span className="font-semibold text-forest">{selectedDonation.donorName}</span> ·{" "}
                <span className="text-charcoal-muted">{selectedDonation.pickupLocation}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-charcoal-muted">
              <span>
                Available: <strong>{selectedDonation.remainingQuantity} portions</strong>
              </span>
              <span>
                Storage: <strong className="capitalize">{selectedDonation.storageMethod}</strong>
              </span>
              <span>
                Pickup Ends: <strong>{formatDateTime(selectedDonation.pickupWindowEnd)}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Reservation Success Banner */}
        {reservationSuccess && (
          <div className="p-4 rounded-2xl bg-mint border border-emerald text-forest flex items-center justify-between shadow-subtle">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald" />
              <span>
                Suggested allocation plan successfully reserved! Quantities held and balances
                updated.
              </span>
            </div>
            <button
              onClick={() => router.push("/dispatch")}
              className="px-4 py-1.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-light transition flex items-center gap-1"
            >
              Go to Dispatch Board →
            </button>
          </div>
        )}

        {/* View Mode Toggle: Plan & Ranking vs Benchmark */}
        {matchResult && selectedDonation && (
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <button
              onClick={() => setMatchViewMode("ranking")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
                matchViewMode === "ranking"
                  ? "bg-forest text-white shadow-subtle"
                  : "bg-white text-charcoal hover:bg-cream border border-gray-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-mint" />
              Allocation Plan & Score Explainability
            </button>
            <button
              onClick={() => setMatchViewMode("benchmark")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
                matchViewMode === "benchmark"
                  ? "bg-forest text-white shadow-subtle"
                  : "bg-white text-charcoal hover:bg-cream border border-gray-200"
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-emerald" />
              RelayMatch vs. FCFS Benchmark
            </button>
          </div>
        )}

        {/* Benchmark Mode */}
        {matchViewMode === "benchmark" && selectedDonation && (
          <MatchingBenchmarkUI
            donation={selectedDonation}
            recipients={recipients}
            weights={weights}
          />
        )}

        {/* Matching Results Section (Ranking & Plan Mode) */}
        {matchResult && matchViewMode === "ranking" && (
          <div className="space-y-6">
            {/* Animated Allocation Flow Diagram */}
            {matchResult.suggestedAllocations.length > 0 && selectedDonation && (
              <div className="p-5 rounded-2xl bg-forest text-white border border-forest-light/30 shadow-subtle space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-forest-light/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-mint flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-mint" />
                    Live Multi-Recipient Relay Flow
                  </span>
                  <span className="text-[10px] text-cream/70 uppercase">Autonomous Routing</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                  {/* Origin */}
                  <div className="p-3.5 rounded-xl bg-forest-dark/80 border border-forest-light/20 text-center w-full md:w-1/3">
                    <span className="text-[10px] uppercase tracking-wider text-mint font-bold block">Donation Source</span>
                    <strong className="text-sm font-heading block mt-0.5 text-white">{selectedDonation.donorName}</strong>
                    <span className="text-xs text-mint mt-1 block">{matchResult.totalDonationPortions} portions</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex flex-col items-center justify-center text-mint font-mono text-xs">
                    <ArrowRight className="w-5 h-5 text-mint animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest mt-0.5 text-cream/70">RelayMatch</span>
                  </div>

                  {/* Destinations */}
                  <div className="space-y-2 w-full md:w-1/2">
                    {matchResult.suggestedAllocations.map((alloc) => (
                      <div key={alloc.recipientId} className="p-2.5 rounded-xl bg-forest-dark/80 border border-forest-light/20 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white block">{alloc.recipientName}</strong>
                          <span className="text-[10px] text-cream/70">{alloc.distanceKm} km · Score: {alloc.score}/100</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald font-bold text-white text-xs">
                          {alloc.allocatedPortions} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Plan Summary Card */}
            <div className="p-6 rounded-2xl bg-white border border-emerald/20 shadow-elevation space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald">
                    RelayMatch Suggested Plan
                  </span>
                  <h3 className="font-heading font-extrabold text-lg text-forest mt-0.5">
                    Portion Distribution Plan
                  </h3>
                </div>

                {matchResult.suggestedAllocations.length > 0 && (
                  <button
                    onClick={handleConfirmReservationPlan}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
                  >
                    <CheckCircle2 className="w-4 h-4 text-mint" />
                    Reserve Suggested Plan ({matchResult.allocatedPortions} Portions)
                  </button>
                )}
              </div>

              {/* Portion Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 text-xs bg-cream/70 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-charcoal-muted block text-[11px]">Donation Batch</span>
                  <strong className="text-base text-forest font-heading">
                    {matchResult.totalDonationPortions} portions
                  </strong>
                </div>
                <div>
                  <span className="text-charcoal-muted block text-[11px]">Suggested Allocation</span>
                  <strong className="text-base text-emerald font-heading">
                    {matchResult.allocatedPortions} portions
                  </strong>
                </div>
                <div>
                  <span className="text-charcoal-muted block text-[11px]">Unallocated Remainder</span>
                  <strong className="text-base text-amber font-heading">
                    {matchResult.unallocatedPortions} portions
                  </strong>
                </div>
              </div>

              {/* Table of Suggested Allocations */}
              {matchResult.suggestedAllocations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-cream text-charcoal-muted uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 rounded-l-lg">Recipient Shelter / Kitchen</th>
                        <th className="p-3">Straight-Line Distance</th>
                        <th className="p-3">Match Score</th>
                        <th className="p-3 rounded-r-lg text-right">Allocated Portions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {matchResult.suggestedAllocations.map((alloc) => (
                        <tr key={alloc.recipientId} className="hover:bg-cream/30">
                          <td className="p-3 font-semibold text-forest">{alloc.recipientName}</td>
                          <td className="p-3 text-charcoal">{alloc.distanceKm} km (estimated)</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-mint text-forest">
                              {alloc.score} / 100
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-forest">
                            {alloc.allocatedPortions} portions
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-light/20 border border-amber/30 text-xs text-amber-dark flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    No eligible recipients available for this donation batch (check safety status,
                    dietary compatibility, or capacity).
                  </span>
                </div>
              )}
            </div>

            {/* Explainable Ranking Cards */}
            <div>
              <h3 className="font-heading font-bold text-base text-forest mb-3">
                Eligible Recipient Rankings & Score Explainability ({matchResult.eligibleMatches.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchResult.eligibleMatches.map((match, idx) => (
                  <div
                    key={match.recipient.id}
                    className="p-5 rounded-2xl bg-white border border-gray-100 shadow-subtle flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-forest text-mint text-xs font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-heading font-bold text-sm text-forest">
                            {match.recipient.organizationName}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-mint text-forest">
                          Score: {match.score}
                        </span>
                      </div>

                      <p className="text-xs text-charcoal-muted mb-3 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald" />
                        {match.recipient.location} · {match.distanceKm} km straight-line
                      </p>

                      {/* 4 Score Components */}
                      <div className="space-y-2 text-xs bg-cream/50 p-3 rounded-xl border border-gray-100 mb-3">
                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-charcoal-muted">Urgency ({weights.urgency}% wt):</span>
                            <strong>{match.scoreBreakdown.urgencyScore} / 100</strong>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald h-full rounded-full"
                              style={{ width: `${match.scoreBreakdown.urgencyScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-charcoal-muted">Proximity ({weights.proximity}% wt):</span>
                            <strong>{match.scoreBreakdown.proximityScore} / 100</strong>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald h-full rounded-full"
                              style={{ width: `${match.scoreBreakdown.proximityScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-charcoal-muted">Demand Fit ({weights.demand}% wt):</span>
                            <strong>{match.scoreBreakdown.demandFitScore} / 100</strong>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald h-full rounded-full"
                              style={{ width: `${match.scoreBreakdown.demandFitScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-charcoal-muted">Readiness ({weights.readiness}% wt):</span>
                            <strong>{match.scoreBreakdown.readinessScore} / 100</strong>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald h-full rounded-full"
                              style={{ width: `${match.scoreBreakdown.readinessScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-charcoal font-medium flex justify-between border-t border-gray-100">
                      <span>Demand: {match.recipient.remainingDemand} portions</span>
                      <span className="text-emerald font-bold">
                        Suggested: {match.suggestedPortions} portions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ineligible Recipients Section with Explicit Reasons */}
            {matchResult.ineligibleMatches.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-subtle space-y-3">
                <h4 className="font-heading font-bold text-sm text-charcoal flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-charcoal-muted" />
                  Ineligible Recipients & Hard Constraint Blockers ({matchResult.ineligibleMatches.length})
                </h4>

                <div className="space-y-2">
                  {matchResult.ineligibleMatches.map((inelig) => (
                    <div
                      key={inelig.recipient.id}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-semibold text-charcoal">
                          {inelig.recipient.organizationName}
                        </span>
                        <p className="text-[11px] text-crimson mt-0.5">
                          ✦ {inelig.ineligibleReasons.join("; ")}
                        </p>
                      </div>
                      <span className="text-[11px] text-charcoal-muted self-end sm:self-auto">
                        Distance: {inelig.distanceKm} km
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function MatchesPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
          </div>
        </AppShell>
      }
    >
      <MatchesContent />
    </Suspense>
  );
}

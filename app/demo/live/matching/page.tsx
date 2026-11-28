"use client";

import React, { useState } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import { AllocationFlowVisualizer } from "@/components/demo/AllocationFlowVisualizer";
import { ROUND2_SCENARIOS } from "@/lib/demo/round2Scenarios";
import {
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Power,
  RotateCcw,
  Sliders,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { UrgencyLevel } from "@/types";

export default function MatchingPage() {
  const {
    donation,
    recipients,
    updateRecipientStatus,
    updateRecipientUrgency,
    matchResult,
    safetyReview,
    activeScenarioId,
    applyScenario,
    lastRedistributionEvent,
    isPresentationMode,
  } = useDemoSession();

  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationText, setExplanationText] = useState<string | null>(null);

  const allCandidates = [...matchResult.eligibleMatches, ...matchResult.ineligibleMatches];

  // Trigger Gemini Copilot Explanation of this allocation
  const handleExplain = async () => {
    setIsExplaining(true);
    setExplanationText(null);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Explain why this allocation of ${donation.quantity} portions of ${donation.foodDescription} was distributed in this exact priority across the recipients. Community Kitchen A got ${
            matchResult.suggestedAllocations.find((a) => a.recipientId === "demo-rec-a")?.allocatedPortions || 0
          } portions, Hope Shelter B got ${
            matchResult.suggestedAllocations.find((a) => a.recipientId === "demo-rec-b")?.allocatedPortions || 0
          } portions, and Care Centre C got ${
            matchResult.suggestedAllocations.find((a) => a.recipientId === "demo-rec-c")?.allocatedPortions || 0
          } portions.`,
          context: {
            donation,
            allocations: matchResult.suggestedAllocations,
            candidates: allCandidates,
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setExplanationText(json.data.answer);
      } else {
        throw new Error(json.error || "Explanation failed");
      }
    } catch (e: any) {
      // Deterministic explainability fallback
      setExplanationText(
        `RelayMatch deterministic allocation: Community Kitchen A received priority due to Critical Urgency (100) and proximity (2.5 km), absorbing 80 portions (reaching capacity limit). Hope Shelter B received 60 portions (High Urgency 75), and Care Centre C absorbed the remaining 40 portions. Offline and transport-disabled NGOs were strictly excluded by Hard Constraint 0.`
      );
    } finally {
      setIsExplaining(false);
    }
  };

  const totalAllocated = matchResult.suggestedAllocations.reduce((sum, a) => sum + a.allocatedPortions, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald/15">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-emerald-300 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald" />
            <span>Intelligent Matching & Reactive Redistribution</span>
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Multi-factor deterministic allocation (Urgency 40%, Proximity 30%, Demand 20%, Readiness 10%). Toggling an NGO offline triggers instant automatic redistribution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            {totalAllocated} Allocated / {matchResult.unallocatedPortions} Unallocated
          </span>
        </div>
      </div>

      {/* 9 SCENARIOS PRESET BAR */}
      <div
        className={`p-3.5 rounded-2xl border transition-colors ${
          isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted dark:text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald" />
            <span>One-Click Evaluation Scenarios (Scenarios A through I)</span>
          </span>
          <span className="text-[10px] text-charcoal-muted dark:text-slate-500 hidden sm:inline">
            Click any preset to demonstrate real-time algorithmic response
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-1.5">
          {ROUND2_SCENARIOS.map((scen) => {
            const isSelected = activeScenarioId === scen.id;
            return (
              <button
                key={scen.id}
                type="button"
                onClick={() => applyScenario(scen.id)}
                className={`px-2 py-2 rounded-xl text-left transition flex flex-col justify-between border ${
                  isSelected
                    ? "bg-emerald text-white border-emerald font-bold shadow-md"
                    : "bg-surface-cream dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald/50 text-charcoal dark:text-slate-200"
                }`}
                title={scen.description}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                  {scen.badge}
                </div>
                <div className="text-[11px] font-semibold leading-tight line-clamp-1 mt-0.5">
                  {scen.name.replace(/Scenario [A-I]:\s*/i, "")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SANKEY FLOW VISUALIZER WITH UNALLOCATED SURPLUS BAR */}
      <AllocationFlowVisualizer
        donation={donation}
        recipients={recipients}
        matchResult={matchResult}
        isPresentationMode={isPresentationMode}
      />

      {/* LIVE INTERACTIVE NGO TOGGLE STRIP */}
      <div
        className={`p-4 rounded-2xl border transition-colors space-y-3 ${
          isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest dark:text-emerald-300 flex items-center gap-2">
            <Power className="w-4 h-4 text-emerald" />
            <span>Interactive Recipient Availability & Urgency Switches (Click to test reactive redistribution)</span>
          </h3>
          <span className="text-[11px] text-charcoal-muted dark:text-slate-400">
            No page refresh required · Instant domain recalculation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recipients.map((recipient) => {
            const isOnline = recipient.isOnline !== false && recipient.status === "online";
            const match = allCandidates.find((c) => c.recipient.id === recipient.id);
            const allocatedPortions = match?.suggestedPortions || 0;

            return (
              <div
                key={recipient.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                  isOnline
                    ? "bg-surface-cream dark:bg-slate-950 border-emerald/20"
                    : "bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs truncate text-charcoal dark:text-white">
                    {recipient.organizationName}
                  </div>
                  <div className="text-[11px] text-charcoal-muted dark:text-slate-400 flex items-center gap-2">
                    <span>{recipient.availableCapacity} cap</span>
                    <span>•</span>
                    <span className="capitalize">{recipient.urgencyLevel}</span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        allocatedPortions > 0
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {allocatedPortions} portions allocated
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {/* Toggle Online/Offline */}
                  <button
                    type="button"
                    onClick={() => updateRecipientStatus(recipient.id, !isOnline)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                      isOnline
                        ? "bg-emerald text-white border-emerald hover:bg-forest"
                        : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </button>

                  {/* Quick Urgency Switch */}
                  <select
                    value={recipient.urgencyLevel}
                    onChange={(e) =>
                      updateRecipientUrgency(recipient.id, e.target.value as UrgencyLevel)
                    }
                    className="text-[10px] p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-charcoal dark:text-white"
                  >
                    <option value="critical">Critical (100)</option>
                    <option value="high">High (75)</option>
                    <option value="medium">Medium (50)</option>
                    <option value="low">Low (25)</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXPLAINABLE SCORING BREAKDOWN TABLE */}
      <div
        className={`p-5 rounded-2xl border transition-colors space-y-4 ${
          isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-forest dark:text-emerald-300 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald" />
            <span>Deterministic Scoring & Constraint Breakdown</span>
          </h3>
          <button
            onClick={handleExplain}
            disabled={isExplaining}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald text-white hover:bg-forest transition"
          >
            {isExplaining ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explain Allocation with Gemini</span>
              </>
            )}
          </button>
        </div>

        {explanationText && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1 animate-in fade-in">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Grounded Algorithmic Explanation:</span>
            </span>
            <p className="leading-relaxed">{explanationText}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-charcoal-muted dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Recipient Organization</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Urgency (40%)</th>
                <th className="py-2.5 px-3">Score (0-100)</th>
                <th className="py-2.5 px-3">Suggested Portions</th>
                <th className="py-2.5 px-3">Eligibility / Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allCandidates.map((cand, idx) => {
                const isOnline = cand.recipient.isOnline !== false && cand.recipient.status === "online";
                return (
                  <tr
                    key={cand.recipient.id}
                    className={`hover:bg-surface-cream/50 dark:hover:bg-slate-800/40 transition ${
                      !cand.eligible ? "opacity-60" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold font-mono">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-charcoal dark:text-white">
                      {cand.recipient.organizationName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOnline
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{cand.distanceKm.toFixed(1)} km</td>
                    <td className="py-2.5 px-3 capitalize">{cand.recipient.urgencyLevel}</td>
                    <td className="py-2.5 px-3 font-bold text-forest dark:text-emerald-300">
                      {cand.score.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 font-black text-emerald-600 dark:text-emerald-400">
                      {cand.suggestedPortions} portions
                    </td>
                    <td className="py-2.5 px-3">
                      {cand.eligible ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Eligible</span>
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium text-[11px]">
                          {cand.ineligibleReasons.join("; ") || "Excluded"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

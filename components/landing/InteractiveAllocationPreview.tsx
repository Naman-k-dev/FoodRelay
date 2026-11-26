"use client";

import React, { useState, useMemo } from "react";
import { runRelayMatch, DEFAULT_WEIGHTS } from "@/lib/matching/relayMatch";
import { generateFictionalSeedData } from "@/lib/demo/seedData";
import { Donation, DietaryCategory } from "@/types";
import { Sliders, Sparkles, Scale, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function InteractiveAllocationPreview() {
  const [portionCount, setPortionCount] = useState<number>(180);
  const [selectedDiet, setSelectedDiet] = useState<DietaryCategory>("vegetarian");

  const seed = useMemo(() => generateFictionalSeedData(), []);

  // Construct dynamic donation based on slider
  const dynamicDonation: Donation = useMemo(() => {
    return {
      id: "demo-live-preview",
      donorName: "Grand Palace Catering (Demonstration)",
      donorType: "wedding_venue",
      foodDescription: `Fresh surplus ${selectedDiet.replace("_", " ")} meal portions`,
      foodCategory: "cooked_meals",
      dietaryCategory: selectedDiet,
      quantity: portionCount,
      unit: "portions",
      remainingQuantity: portionCount,
      pickupLocation: "Sector 62, Noida (Demo Node)",
      latitude: 28.628,
      longitude: 77.367,
      preparedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      pickupWindowStart: new Date().toISOString(),
      pickupWindowEnd: new Date(Date.now() + 7200 * 1000).toISOString(),
      confirmedUseBy: new Date(Date.now() + 14400 * 1000).toISOString(),
      storageMethod: "heated",
      packagingCondition: "sealed_containers",
      allergenInformation: ["dairy"],
      handlingInformation: "Maintained in food-grade insulated cambro dispensers.",
      sourceVerificationStatus: "verified_license",
      safetyReviewStatus: "eligible_for_matching",
      safetyReviewNotes: "Coordinator verification approved.",
      safetyReviewer: "System",
      safetyReviewedAt: new Date().toISOString(),
      status: "available",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
      history: [],
    };
  }, [portionCount, selectedDiet]);

  // Run matching deterministically
  const matchResult = useMemo(() => {
    return runRelayMatch(dynamicDonation, seed.recipients, DEFAULT_WEIGHTS, new Date());
  }, [dynamicDonation, seed.recipients]);

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-forest text-white shadow-elevation border border-emerald/30 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-forest-light/30">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-mint flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-mint" />
            Live Algorithm Sandbox (Deterministic Heuristic)
          </span>
          <h3 className="font-heading font-extrabold text-xl text-white mt-1">
            Test the RelayMatch Allocation Engine Live
          </h3>
          <p className="text-xs text-cream/80 mt-0.5">
            Adjust available portions to observe real-time constraint-aware distribution across nearby shelters.
          </p>
        </div>
        <span className="text-[10px] bg-emerald text-white font-bold px-2.5 py-1 rounded-full uppercase self-start sm:self-auto">
          Demonstration Mode
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-forest-dark/70 p-5 rounded-2xl border border-forest-light/20">
        {/* Slider */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-mint">Available Surplus Portions:</span>
            <span className="font-heading font-extrabold text-lg text-white">
              {portionCount} portions
            </span>
          </div>
          <input
            type="range"
            min="40"
            max="300"
            step="10"
            value={portionCount}
            onChange={(e) => setPortionCount(Number(e.target.value))}
            className="w-full accent-mint cursor-pointer h-2 bg-forest rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-cream/60">
            <span>40 portions (Small Event)</span>
            <span>180 portions (Banquet)</span>
            <span>300 portions (Conference)</span>
          </div>
        </div>

        {/* Dietary Switch */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-mint block">
            Dietary Category:
          </label>
          <div className="flex gap-2">
            {[
              { id: "vegetarian", label: "Veg" },
              { id: "non_vegetarian", label: "Non-Veg" },
              { id: "jain", label: "Jain" },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDiet(d.id as DietaryCategory)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                  selectedDiet === d.id
                    ? "bg-mint text-forest font-bold shadow-subtle"
                    : "bg-forest text-cream/70 hover:text-white border border-forest-light/30"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-cream/60 block pt-1">
            Enforces strict shelter dietary acceptance rules.
          </span>
        </div>
      </div>

      {/* Allocation Flow Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-mint uppercase tracking-wider text-[11px]">
            RelayMatch Suggested Allocations ({matchResult.suggestedAllocations.length} Shelters)
          </span>
          <span className="text-cream/80 text-[11px]">
            Allocated: <strong className="text-white">{matchResult.allocatedPortions}</strong> / {portionCount} portions
            {matchResult.unallocatedPortions > 0 && (
              <span className="text-amber ml-2">({matchResult.unallocatedPortions} unallocated)</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {matchResult.suggestedAllocations.map((alloc) => (
            <div
              key={alloc.recipientId}
              className="p-4 rounded-2xl bg-forest-dark/90 border border-emerald/30 flex flex-col justify-between space-y-2 hover:border-mint/50 transition"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-heading font-bold text-sm text-white line-clamp-1">
                    {alloc.recipientName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-mint text-forest">
                    Score: {alloc.score}
                  </span>
                </div>
                <span className="text-[11px] text-mint block mt-1">
                  ~{alloc.distanceKm} km straight-line
                </span>
              </div>

              <div className="pt-2 border-t border-forest-light/30 flex justify-between items-center text-xs">
                <span className="text-cream/70 text-[11px]">Assigned portions:</span>
                <span className="font-heading font-black text-base text-mint">
                  {alloc.allocatedPortions}
                </span>
              </div>
            </div>
          ))}

          {matchResult.suggestedAllocations.length === 0 && (
            <div className="sm:col-span-3 p-6 text-center text-xs text-amber bg-forest-dark/50 rounded-2xl border border-amber/30">
              No matching organizations available for {selectedDiet} in this batch.
            </div>
          )}
        </div>
      </div>

      {/* Footnote */}
      <div className="pt-2 border-t border-forest-light/30 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-cream/70 gap-2">
        <span>
          ✦ Calculations run 100% locally in your browser using pure TypeScript algorithms.
        </span>
        <span className="text-mint font-semibold">
          Zero simulated delays · Full mathematical explainability
        </span>
      </div>
    </div>
  );
}

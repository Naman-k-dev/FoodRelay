"use client";

import React from "react";
import { Donation, MatchResult, Recipient } from "@/types";
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Sparkles, Scale } from "lucide-react";

interface AllocationFlowVisualizerProps {
  donation: Donation;
  recipients: Recipient[];
  matchResult: MatchResult;
  isPresentationMode?: boolean;
}

export function AllocationFlowVisualizer({
  donation,
  recipients,
  matchResult,
  isPresentationMode = false,
}: AllocationFlowVisualizerProps) {
  const totalPortions = donation.remainingQuantity || donation.quantity;
  const allocatedPortions = matchResult.allocatedPortions;
  const unallocatedPortions = matchResult.unallocatedPortions;
  const allocatedPercent = totalPortions > 0 ? Math.round((allocatedPortions / totalPortions) * 100) : 0;
  const unallocatedPercent = 100 - allocatedPercent;

  // Build a map of allocated portions by recipient ID
  const allocationMap = new Map<string, number>();
  for (const match of matchResult.eligibleMatches) {
    if (match.suggestedPortions > 0) {
      allocationMap.set(match.recipient.id, match.suggestedPortions);
    }
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald/20 shadow-elevation space-y-6">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
            <h3 className={`font-heading font-extrabold text-forest ${isPresentationMode ? "text-xl" : "text-base"}`}>
              Live Allocation Flow & Constraint Mapping
            </h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Real-time algorithmic portion distribution from donor surplus to recipient organizations.
          </p>
        </div>

        {/* Global Allocation Stats Pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-mint/50 border border-emerald/30 font-bold text-forest">
            Allocated: <span className="text-emerald font-extrabold">{allocatedPortions}</span> / {totalPortions} ({allocatedPercent}%)
          </div>
          {unallocatedPortions > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-light/30 border border-amber/40 font-bold text-amber-dark">
              Unallocated: <span className="font-extrabold">{unallocatedPortions}</span> ({unallocatedPercent}%)
            </div>
          )}
        </div>
      </div>

      {/* 3-Column Visual Flow Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left: Donated Food Source (3 Cols) */}
        <div className="lg:col-span-3 p-4 rounded-2xl bg-cream/70 border border-emerald/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald uppercase tracking-wider">Donor Surplus</span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald text-white">
              {donation.dietaryCategory.toUpperCase()}
            </span>
          </div>

          <div>
            <h4 className={`font-heading font-extrabold text-forest line-clamp-2 ${isPresentationMode ? "text-base" : "text-sm"}`}>
              {donation.foodDescription || "Surplus Meal Batch"}
            </h4>
            <p className="text-[11px] text-charcoal-muted mt-0.5">{donation.donorName}</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-gray-200/80 flex items-center justify-between">
            <span className="text-xs text-charcoal-muted">Total Available:</span>
            <span className={`font-extrabold text-forest font-heading ${isPresentationMode ? "text-2xl text-emerald" : "text-lg"}`}>
              {totalPortions} <span className="text-xs font-normal text-charcoal-muted">portions</span>
            </span>
          </div>

          <div className="text-[10px] text-charcoal-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald" />
            <span>FSSAI 2019 Sealed & Safe</span>
          </div>
        </div>

        {/* Center: RelayMatch Engine (3 Cols) */}
        <div className="lg:col-span-3 p-4 rounded-2xl bg-forest text-white space-y-3 shadow-subtle text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-center gap-1.5 text-mint text-xs font-bold">
            <Scale className="w-4 h-4" />
            <span>RelayMatch Core</span>
          </div>

          <div className="py-2">
            <span className={`font-heading font-extrabold block text-mint ${isPresentationMode ? "text-3xl" : "text-2xl"}`}>
              {matchResult.eligibleMatches.length} / {recipients.length}
            </span>
            <span className="text-[11px] text-cream/80">Eligible Recipients</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-cream/90 text-left">
            <div className="bg-forest-dark/60 p-1.5 rounded-lg border border-emerald/20">
              <span className="text-mint font-bold block">Urgency</span> 40% Weight
            </div>
            <div className="bg-forest-dark/60 p-1.5 rounded-lg border border-emerald/20">
              <span className="text-mint font-bold block">Proximity</span> 30% Weight
            </div>
            <div className="bg-forest-dark/60 p-1.5 rounded-lg border border-emerald/20">
              <span className="text-mint font-bold block">Demand</span> 20% Weight
            </div>
            <div className="bg-forest-dark/60 p-1.5 rounded-lg border border-emerald/20">
              <span className="text-mint font-bold block">Readiness</span> 10% Weight
            </div>
          </div>
        </div>

        {/* Right: Recipients Flow Target (6 Cols) */}
        <div className="lg:col-span-6 space-y-2">
          {recipients.map((recipient) => {
            const isOffline =
              recipient.status === "offline" ||
              recipient.status === "unavailable" ||
              recipient.status === "inactive" ||
              recipient.isOnline === false;

            const isTransportUnavailable =
              recipient.transportAvailable === false ||
              recipient.transportAvailability === "unavailable" ||
              recipient.transportAvailability === "none";

            const allocated = allocationMap.get(recipient.id) || 0;
            const portionPercent = totalPortions > 0 ? Math.round((allocated / totalPortions) * 100) : 0;

            const ineligibleEntry = matchResult.ineligibleMatches.find((m) => m.recipient.id === recipient.id);
            const eligibleEntry = matchResult.eligibleMatches.find((m) => m.recipient.id === recipient.id);

            return (
              <div
                key={recipient.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isOffline
                    ? "bg-red-50/50 border-red-200/80 opacity-70"
                    : isTransportUnavailable
                    ? "bg-amber-50/50 border-amber-200/80 opacity-80"
                    : allocated > 0
                    ? "bg-emerald-50/40 border-emerald/40 shadow-subtle"
                    : "bg-gray-50/80 border-gray-200 text-charcoal-muted"
                }`}
              >
                {/* NGO Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOffline ? "bg-red-500" : isTransportUnavailable ? "bg-amber-500" : "bg-emerald"
                      }`}
                    />
                    <h5 className={`font-bold truncate text-forest ${isPresentationMode ? "text-sm" : "text-xs"}`}>
                      {recipient.organizationName}
                    </h5>

                    {/* Status Badge */}
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                        isOffline
                          ? "bg-red-100 text-red-700"
                          : isTransportUnavailable
                          ? "bg-amber-100 text-amber-800"
                          : "bg-mint text-forest"
                      }`}
                    >
                      {isOffline ? "Offline" : isTransportUnavailable ? "No Transport" : "Online"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-charcoal-muted">
                    <span>
                      Urgency:{" "}
                      <strong className="text-forest capitalize">{recipient.urgencyLevel}</strong>
                    </span>
                    <span>·</span>
                    <span>Cap: {recipient.availableCapacity}</span>
                    <span>·</span>
                    <span>Dist: {recipient.manualDistanceKm ?? 3.0} km</span>
                  </div>

                  {/* Exclusion reason if any */}
                  {ineligibleEntry && ineligibleEntry.ineligibleReasons.length > 0 && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5 truncate">
                      {ineligibleEntry.ineligibleReasons[0]}
                    </p>
                  )}
                </div>

                {/* Allocated Flow Meter */}
                <div className="flex items-center gap-3 text-right flex-shrink-0">
                  {allocated > 0 ? (
                    <div>
                      <span className={`font-extrabold font-heading text-emerald ${isPresentationMode ? "text-lg" : "text-sm"}`}>
                        +{allocated} portions
                      </span>
                      <div className="w-24 bg-emerald-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-emerald h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (allocated / recipient.availableCapacity) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">
                      0 portions
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Segmented Proportion Bar */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
          <span>Overall Rescue Absorption Ratio:</span>
          <span className="text-emerald font-extrabold">{allocatedPercent}% Allocated</span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex shadow-inner">
          <div
            className="bg-emerald h-full transition-all duration-300"
            style={{ width: `${allocatedPercent}%` }}
            title={`Allocated: ${allocatedPortions} portions`}
          />
          {unallocatedPortions > 0 && (
            <div
              className="bg-amber h-full transition-all duration-300"
              style={{ width: `${unallocatedPercent}%` }}
              title={`Unallocated Surplus: ${unallocatedPortions} portions`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { runMatchingBenchmark, BenchmarkComparison } from "@/lib/matching/benchmark";
import { Donation, Recipient, MatchingWeights } from "@/types";
import { GitCompare, Scale, CheckCircle2, TrendingUp, ShieldCheck, Info } from "lucide-react";

interface MatchingBenchmarkUIProps {
  donation: Donation;
  recipients: Recipient[];
  weights: MatchingWeights;
}

export function MatchingBenchmarkUI({
  donation,
  recipients,
  weights,
}: MatchingBenchmarkUIProps) {
  const benchmark: BenchmarkComparison = useMemo(() => {
    return runMatchingBenchmark(donation, recipients, weights, new Date());
  }, [donation, recipients, weights]);

  const { relayMatch, fcfsBaseline, keyDifferences, verdictNarrative } = benchmark;

  return (
    <div className="p-6 rounded-3xl bg-white border border-emerald/20 shadow-elevation space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest text-mint flex items-center justify-center font-bold">
            <Scale className="w-5 h-5 text-mint" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-base text-forest">
                RelayMatch vs. First-Come, First-Served (FCFS) Benchmark
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald bg-mint px-2 py-0.5 rounded">
                Transparent Comparison
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Evaluating identical safety constraints under two distinct allocation philosophies.
            </p>
          </div>
        </div>

        <span className="text-xs text-charcoal-muted font-medium self-start sm:self-auto">
          Batch: <strong>{donation.remainingQuantity} portions</strong> ({donation.donorName})
        </span>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strategy 1: RelayMatch */}
        <div className="p-5 rounded-2xl bg-forest text-white shadow-subtle flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-mint">
                  Intelligent Strategy
                </span>
                <h4 className="font-heading font-bold text-base text-white mt-0.5">
                  {relayMatch.strategyName}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-mint text-forest uppercase">
                Active Engine
              </span>
            </div>
            <p className="text-xs text-cream/80 mt-1 leading-relaxed">
              {relayMatch.strategyDescription}
            </p>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-forest-dark/80 p-3 rounded-xl border border-forest-light/20">
              <div>
                <span className="text-cream/60 block text-[10px]">Allocated Portions</span>
                <strong className="text-lg font-heading text-mint">
                  {relayMatch.totalAllocated}
                </strong>
              </div>
              <div>
                <span className="text-cream/60 block text-[10px]">Avg Straight-Line Dist</span>
                <strong className="text-lg font-heading text-white">
                  {relayMatch.averageDistanceKm} km
                </strong>
              </div>
              <div>
                <span className="text-cream/60 block text-[10px]">Critical Urgency Served</span>
                <strong className="text-base text-emerald font-heading">
                  {relayMatch.urgencyBreakdown.criticalPortions} pts
                </strong>
              </div>
              <div>
                <span className="text-cream/60 block text-[10px]">High Urgency Served</span>
                <strong className="text-base text-emerald font-heading">
                  {relayMatch.urgencyBreakdown.highPortions} pts
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-forest-light/30 text-[11px] text-cream/70 flex justify-between">
            <span>Shelters reached: <strong>{relayMatch.recipientsServedCount}</strong></span>
            <span>Unallocated: <strong>{relayMatch.unallocated}</strong></span>
          </div>
        </div>

        {/* Strategy 2: FCFS Baseline */}
        <div className="p-5 rounded-2xl bg-cream/70 border border-gray-200 shadow-subtle flex flex-col justify-between space-y-4 text-charcoal">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
                  Baseline Strategy
                </span>
                <h4 className="font-heading font-bold text-base text-forest mt-0.5">
                  {fcfsBaseline.strategyName}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-charcoal uppercase">
                Naive Model
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
              {fcfsBaseline.strategyDescription}
            </p>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-charcoal-muted block text-[10px]">Allocated Portions</span>
                <strong className="text-lg font-heading text-forest">
                  {fcfsBaseline.totalAllocated}
                </strong>
              </div>
              <div>
                <span className="text-charcoal-muted block text-[10px]">Avg Straight-Line Dist</span>
                <strong className="text-lg font-heading text-forest">
                  {fcfsBaseline.averageDistanceKm} km
                </strong>
              </div>
              <div>
                <span className="text-charcoal-muted block text-[10px]">Critical Urgency Served</span>
                <strong className="text-base text-charcoal font-heading">
                  {fcfsBaseline.urgencyBreakdown.criticalPortions} pts
                </strong>
              </div>
              <div>
                <span className="text-charcoal-muted block text-[10px]">High Urgency Served</span>
                <strong className="text-base text-charcoal font-heading">
                  {fcfsBaseline.urgencyBreakdown.highPortions} pts
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 text-[11px] text-charcoal-muted flex justify-between">
            <span>Shelters reached: <strong>{fcfsBaseline.recipientsServedCount}</strong></span>
            <span>Unallocated: <strong>{fcfsBaseline.unallocated}</strong></span>
          </div>
        </div>
      </div>

      {/* Key Differences & Verdict */}
      <div className="p-4 rounded-2xl bg-mint/40 border border-emerald/20 text-xs space-y-2">
        <span className="font-heading font-bold text-forest text-xs flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald" />
          Benchmark Analysis & Trade-Offs:
        </span>
        <ul className="list-disc list-inside space-y-1 text-charcoal">
          {keyDifferences.map((diff, i) => (
            <li key={i}>{diff}</li>
          ))}
        </ul>
        <p className="text-[11px] text-charcoal-muted pt-1 border-t border-emerald/20 leading-relaxed">
          <strong>Coordinator Takeaway:</strong> {verdictNarrative}
        </p>
      </div>
    </div>
  );
}

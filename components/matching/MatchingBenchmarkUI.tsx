"use client";

import React, { useState, useMemo } from "react";
import { runMatchingBenchmark, BenchmarkComparison } from "@/lib/matching/benchmark";
import {
  getBenchmarkScenarios,
  generateBenchmarkAuditReport,
  BenchmarkScenarioSummary,
} from "@/lib/matching/benchmarkScenarios";
import { Donation, Recipient, MatchingWeights } from "@/types";
import {
  GitCompare,
  Scale,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Info,
  Download,
  FileSpreadsheet,
  FileCode,
  AlertTriangle,
  Layers,
  ChevronRight,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"current_batch" | "standard_scenarios">("current_batch");
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);

  // 1. Current Batch Benchmark
  const currentBenchmark: BenchmarkComparison = useMemo(() => {
    return runMatchingBenchmark(donation, recipients, weights, new Date());
  }, [donation, recipients, weights]);

  // 2. 4 Reproducible Standard Scenarios
  const scenarios: BenchmarkScenarioSummary[] = useMemo(() => {
    return getBenchmarkScenarios(new Date());
  }, []);

  const activeScenario = scenarios[selectedScenarioIndex] || scenarios[0];

  // Download handlers
  const handleDownloadReport = (format: "json" | "csv") => {
    const report = generateBenchmarkAuditReport(scenarios);
    const blob = new Blob([format === "json" ? report.json : report.csv], {
      type: format === "json" ? "application/json" : "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `foodrelay-benchmark-report.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const { relayMatch, fcfsBaseline, keyDifferences, verdictNarrative } = currentBenchmark;

  return (
    <div className="p-6 rounded-3xl bg-white border border-emerald/20 shadow-elevation space-y-6">
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
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
                Transparent Evaluation
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Identical hard safety and dietary constraints evaluated under two distinct allocation philosophies.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-cream p-1 border border-gray-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("current_batch")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "current_batch"
                  ? "bg-forest text-white shadow-subtle"
                  : "text-charcoal-muted hover:text-charcoal"
              }`}
            >
              Current Batch
            </button>
            <button
              onClick={() => setActiveTab("standard_scenarios")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "standard_scenarios"
                  ? "bg-forest text-white shadow-subtle"
                  : "text-charcoal-muted hover:text-charcoal"
              }`}
            >
              4 Standard Scenarios
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleDownloadReport("csv")}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-cream text-charcoal text-xs font-semibold flex items-center gap-1 shadow-subtle transition"
              title="Download CSV Audit Report"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald" />
              CSV
            </button>
            <button
              onClick={() => handleDownloadReport("json")}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-cream text-charcoal text-xs font-semibold flex items-center gap-1 shadow-subtle transition"
              title="Download JSON Audit Report"
            >
              <FileCode className="w-3.5 h-3.5 text-forest" />
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* VIEW A: Current Batch Mode */}
      {activeTab === "current_batch" && (
        <div className="space-y-6">
          <div className="text-xs text-charcoal-muted flex items-center justify-between">
            <span>
              Evaluating Active Batch: <strong>{donation.donorName}</strong> ({donation.remainingQuantity} portions available)
            </span>
            <span>
              Configured Weights: Urgency {weights.urgency}% · Proximity {weights.proximity}% · Demand {weights.demand}%
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
                    <span className="text-cream/60 block text-[10px]">Portion-Weighted Distance</span>
                    <strong className="text-lg font-heading text-white">
                      {relayMatch.averageDistanceKm} km
                    </strong>
                  </div>
                  <div>
                    <span className="text-cream/60 block text-[10px]">Critical Urgency Served</span>
                    <strong className="text-base text-emerald-light font-heading">
                      {relayMatch.urgencyBreakdown.criticalPortions} portions
                    </strong>
                  </div>
                  <div>
                    <span className="text-cream/60 block text-[10px]">High Urgency Served</span>
                    <strong className="text-base text-emerald-light font-heading">
                      {relayMatch.urgencyBreakdown.highPortions} portions
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
                    <span className="text-charcoal-muted block text-[10px]">Portion-Weighted Distance</span>
                    <strong className="text-lg font-heading text-forest">
                      {fcfsBaseline.averageDistanceKm} km
                    </strong>
                  </div>
                  <div>
                    <span className="text-charcoal-muted block text-[10px]">Critical Urgency Served</span>
                    <strong className="text-base text-charcoal font-heading">
                      {fcfsBaseline.urgencyBreakdown.criticalPortions} portions
                    </strong>
                  </div>
                  <div>
                    <span className="text-charcoal-muted block text-[10px]">High Urgency Served</span>
                    <strong className="text-base text-charcoal font-heading">
                      {fcfsBaseline.urgencyBreakdown.highPortions} portions
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
      )}

      {/* VIEW B: 4 Standard Reproducible Scenarios */}
      {activeTab === "standard_scenarios" && (
        <div className="space-y-6">
          {/* Scenario Selector Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {scenarios.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenarioIndex(idx)}
                className={`p-3 rounded-2xl text-left border transition text-xs flex flex-col justify-between gap-1.5 ${
                  selectedScenarioIndex === idx
                    ? "bg-forest text-white border-forest shadow-card"
                    : "bg-cream/40 border-gray-200 text-charcoal hover:bg-cream"
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Scenario {idx + 1}</span>
                  {selectedScenarioIndex === idx && <ChevronRight className="w-3.5 h-3.5 text-mint" />}
                </div>
                <div className={`line-clamp-1 ${selectedScenarioIndex === idx ? "text-mint font-medium" : "text-charcoal-muted"}`}>
                  {s.name.split(":")[1]?.trim() || s.name}
                </div>
              </button>
            ))}
          </div>

          {/* Active Scenario Card */}
          <div className="p-5 rounded-2xl bg-cream/30 border border-emerald/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-heading font-bold text-forest text-sm">{activeScenario.name}</h4>
                <p className="text-xs text-charcoal-muted mt-0.5">{activeScenario.description}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-forest text-mint text-xs font-mono font-semibold self-start sm:self-auto">
                Donation: {activeScenario.donation.remainingQuantity} portions
              </div>
            </div>

            {/* Expected Verification Property */}
            <div className="p-3 rounded-xl bg-white border border-emerald/30 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-forest">Expected Mathematical Property:</strong>{" "}
                <span className="text-charcoal">{activeScenario.expectedProperty}</span>
              </div>
            </div>

            {/* Side-by-Side Scenario Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-forest text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">Metric</th>
                    <th className="p-2.5">RelayMatch Engine</th>
                    <th className="p-2.5">FCFS Baseline</th>
                    <th className="p-2.5 rounded-r-lg">Delta / Trade-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr>
                    <td className="p-2.5 font-medium text-forest">Allocated Portions</td>
                    <td className="p-2.5 font-bold text-emerald">
                      {activeScenario.relayMatchResult.totalAllocated} portions
                    </td>
                    <td className="p-2.5 font-semibold text-charcoal">
                      {activeScenario.fcfsResult.totalAllocated} portions
                    </td>
                    <td className="p-2.5">
                      {activeScenario.metricsComparison.allocatedDelta === 0
                        ? "Identical"
                        : `${activeScenario.metricsComparison.allocatedDelta > 0 ? "+" : ""}${activeScenario.metricsComparison.allocatedDelta} portions`}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-forest">Unallocated Portions</td>
                    <td className="p-2.5 font-bold text-charcoal">
                      {activeScenario.relayMatchResult.unallocated} portions
                    </td>
                    <td className="p-2.5 font-semibold text-charcoal">
                      {activeScenario.fcfsResult.unallocated} portions
                    </td>
                    <td className="p-2.5">
                      {activeScenario.metricsComparison.unallocatedDelta === 0
                        ? "Identical"
                        : `${activeScenario.metricsComparison.unallocatedDelta > 0 ? "+" : ""}${activeScenario.metricsComparison.unallocatedDelta} portions`}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-forest">Urgency-Weighted Impact</td>
                    <td className="p-2.5 font-bold text-emerald">
                      {activeScenario.relayMatchResult.urgencyWeightedPortions} pts
                    </td>
                    <td className="p-2.5 font-semibold text-charcoal">
                      {activeScenario.fcfsResult.urgencyWeightedPortions} pts
                    </td>
                    <td className="p-2.5">
                      {activeScenario.metricsComparison.urgencyWeightedDelta === 0
                        ? "Identical"
                        : `+${activeScenario.metricsComparison.urgencyWeightedDelta} pts (${Math.round((activeScenario.metricsComparison.urgencyWeightedDelta / (activeScenario.fcfsResult.urgencyWeightedPortions || 1)) * 100)}% gain)`}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-forest">Portion-Weighted Distance</td>
                    <td className="p-2.5 font-bold text-forest">
                      {activeScenario.relayMatchResult.averageDistanceKm} km
                    </td>
                    <td className="p-2.5 font-semibold text-charcoal">
                      {activeScenario.fcfsResult.averageDistanceKm} km
                    </td>
                    <td className="p-2.5">
                      {activeScenario.metricsComparison.distanceDelta === 0
                        ? "Identical"
                        : `${activeScenario.metricsComparison.distanceDelta > 0 ? "-" : "+"}${Math.abs(activeScenario.metricsComparison.distanceDelta)} km`}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-forest">Recipients Served</td>
                    <td className="p-2.5 font-bold text-forest">
                      {activeScenario.relayMatchResult.recipientsServedCount} shelters
                    </td>
                    <td className="p-2.5 font-semibold text-charcoal">
                      {activeScenario.fcfsResult.recipientsServedCount} shelters
                    </td>
                    <td className="p-2.5">
                      {activeScenario.relayMatchResult.recipientsServedCount ===
                      activeScenario.fcfsResult.recipientsServedCount
                        ? "Identical"
                        : `${activeScenario.relayMatchResult.recipientsServedCount - activeScenario.fcfsResult.recipientsServedCount} shelters`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Analysis Note */}
            <div className="p-3 rounded-xl bg-mint/30 border border-emerald/20 text-xs text-forest">
              <strong>Scenario Insight:</strong> {activeScenario.metricsComparison.analysis}
            </div>
          </div>
        </div>
      )}

      {/* Methodology & Calculation Transparency */}
      <div className="p-4 rounded-2xl bg-cream/40 border border-gray-100 text-[11px] text-charcoal-muted space-y-1.5">
        <span className="font-bold text-forest block">
          ✦ Mathematical Methodology & Calculation Rules:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div>
            <strong className="text-charcoal block">1. Urgency-Weighted Portions:</strong>
            Sum of (portions × weight) where Critical = 1.0, High = 0.75, Moderate = 0.5, Low = 0.25.
          </div>
          <div>
            <strong className="text-charcoal block">2. Portion-Weighted Distance:</strong>
            Sum of (portions × distance) / totalAllocated. Avoids unweighted distance distortion when small portions travel far.
          </div>
          <div>
            <strong className="text-charcoal block">3. Hard Constraints Applied:</strong>
            Identical FSSAI 2019 safety gate, dietary matching, allergen safety, and storage compatibility enforced for both models.
          </div>
        </div>
      </div>
    </div>
  );
}

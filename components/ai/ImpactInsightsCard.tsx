"use client";

import React, { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Download, CheckCircle2 } from "lucide-react";
import { ImpactInsightsResult } from "@/lib/schemas/insights";

interface ImpactInsightsCardProps {
  metrics: any;
  statusDistribution: any[];
  donorLeaderboard: any[];
}

export function ImpactInsightsCard({
  metrics,
  statusDistribution,
  donorLeaderboard,
}: ImpactInsightsCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<ImpactInsightsResult | null>(null);
  const [meta, setMeta] = useState<{ source: string; executionTimeMs: number } | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/impact-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics,
          statusDistribution,
          donorLeaderboard,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate insights");

      setInsights(data.data);
      setMeta(data.meta);
    } catch (err: any) {
      alert(`AI Insights Error: ${err.message || "Failed to generate insights."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSummary = () => {
    if (!insights) return;
    const reportText = `FOODRELAY AI - LOGISTICAL IMPACT INTELLIGENCE REPORT
Date: ${new Date().toLocaleString()}
Generated via: ${meta?.source || "AI Analyst"}

EXECUTIVE SUMMARY:
${insights.executiveSummary}

DEMAND PATTERNS:
${insights.demandPatterns.map((p) => `- ${p}`).join("\n")}

IDENTIFIED BOTTLENECKS:
${insights.bottlenecksIdentified.map((b) => `- ${b}`).join("\n")}

ACTIONABLE RECOMMENDATIONS:
${insights.actionableRecommendations.map((r) => `- ${r}`).join("\n")}

NOTE: ${insights.disclaimer}
`;
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `foodrelay-impact-insights-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 rounded-3xl bg-forest text-white border border-emerald/30 shadow-elevation space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-forest-light/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-mint rounded-2xl text-forest">
            <Sparkles className="w-5 h-5 text-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-base text-white">
                AI Logistical Impact Intelligence
              </h3>
              <span className="text-[10px] bg-emerald text-white font-bold px-2 py-0.5 rounded uppercase">
                Grounded Interpretation
              </span>
            </div>
            <p className="text-xs text-cream/80">
              Gemini analyzes calculated redistribution ratios, demand spikes, and safety bottlenecks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {insights && (
            <button
              onClick={handleExportSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-dark hover:bg-forest-light border border-forest-light/30 text-white text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-mint hover:bg-white text-forest text-xs font-bold transition disabled:opacity-50 shadow-subtle"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-forest" />
                Interpreting Metrics...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-forest" />
                {insights ? "Refresh Analysis" : "Generate AI Insights"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body Content */}
      {insights ? (
        <div className="space-y-4 text-xs">
          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-forest-dark/80 border border-forest-light/20 space-y-1">
            <span className="text-[10px] uppercase font-bold text-mint tracking-wider block">
              Operational Overview
            </span>
            <p className="text-cream text-xs sm:text-sm leading-relaxed">
              {insights.executiveSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Demand Patterns */}
            <div className="p-4 rounded-2xl bg-forest-dark/80 border border-forest-light/20 space-y-2">
              <span className="text-[11px] font-bold text-mint flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-mint" />
                Demand Patterns
              </span>
              <ul className="space-y-1.5 text-cream/90 text-[11px]">
                {insights.demandPatterns.map((dp, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-mint font-bold mt-0.5">✦</span>
                    <span>{dp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottlenecks */}
            <div className="p-4 rounded-2xl bg-forest-dark/80 border border-forest-light/20 space-y-2">
              <span className="text-[11px] font-bold text-amber flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber" />
                Identified Bottlenecks
              </span>
              <ul className="space-y-1.5 text-cream/90 text-[11px]">
                {insights.bottlenecksIdentified.map((bn, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber font-bold mt-0.5">✦</span>
                    <span>{bn}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-2xl bg-forest-dark/80 border border-forest-light/20 space-y-2">
              <span className="text-[11px] font-bold text-emerald-light flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-emerald-light" />
                Actionable Optimization
              </span>
              <ul className="space-y-1.5 text-cream/90 text-[11px]">
                {insights.actionableRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-light font-bold mt-0.5">✦</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-[10px] text-cream/60 flex items-center justify-between pt-1">
            <span>{insights.disclaimer}</span>
            {meta && (
              <span>
                Generated via <strong>{meta.source}</strong> in {meta.executionTimeMs}ms
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-forest-dark/50 rounded-2xl border border-forest-light/20">
          <Sparkles className="w-8 h-8 text-mint mx-auto mb-2 opacity-80" />
          <h4 className="font-heading font-bold text-white text-sm">
            Unlock Grounded Logistical Insights
          </h4>
          <p className="text-xs text-cream/70 max-w-md mx-auto mt-1">
            Click &quot;Generate AI Insights&quot; to synthesize current allocation rates, safety queues, and shelter demand patterns into an operational summary.
          </p>
        </div>
      )}
    </div>
  );
}

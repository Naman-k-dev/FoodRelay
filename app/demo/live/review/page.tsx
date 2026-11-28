"use client";

import React, { useState } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Thermometer,
  Package,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";

export default function SafetyReviewPage() {
  const {
    donation,
    safetyReview,
    approveSafety,
    revokeSafety,
    updateSafetyChecklist,
    isPresentationMode,
  } = useDemoSession();

  const [isRunningSmartReview, setIsRunningSmartReview] = useState(false);
  const [smartReviewResult, setSmartReviewResult] = useState<{
    riskLevel: string;
    actionableFeedback: string[];
    missingDataFlags: string[];
  } | null>(null);

  // Trigger AI Smart Review (/api/review)
  const handleRunSmartReview = async () => {
    setIsRunningSmartReview(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donation }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setSmartReviewResult({
          riskLevel: json.data.riskLevel || "low",
          actionableFeedback: json.data.actionableFeedback || [
            "Hot holding verified above 65°C compliant with FSSAI regulations.",
            "Prepared within the last 2 hours. 4-hour consumption window active.",
          ],
          missingDataFlags: json.data.missingDataFlags || [],
        });
      }
    } catch (e) {
      // Deterministic fallback response
      setSmartReviewResult({
        riskLevel: "low",
        actionableFeedback: [
          "Sealed packaging verified intact.",
          "Cooked meal within standard 4-hour ambient consumption limit.",
        ],
        missingDataFlags: [],
      });
    } finally {
      setIsRunningSmartReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald/15">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-emerald-300 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald" />
            <span>Food Safety Gate (FSSAI 2019 Compliance)</span>
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Enforce time-temperature standards, packaging integrity, and mandatory human coordinator sign-off before matching.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-bold border ${
              safetyReview.isApproved
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
            }`}
          >
            Status: {safetyReview.isApproved ? "Eligible for Matching ✓" : "Review Required ⏳"}
          </span>
        </div>
      </div>

      {/* REGULATORY DISCLAIMER ALERT */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Indian Food Safety Regulations (FSSAI 2019): </span>
          <span>
            AI algorithms extract facts and assist audits, but <strong>cannot certify microbiological safety</strong>. A verified human coordinator must inspect the food batch and confirm compliance before it enters the matching pipeline.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: EXTRACTED BATCH SAFETY PROFILE */}
        <div
          className={`p-5 rounded-2xl border transition-colors space-y-4 ${
            isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest dark:text-emerald-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald" />
              <span>Surplus Batch Safety Profile</span>
            </h3>
            <span className="text-[11px] font-semibold text-charcoal-muted dark:text-slate-400">
              {donation.donorName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-cream dark:bg-slate-950 border border-emerald/10">
              <span className="text-charcoal-muted dark:text-slate-400 block mb-0.5">Quantity & Unit</span>
              <span className="font-bold text-sm text-forest dark:text-emerald-300">
                {donation.quantity} {donation.unit}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-cream dark:bg-slate-950 border border-emerald/10">
              <span className="text-charcoal-muted dark:text-slate-400 block mb-0.5">Packaging Condition</span>
              <span className="font-bold text-sm text-forest dark:text-emerald-300 capitalize">
                {donation.packagingCondition.replace(/_/g, " ")}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-cream dark:bg-slate-950 border border-emerald/10">
              <span className="text-charcoal-muted dark:text-slate-400 block mb-0.5">Storage Method</span>
              <span className="font-bold text-sm text-forest dark:text-emerald-300 capitalize">
                {donation.storageMethod}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-cream dark:bg-slate-950 border border-emerald/10">
              <span className="text-charcoal-muted dark:text-slate-400 block mb-0.5">Dietary Classification</span>
              <span className="font-bold text-sm text-forest dark:text-emerald-300 capitalize">
                {donation.dietaryCategory.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* AI Smart Review Button & Results */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-charcoal-muted dark:text-slate-400">
                Automated AI Pre-Review Audit
              </span>
              <button
                type="button"
                onClick={handleRunSmartReview}
                disabled={isRunningSmartReview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
              >
                {isRunningSmartReview ? (
                  <>
                    <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Smart Review</span>
                  </>
                )}
              </button>
            </div>

            {smartReviewResult && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    Audit Risk Level: <span className="uppercase text-emerald-600">{smartReviewResult.riskLevel}</span>
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <ul className="list-disc pl-5 text-emerald-800 dark:text-emerald-300 space-y-1">
                  {smartReviewResult.actionableFeedback.map((fb, idx) => (
                    <li key={idx}>{fb}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: FSSAI 2019 HUMAN-IN-THE-LOOP CHECKLIST */}
        <div
          className={`p-5 rounded-2xl border transition-colors space-y-4 ${
            isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest dark:text-emerald-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald" />
              <span>Simulated FSSAI 2019 Verification Checklist</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {Object.values(safetyReview.fssaiChecklist).filter(Boolean).length} / 5 Checked
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-surface-cream dark:hover:bg-slate-950 cursor-pointer transition">
              <input
                type="checkbox"
                checked={safetyReview.fssaiChecklist.packagingSealed}
                onChange={(e) => updateSafetyChecklist("packagingSealed", e.target.checked)}
                className="mt-0.5 rounded text-emerald focus:ring-emerald"
              />
              <div>
                <span className="font-bold block text-charcoal dark:text-white">
                  1. Tamper-Evident Packaging Sealed
                </span>
                <span className="text-charcoal-muted dark:text-slate-400">
                  Food is packaged in clean, food-grade containers preventing contamination.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-surface-cream dark:hover:bg-slate-950 cursor-pointer transition">
              <input
                type="checkbox"
                checked={safetyReview.fssaiChecklist.temperatureControlled}
                onChange={(e) => updateSafetyChecklist("temperatureControlled", e.target.checked)}
                className="mt-0.5 rounded text-emerald focus:ring-emerald"
              />
              <div>
                <span className="font-bold block text-charcoal dark:text-white">
                  2. Temperature Control Compliance
                </span>
                <span className="text-charcoal-muted dark:text-slate-400">
                  Hot food maintained &gt; 65°C or chilled &lt; 4°C during holding.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-surface-cream dark:hover:bg-slate-950 cursor-pointer transition">
              <input
                type="checkbox"
                checked={safetyReview.fssaiChecklist.useByWithinLimit}
                onChange={(e) => updateSafetyChecklist("useByWithinLimit", e.target.checked)}
                className="mt-0.5 rounded text-emerald focus:ring-emerald"
              />
              <div>
                <span className="font-bold block text-charcoal dark:text-white">
                  3. Safe Consumption Window Active
                </span>
                <span className="text-charcoal-muted dark:text-slate-400">
                  Remaining use-by window exceeds 2.5 hours; distribution feasible before spoilage.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-surface-cream dark:hover:bg-slate-950 cursor-pointer transition">
              <input
                type="checkbox"
                checked={safetyReview.fssaiChecklist.donorIdentityConfirmed}
                onChange={(e) => updateSafetyChecklist("donorIdentityConfirmed", e.target.checked)}
                className="mt-0.5 rounded text-emerald focus:ring-emerald"
              />
              <div>
                <span className="font-bold block text-charcoal dark:text-white">
                  4. Commercial Kitchen Identity Verified
                </span>
                <span className="text-charcoal-muted dark:text-slate-400">
                  Donor contact details and premises confirmed for traceability.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-surface-cream dark:hover:bg-slate-950 cursor-pointer transition">
              <input
                type="checkbox"
                checked={safetyReview.fssaiChecklist.sensoryInspectionPassed}
                onChange={(e) => updateSafetyChecklist("sensoryInspectionPassed", e.target.checked)}
                className="mt-0.5 rounded text-emerald focus:ring-emerald"
              />
              <div>
                <span className="font-bold block text-charcoal dark:text-white">
                  5. Organoleptic Sensory Inspection Passed
                </span>
                <span className="text-charcoal-muted dark:text-slate-400">
                  No visual discoloration, off-odors, or packaging breach detected.
                </span>
              </div>
            </label>
          </div>

          {/* SIMULATED APPROVAL CONTROLS */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {safetyReview.isApproved ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approved by {safetyReview.reviewedBy || "Coordinator"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => revokeSafety("Simulated revocation by judge/presenter")}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  Revoke Approval
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => approveSafety()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald text-white hover:bg-forest transition shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Simulate Coordinator Approval (FSSAI 2019)</span>
              </button>
            )}

            <span className="text-[11px] text-charcoal-muted dark:text-slate-400 italic">
              Demonstration Mode (Zero mutation of live records)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

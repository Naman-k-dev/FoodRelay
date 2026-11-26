"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SmartReviewResult, SmartReviewFinding } from "@/lib/schemas/review";

interface SmartReviewPanelProps {
  formData: any;
  onApplyFix?: (fieldName: string, value: any) => void;
}

export function SmartReviewPanel({ formData, onApplyFix }: SmartReviewPanelProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<SmartReviewResult | null>(null);
  const [reviewMeta, setReviewMeta] = useState<{ source: string; executionTimeMs: number } | null>(
    null
  );
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRunReview = async () => {
    setIsReviewing(true);
    setReviewResult(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");

      setReviewResult(data.data);
      setReviewMeta(data.meta);
      setIsExpanded(true);
    } catch (err: any) {
      alert(`Smart Review Error: ${err.message || "Failed to run review."}`);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-emerald/20 shadow-subtle space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-mint rounded-xl text-forest">
            <Sparkles className="w-4 h-4 text-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-sm text-forest">
                AI Smart Review Auditor
              </h3>
              <span className="text-[10px] bg-emerald text-white font-bold px-2 py-0.5 rounded uppercase">
                Advisory Only
              </span>
            </div>
            <p className="text-[11px] text-charcoal-muted">
              Pre-submission audit for FSSAI guideline alignment, timestamp clash & data ambiguity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunReview}
          disabled={isReviewing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition disabled:opacity-50 shadow-subtle self-start sm:self-auto"
        >
          {isReviewing ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
              Auditing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-mint" />
              Audit Draft with AI
            </>
          )}
        </button>
      </div>

      {/* Review Results */}
      {reviewResult && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                  reviewResult.overallStatus === "ready_for_review"
                    ? "bg-mint text-forest"
                    : reviewResult.overallStatus === "critical_inconsistency"
                    ? "bg-crimson-light/40 text-crimson"
                    : "bg-amber-light/30 text-amber-dark"
                }`}
              >
                Status: {reviewResult.overallStatus.replace("_", " ")}
              </span>
              {reviewMeta && (
                <span className="text-[10px] text-charcoal-muted">
                  via {reviewMeta.source} ({reviewMeta.executionTimeMs}ms)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-charcoal-muted hover:text-charcoal flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  Collapse <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Expand <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {isExpanded && (
            <div className="space-y-2 text-xs">
              {reviewResult.findings.length === 0 ? (
                <div className="p-3 rounded-xl bg-mint/40 border border-emerald/20 text-forest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald" />
                  <span>No data inconsistencies or regulatory ambiguities detected!</span>
                </div>
              ) : (
                reviewResult.findings.map((f: SmartReviewFinding, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                      f.severity === "blocker"
                        ? "bg-crimson-light/20 border-crimson/30 text-crimson"
                        : f.severity === "warning"
                        ? "bg-amber-light/20 border-amber/30 text-amber-dark"
                        : "bg-cream border-gray-200 text-charcoal"
                    }`}
                  >
                    {f.severity === "blocker" ? (
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : f.severity === "warning" ? (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="font-semibold">{f.title}</strong>
                        <span className="text-[9px] uppercase font-bold tracking-wider opacity-75">
                          {f.fieldName}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{f.description}</p>
                      <div className="text-[10px] font-medium pt-1 opacity-80">
                        ✦ Action: {f.suggestedAction}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Disclaimer */}
              <div className="text-[10px] text-charcoal-muted pt-1 leading-relaxed">
                {reviewResult.disclaimer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

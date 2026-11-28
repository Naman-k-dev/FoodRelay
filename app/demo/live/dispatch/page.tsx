"use client";

import React, { useState } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowRight,
  ShieldAlert,
  Clock,
  Building,
  RotateCcw,
  Sparkles,
  FileCheck,
  Check,
} from "lucide-react";

export default function DispatchPage() {
  const {
    donation,
    recipients,
    matchResult,
    reservations,
    confirmAllocationPlan,
    advanceDispatchStatus,
    resolveDisruptedReservation,
    isPresentationMode,
  } = useDemoSession();

  const [activeQrModalId, setActiveQrModalId] = useState<string | null>(null);

  // Check if we have uncommitted allocations ready to lock
  const hasAllocationsToLock = matchResult.suggestedAllocations.length > 0 && reservations.length === 0;

  // Active reservations metrics
  const totalReservedPortions = reservations.reduce((sum, r) => sum + r.portions, 0);
  const deliveredCount = reservations.filter((r) => r.status === "delivered").length;
  const disruptedCount = reservations.filter((r) => r.isDisrupted).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald/15">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-emerald-300 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald" />
            <span>Traceable Dispatch & Digital Handover</span>
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Lock allocations, advance state transitions (Reserved → Accepted → Collected → Delivered), and verify digital QR receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasAllocationsToLock && (
            <button
              onClick={confirmAllocationPlan}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald text-white hover:bg-forest transition shadow-sm animate-pulse"
            >
              <FileCheck className="w-4 h-4" />
              <span>Confirm & Lock Allocation Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* DISRUPTION NOTICE BANNER (IF ANY) */}
      {disruptedCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Operational Disruption Detected: Recipient went offline during active dispatch</span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            One or more reserved allocations involve an NGO that became unavailable before food pickup. Per system invariants, progression is halted until coordinator confirms resolution.
          </p>
        </div>
      )}

      {/* RESERVATIONS & DISPATCH PIPELINE LIST */}
      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div
            className={`p-10 rounded-2xl border text-center space-y-4 ${
              isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal dark:text-white">
                No Active Dispatch Reservations
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 max-w-md mx-auto mt-1">
                {matchResult.suggestedAllocations.length > 0
                  ? "We have calculated proposed allocations. Click 'Confirm & Lock Allocation Plan' to initialize the dispatch state machine."
                  : "No allocations are currently suggested. Verify that donation quantity is set and at least one NGO is online in Step 4 (Intelligent Matching)."}
              </p>
            </div>
            {matchResult.suggestedAllocations.length > 0 && (
              <button
                onClick={confirmAllocationPlan}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald text-white hover:bg-forest transition shadow-sm"
              >
                Confirm & Lock Allocation Plan ({matchResult.suggestedAllocations.length} NGOs)
              </button>
            )}
          </div>
        ) : (
          reservations.map((res) => {
            const isDisrupted = res.isDisrupted;
            const isDelivered = res.status === "delivered";

            return (
              <div
                key={res.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDisrupted
                    ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                    : isDelivered
                    ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800"
                    : isPresentationMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-emerald/15 shadow-sm"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Recipient & Quantity Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-charcoal dark:text-white">
                        {res.recipientName}
                      </h4>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {res.portions} Portions
                      </span>
                      {isDisrupted && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Disrupted</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-charcoal-muted dark:text-slate-400 flex items-center gap-3">
                      <span>Confirmed: {new Date(res.confirmedAt).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{res.qrCodeHash}</span>
                    </div>
                    {isDisrupted && res.disruptionReason && (
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mt-1">
                        {res.disruptionReason}
                      </p>
                    )}
                  </div>

                  {/* Dispatch Lifecycle Progress Stepper */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold">
                      <span
                        className={`px-2 py-1 rounded-md ${
                          res.status === "reserved"
                            ? "bg-emerald-600 text-white font-bold"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        1. Reserved
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span
                        className={`px-2 py-1 rounded-md ${
                          res.status === "accepted"
                            ? "bg-emerald-600 text-white font-bold"
                            : res.status === "collected" || res.status === "delivered"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        2. Accepted
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span
                        className={`px-2 py-1 rounded-md ${
                          res.status === "collected"
                            ? "bg-emerald-600 text-white font-bold"
                            : res.status === "delivered"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        3. Collected
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span
                        className={`px-2 py-1 rounded-md ${
                          res.status === "delivered"
                            ? "bg-emerald-600 text-white font-bold"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        4. Delivered ✓
                      </span>
                    </div>
                  </div>

                  {/* Actions: Advance or Resolve */}
                  <div className="flex items-center gap-2">
                    {isDisrupted ? (
                      <button
                        onClick={() => resolveDisruptedReservation(res.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resolve & Redistribute</span>
                      </button>
                    ) : !isDelivered ? (
                      <button
                        onClick={() => advanceDispatchStatus(res.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald hover:bg-forest text-white transition shadow-sm flex items-center gap-1.5"
                      >
                        <span>
                          {res.status === "reserved"
                            ? "Simulate Acceptance"
                            : res.status === "accepted"
                            ? "Simulate Pickup (Driver)"
                            : "Confirm Handover & Delivery"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveQrModalId(res.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-forest text-white hover:bg-emerald transition shadow-sm flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View QR Voucher</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR DIGITAL HANDOVER VOUCHER MODAL */}
      {activeQrModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          {(() => {
            const res = reservations.find((r) => r.id === activeQrModalId);
            if (!res) return null;

            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-forest dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald" />
                    <span>Verifiable Handover Voucher</span>
                  </div>
                  <button
                    onClick={() => setActiveQrModalId(null)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-charcoal-muted"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-surface-cream dark:bg-slate-950 border border-emerald/20 text-center space-y-3">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-inner border border-slate-200 flex flex-col items-center justify-center">
                    {/* Simulated SVG QR Matrix */}
                    <div className="grid grid-cols-6 gap-1 w-28 h-28 p-1">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            (i % 2 === 0 && i % 3 === 0) || i < 6 || i % 6 === 0
                              ? "bg-slate-900"
                              : "bg-emerald-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-forest dark:text-emerald-300">
                    {res.qrCodeHash}
                  </div>
                  <p className="text-[11px] text-charcoal-muted dark:text-slate-400">
                    Cryptographic signature verifying donor batch {donation.id} delivered to {res.recipientName} ({res.portions} portions).
                  </p>
                </div>

                <div className="text-xs space-y-1 text-charcoal-muted dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Donor:</span>
                    <span className="font-semibold text-charcoal dark:text-white">{donation.donorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recipient NGO:</span>
                    <span className="font-semibold text-charcoal dark:text-white">{res.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Portions Handed Over:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{res.portions} portions</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handover Status:</span>
                    <span className="font-bold text-emerald-600 uppercase">Verified Delivered ✓</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveQrModalId(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-forest text-white hover:bg-emerald transition"
                  >
                    Close Voucher
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

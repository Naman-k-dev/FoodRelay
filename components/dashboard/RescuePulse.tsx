"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Donation } from "@/types";
import { formatDateTime } from "@/lib/utils/format";
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldAlert,
  Flame,
  Zap,
} from "lucide-react";

interface RescuePulseProps {
  donations: Donation[];
  onSelectDonation?: (id: string) => void;
}

export function RescuePulse({ donations, onSelectDonation }: RescuePulseProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update clock every 10 seconds for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // Compute countdown for each donation
  const pulseItems = donations.map((d) => {
    const deadlineTime = new Date(d.pickupWindowEnd).getTime();
    const useByTime = new Date(d.confirmedUseBy).getTime();
    const effectiveDeadline = Math.min(
      isNaN(deadlineTime) ? Infinity : deadlineTime,
      isNaN(useByTime) ? Infinity : useByTime
    );

    const diffMs = effectiveDeadline - currentTime;
    const isExpired = diffMs <= 0 || d.status === "expired" || d.safetyReviewStatus === "expired";

    let timeRemainingLabel = "";
    let urgencyBadge = "normal";

    if (isExpired) {
      timeRemainingLabel = "Deadline passed";
      urgencyBadge = "expired";
    } else {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) {
        timeRemainingLabel = `${hours}h ${mins}m remaining`;
      } else {
        timeRemainingLabel = `${mins}m remaining`;
        urgencyBadge = "urgent";
      }
    }

    // Determine status bucket
    const needsAttention =
      d.safetyReviewStatus === "incomplete_info" ||
      d.safetyReviewStatus === "held" ||
      (urgencyBadge === "urgent" && d.remainingQuantity > 0);

    return {
      donation: d,
      timeRemainingLabel,
      urgencyBadge,
      isExpired,
      needsAttention,
    };
  });

  // Filter items
  const filtered = pulseItems.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "needs_attention") return item.needsAttention;
    if (activeFilter === "awaiting_review")
      return item.donation.safetyReviewStatus === "awaiting_human_review";
    if (activeFilter === "eligible")
      return (
        item.donation.safetyReviewStatus === "eligible_for_matching" &&
        !item.isExpired &&
        item.donation.remainingQuantity > 0
      );
    if (activeFilter === "allocated") return item.donation.remainingQuantity === 0;
    if (activeFilter === "expired") return item.isExpired;
    return true;
  });

  // Summary counts
  const urgentCount = pulseItems.filter((p) => p.urgencyBadge === "urgent" && !p.isExpired).length;
  const eligibleCount = pulseItems.filter((p) => p.donation.safetyReviewStatus === "eligible_for_matching" && !p.isExpired && p.donation.remainingQuantity > 0).length;
  const pendingCount = pulseItems.filter((p) => p.donation.safetyReviewStatus === "awaiting_human_review").length;

  return (
    <div className="p-6 rounded-3xl bg-white border border-emerald/20 shadow-elevation space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest text-mint flex items-center justify-center font-bold relative">
            <Activity className="w-5 h-5 text-mint animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-base text-forest">
                Rescue Pulse
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald bg-mint px-2 py-0.5 rounded">
                Live Prototype Monitor
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Pickup window deadlines, allocation readiness, and coordinator attention queue.
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {urgentCount > 0 && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-crimson-light text-crimson flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-crimson" />
              {urgentCount} Expiring Soon
            </span>
          )}
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-mint text-forest flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald" />
            {eligibleCount} Match Ready
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {[
          { id: "all", label: `All (${pulseItems.length})` },
          { id: "needs_attention", label: "Needs Attention" },
          { id: "awaiting_review", label: `Awaiting Review (${pendingCount})` },
          { id: "eligible", label: `Match Ready (${eligibleCount})` },
          { id: "allocated", label: "Allocated" },
          { id: "expired", label: "Expired" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeFilter === f.id
                ? "bg-forest text-white"
                : "bg-cream text-charcoal-muted hover:bg-cream-dark border border-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid of Pulse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map(({ donation, timeRemainingLabel, urgencyBadge, isExpired }) => {
          return (
            <div
              key={donation.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                urgencyBadge === "urgent"
                  ? "bg-amber-light/10 border-amber ring-1 ring-amber/30"
                  : isExpired
                  ? "bg-gray-50 border-gray-200 opacity-75"
                  : "bg-cream/40 border-gray-200 hover:border-emerald/40"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-heading font-bold text-xs text-forest line-clamp-1">
                    {donation.donorName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      urgencyBadge === "urgent"
                        ? "bg-crimson text-white animate-pulse"
                        : isExpired
                        ? "bg-gray-200 text-charcoal-muted"
                        : donation.safetyReviewStatus === "eligible_for_matching"
                        ? "bg-mint text-forest"
                        : "bg-amber-light text-amber-dark"
                    }`}
                  >
                    {isExpired ? "Expired" : timeRemainingLabel}
                  </span>
                </div>

                <p className="text-xs text-charcoal line-clamp-1 mb-2 font-medium">
                  {donation.foodDescription}
                </p>

                <div className="flex items-center justify-between text-[11px] text-charcoal-muted bg-white p-2 rounded-xl border border-gray-100 mb-3">
                  <span>Portions: <strong className="text-forest">{donation.remainingQuantity} / {donation.quantity}</strong></span>
                  <span className="capitalize">{donation.storageMethod}</span>
                  <span className="capitalize font-medium text-emerald">{donation.dietaryCategory}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-charcoal-muted truncate max-w-[130px]">
                  {donation.pickupLocation}
                </span>

                {donation.safetyReviewStatus === "eligible_for_matching" && !isExpired && donation.remainingQuantity > 0 ? (
                  <Link
                    href={`/matches?donationId=${donation.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald hover:bg-emerald-dark text-white rounded-lg font-semibold text-[11px] shadow-subtle transition"
                  >
                    Match Now <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    href={`/donations?highlight=${donation.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-cream text-charcoal rounded-lg font-semibold text-[11px] border border-gray-200 transition"
                  >
                    Inspect Review
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-xs text-charcoal-muted bg-cream/40 rounded-2xl border border-dashed border-gray-200">
          No rescue batches currently match this filter.
        </div>
      )}

      {/* Safety Notice */}
      <div className="text-[10px] text-charcoal-muted flex items-center gap-1.5 pt-2">
        <ShieldAlert className="w-3.5 h-3.5 text-amber flex-shrink-0" />
        <span>
          Countdown timers indicate logistics pickup deadlines based on donor declarations.
          Biological food safety is certified solely via human coordinator inspection.
        </span>
      </div>
    </div>
  );
}

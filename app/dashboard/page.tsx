"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import { computeAnalytics } from "@/lib/analytics/metrics";
import { formatDateTime } from "@/lib/utils/format";
import { RescuePulse } from "@/components/dashboard/RescuePulse";
import {
  PackageCheck,
  PackageOpen,
  Building2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Search,
  Bell,
  X,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export default function DashboardPage() {
  const { isHydrated, donations, recipients, allocations, saveDonation } = useFoodRelay();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-studio-tangerine"></div>
        </div>
      </AppShell>
    );
  }

  const { metrics, statusDistribution, weeklyTrend } = computeAnalytics(
    donations,
    recipients,
    allocations
  );

  const urgentQueue = donations.filter(
    (d) =>
      d.safetyReviewStatus === "awaiting_human_review" ||
      d.safetyReviewStatus === "incomplete_info"
  );

  const activeDonationsCount = donations.filter(
    (d) => d.status === "available" || d.status === "reserved"
  ).length;

  const totalAvailableCapacity = recipients.reduce((sum, r) => sum + r.availableCapacity, 0);

  const allocationRate =
    metrics.totalDonatedPortions > 0
      ? Math.round(
          ((metrics.confirmedDeliveredPortions + metrics.currentlyAllocatedPortions) /
            metrics.totalDonatedPortions) *
            100
        )
      : 0;

  const recentActivities: Array<{ id: string; title: string; time: string; type: string }> = [];

  allocations.slice(0, 4).forEach((a) => {
    const lastTimeline = a.timeline[a.timeline.length - 1];
    if (lastTimeline) {
      recentActivities.push({
        id: a.id,
        title: `${lastTimeline.status.toUpperCase()}: ${a.allocatedPortions} portions (${lastTimeline.actor})`,
        time: lastTimeline.timestamp,
        type: "allocation",
      });
    }
  });

  donations.slice(0, 3).forEach((d) => {
    recentActivities.push({
      id: d.id,
      title: `Intake: ${d.quantity} ${d.unit} from ${d.donorName}`,
      time: d.createdAt,
      type: "donation",
    });
  });

  recentActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const handleSimulateQuickApprove = (donationId: string) => {
    const donation = donations.find((d) => d.id === donationId);
    if (!donation) return;

    const now = new Date().toISOString();
    const updated = {
      ...donation,
      safetyReviewStatus: "eligible_for_matching" as const,
      safetyReviewNotes: "Simulated review: Verified packaging & thermal compliance.",
      safetyReviewer: "Coordinator (Simulated)",
      safetyReviewedAt: now,
      status: "available" as const,
      updatedAt: now,
      history: [
        ...donation.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: now,
          action: "Safety Review Approved",
          actor: "Simulated Coordinator",
          notes: "Coordinator verified packaging and temperature compliance.",
        },
      ],
    };
    saveDonation(updated);
  };

  const matchingDonations = searchQuery.trim()
    ? donations.filter(
        (d) =>
          d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.foodDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const matchingRecipients = searchQuery.trim()
    ? recipients.filter(
        (r) =>
          r.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <AppShell>
      <div className="space-y-4 font-sans">
        {/* Compact Header & Fast Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-studio-border">
          <div>
            <h1 className="text-lg sm:text-xl font-heading font-bold text-studio-text tracking-tight">
              Operational Overview
            </h1>
            <p className="text-2xs text-studio-text-muted mt-0.5">
              Live surplus tracking, FSSAI safety gate triage, and automated redistribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-studio-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter batches or NGOs..."
                className="pl-7 pr-3 py-1 text-2xs rounded border border-studio-border bg-panel text-studio-text focus:outline-none focus:border-studio-tangerine w-40 sm:w-52"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-studio-text-muted hover:text-studio-text"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded border border-studio-border bg-panel text-studio-text-secondary hover:bg-canvas-subtle"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-studio-text-muted" />
              {urgentQueue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-studio-tangerine text-white font-mono font-bold text-[8px] flex items-center justify-center">
                  {urgentQueue.length}
                </span>
              )}
            </button>

            <Link
              href="/donate"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-studio-tangerine text-white hover:bg-studio-tangerine-hover transition shadow-subtle"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Intake</span>
            </Link>
          </div>
        </div>

        {/* Global Search Results Drawer if Active */}
        {searchQuery.trim() && (
          <div className="p-3.5 rounded border border-studio-border bg-panel shadow-card space-y-2 text-xs">
            <div className="flex items-center justify-between text-2xs pb-1.5 border-b border-studio-border">
              <span className="font-semibold text-studio-text">
                Results for &ldquo;{searchQuery}&rdquo;
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-2xs text-studio-text-muted hover:text-studio-text"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-mono text-studio-text-muted uppercase tracking-wider block mb-1">
                  Donations ({matchingDonations.length})
                </span>
                {matchingDonations.length === 0 ? (
                  <p className="text-studio-text-muted text-2xs">No matching batches</p>
                ) : (
                  <div className="space-y-1">
                    {matchingDonations.slice(0, 3).map((d) => (
                      <Link
                        key={d.id}
                        href={`/donations?highlight=${d.id}`}
                        className="block p-1.5 rounded bg-canvas-subtle hover:bg-canvas text-2xs"
                      >
                        <div className="font-medium text-studio-text">{d.donorName}</div>
                        <div className="text-studio-text-muted truncate">
                          {d.foodDescription} · {d.quantity} {d.unit}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono text-studio-text-muted uppercase tracking-wider block mb-1">
                  Shelters ({matchingRecipients.length})
                </span>
                {matchingRecipients.length === 0 ? (
                  <p className="text-studio-text-muted text-2xs">No matching shelters</p>
                ) : (
                  <div className="space-y-1">
                    {matchingRecipients.slice(0, 3).map((r) => (
                      <Link
                        key={r.id}
                        href={`/recipients?highlight=${r.id}`}
                        className="block p-1.5 rounded bg-canvas-subtle hover:bg-canvas text-2xs"
                      >
                        <div className="font-medium text-studio-text">{r.organizationName}</div>
                        <div className="text-studio-text-muted truncate">
                          {r.location} · {r.availableCapacity} slots
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Modal */}
        {showNotifications && (
          <div className="p-3 rounded border border-studio-border bg-panel shadow-card text-xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-studio-border">
              <span className="font-semibold text-studio-text flex items-center gap-1.5 text-2xs">
                <Bell className="w-3.5 h-3.5 text-studio-tangerine" />
                Safety Queue Holds
              </span>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-studio-text-muted hover:text-studio-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {urgentQueue.length === 0 ? (
              <p className="text-2xs text-studio-text-muted">All safety gates verified.</p>
            ) : (
              <div className="space-y-1">
                {urgentQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-1.5 rounded bg-canvas-subtle text-2xs"
                  >
                    <span className="truncate max-w-[280px]">
                      <strong>{item.donorName}</strong>: {item.foodDescription}
                    </span>
                    <Link
                      href={`/donations?highlight=${item.id}`}
                      className="text-studio-tangerine font-medium hover:underline text-2xs ml-2"
                    >
                      Review →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* High-Density Linear-Style KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="p-3 rounded border border-studio-border bg-panel">
            <div className="text-2xs font-mono text-studio-text-muted uppercase">Delivered Portions</div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-studio-text mt-1 tabular-nums">
              {metrics.confirmedDeliveredPortions}
            </div>
            <div className="text-[10px] text-studio-jade mt-0.5">Verified handovers</div>
          </div>

          <div className="p-3 rounded border border-studio-border bg-panel">
            <div className="text-2xs font-mono text-studio-text-muted uppercase">Active Batches</div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-studio-text mt-1 tabular-nums">
              {activeDonationsCount}
            </div>
            <div className="text-[10px] text-studio-text-muted mt-0.5">In coordination</div>
          </div>

          <div className="p-3 rounded border border-studio-border bg-panel">
            <div className="text-2xs font-mono text-studio-text-muted uppercase">Open Capacity</div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-studio-text mt-1 tabular-nums">
              {totalAvailableCapacity}
            </div>
            <div className="text-[10px] text-studio-text-muted mt-0.5">Shelter slots</div>
          </div>

          <div className="p-3 rounded border border-studio-border bg-panel">
            <div className="text-2xs font-mono text-studio-text-muted uppercase">Safety Gate Holds</div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-studio-tangerine mt-1 tabular-nums">
              {metrics.pendingDonationsCount}
            </div>
            <div className="text-[10px] text-studio-tangerine mt-0.5">Needs sign-off</div>
          </div>

          <div className="p-3 rounded border border-studio-border bg-panel col-span-2 lg:col-span-1">
            <div className="text-2xs font-mono text-studio-text-muted uppercase">Allocation Rate</div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-studio-text mt-1 tabular-nums">
              {allocationRate}%
            </div>
            <div className="text-[10px] text-studio-text-muted mt-0.5">Efficiency index</div>
          </div>
        </div>

        {/* Real-Time Rescue Pulse Component */}
        <RescuePulse donations={donations} />

        {/* Charts & Urgent Queue Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Chart: Weekly Delivery Activity */}
          <div className="lg:col-span-2 p-3.5 rounded border border-studio-border bg-panel flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-studio-border">
              <div>
                <h3 className="font-heading font-semibold text-xs text-studio-text">
                  Delivery Volume Trend (Portions)
                </h3>
                <span className="text-[10px] text-studio-text-muted">
                  Daily verified recipient handovers over the last 7 days.
                </span>
              </div>
              <span className="text-2xs font-mono text-studio-text-muted">WEEKLY</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#71717A" }} axisLine={{ stroke: "#E8E5DF" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#71717A" }} axisLine={{ stroke: "#E8E5DF" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141417",
                      color: "#FAF9F6",
                      borderRadius: "4px",
                      fontSize: "11px",
                      border: "none",
                    }}
                    formatter={(val) => [`${val} portions`, "Delivered"]}
                  />
                  <Bar dataKey="deliveredPortions" fill="#635BFF" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donation Status Mix */}
          <div className="p-3.5 rounded border border-studio-border bg-panel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-studio-border">
                <h3 className="font-heading font-semibold text-xs text-studio-text">
                  Status Distribution
                </h3>
                <span className="text-2xs font-mono text-studio-text-muted">ALL BATCHES</span>
              </div>
            </div>

            <div className="h-36 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={52}
                    paddingAngle={2}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} batches`, String(name)]}
                    contentStyle={{
                      backgroundColor: "#141417",
                      color: "#FAF9F6",
                      borderRadius: "4px",
                      fontSize: "11px",
                      border: "none",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] mt-1 justify-center">
              {statusDistribution.slice(0, 4).map((s) => (
                <div key={s.name} className="flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color }} />
                  <span className="text-studio-text-muted">
                    {s.name}: {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Row: Urgent Queue & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Urgent Safety Review Queue */}
          <div className="lg:col-span-2 p-3.5 rounded border border-studio-border bg-panel">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-studio-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-studio-tangerine" />
                <h3 className="font-heading font-semibold text-xs text-studio-text">
                  Safety Review Queue
                </h3>
              </div>
              <Link
                href="/donations"
                className="text-2xs text-studio-tangerine font-medium hover:underline"
              >
                All Batches ({donations.length}) →
              </Link>
            </div>

            {urgentQueue.length === 0 ? (
              <div className="p-6 text-center bg-canvas-subtle rounded border border-studio-border">
                <CheckCircle2 className="w-6 h-6 text-studio-jade mx-auto mb-1.5" />
                <p className="text-xs font-medium text-studio-text">All safety gates clear</p>
                <p className="text-2xs text-studio-text-muted mt-0.5">
                  No batches held awaiting verification.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded border border-studio-border bg-canvas-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-studio-text text-xs">{item.donorName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-studio-tangerine text-white uppercase">
                          {item.safetyReviewStatus.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-2xs text-studio-text-secondary mt-0.5 truncate max-w-md">
                        {item.foodDescription}
                      </p>
                      <div className="flex items-center gap-3 text-2xs text-studio-text-muted mt-0.5 font-mono">
                        <span>Quantity: {item.quantity} {item.unit}</span>
                        <span>Expires: {formatDateTime(item.confirmedUseBy)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <Link
                        href={`/donations?highlight=${item.id}`}
                        className="px-2 py-1 text-2xs rounded border border-studio-border bg-panel text-studio-text hover:bg-canvas"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleSimulateQuickApprove(item.id)}
                        className="px-2.5 py-1 text-2xs font-semibold rounded bg-studio-jade text-white hover:bg-studio-jade/90"
                      >
                        Pass Gate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Operations Activity */}
          <div className="p-3.5 rounded border border-studio-border bg-panel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-studio-border">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-studio-text-muted" />
                  <h3 className="font-heading font-semibold text-xs text-studio-text">
                    Recent Activity
                  </h3>
                </div>
                <Link
                  href="/dispatch"
                  className="text-2xs text-studio-tangerine font-medium hover:underline"
                >
                  Dispatch →
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentActivities.slice(0, 5).map((act, i) => (
                  <div key={i} className="flex items-start gap-2 text-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-studio-jade mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-studio-text truncate">{act.title}</p>
                      <span className="text-[10px] font-mono text-studio-text-muted">
                        {formatDateTime(act.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-studio-border">
              <Link
                href="/donate"
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-2xs font-semibold rounded bg-canvas-subtle hover:bg-canvas text-studio-text border border-studio-border transition"
              >
                <PlusCircle className="w-3 h-3 text-studio-tangerine" />
                <span>New Surplus Intake</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

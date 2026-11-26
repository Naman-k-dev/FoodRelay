"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import { computeAnalytics } from "@/lib/analytics/metrics";
import { formatDateTime } from "@/lib/utils/format";
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
  ExternalLink,
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

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
        </div>
      </AppShell>
    );
  }

  const { metrics, statusDistribution, weeklyTrend } = computeAnalytics(
    donations,
    recipients,
    allocations
  );

  // Urgent review queue: donations awaiting human safety review
  const urgentQueue = donations.filter(
    (d) =>
      d.safetyReviewStatus === "awaiting_human_review" ||
      d.safetyReviewStatus === "incomplete_info"
  );

  // Active donations: available or reserved
  const activeDonationsCount = donations.filter(
    (d) => d.status === "available" || d.status === "reserved"
  ).length;

  // Available recipient capacity
  const totalAvailableCapacity = recipients.reduce((sum, r) => sum + r.availableCapacity, 0);

  // Allocation rate
  const allocationRate =
    metrics.totalDonatedPortions > 0
      ? Math.round(
          ((metrics.confirmedDeliveredPortions + metrics.currentlyAllocatedPortions) /
            metrics.totalDonatedPortions) *
            100
        )
      : 0;

  // Recent rescue activities across donations
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
      title: `Intake logged: ${d.quantity} ${d.unit} from ${d.donorName}`,
      time: d.createdAt,
      type: "donation",
    });
  });

  // Sort activities by time descending
  recentActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Fast simulated approval handler for urgent queue
  const handleSimulateQuickApprove = (donationId: string) => {
    const donation = donations.find((d) => d.id === donationId);
    if (!donation) return;

    const now = new Date().toISOString();
    const updated = {
      ...donation,
      safetyReviewStatus: "eligible_for_matching" as const,
      safetyReviewNotes: "Simulated review: Approved by coordinator for demo allocation.",
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

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header & Fast Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
              Operations Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Real-time surplus food coordination, safety review queue, and allocation status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-forest hover:bg-forest-light text-white shadow-subtle transition"
            >
              <Sparkles className="w-4 h-4 text-mint" />
              AI Smart Intake
            </Link>
            <Link
              href="/matches"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white hover:bg-cream text-forest border border-gray-200 shadow-subtle transition"
            >
              Match Center
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Delivered Portions */}
          <div className="p-4 rounded-2xl bg-white border border-emerald/10 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-charcoal-muted mb-2">
              <span className="text-xs font-semibold">Delivered Portions</span>
              <PackageCheck className="w-4 h-4 text-emerald" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-forest">
                {metrics.confirmedDeliveredPortions}
              </div>
              <span className="text-[10px] text-emerald font-medium">Confirmed delivered</span>
            </div>
          </div>

          {/* Card 2: Active Donations */}
          <div className="p-4 rounded-2xl bg-white border border-emerald/10 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-charcoal-muted mb-2">
              <span className="text-xs font-semibold">Active Donations</span>
              <PackageOpen className="w-4 h-4 text-forest" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-forest">
                {activeDonationsCount}
              </div>
              <span className="text-[10px] text-charcoal-muted">Available or reserved</span>
            </div>
          </div>

          {/* Card 3: Recipient Capacity */}
          <div className="p-4 rounded-2xl bg-white border border-emerald/10 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-charcoal-muted mb-2">
              <span className="text-xs font-semibold">Available Capacity</span>
              <Building2 className="w-4 h-4 text-forest" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-forest">
                {totalAvailableCapacity}
              </div>
              <span className="text-[10px] text-charcoal-muted">Portion slots open</span>
            </div>
          </div>

          {/* Card 4: Safety Reviews Pending */}
          <div className="p-4 rounded-2xl bg-white border border-amber/20 shadow-subtle flex flex-col justify-between bg-amber-light/10">
            <div className="flex items-center justify-between text-amber mb-2">
              <span className="text-xs font-semibold">Safety Gate Holds</span>
              <ShieldAlert className="w-4 h-4 text-amber" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-amber">
                {metrics.pendingDonationsCount}
              </div>
              <span className="text-[10px] text-amber font-medium">Needs coordinator review</span>
            </div>
          </div>

          {/* Card 5: Allocation Rate */}
          <div className="p-4 rounded-2xl bg-white border border-emerald/10 shadow-subtle flex flex-col justify-between col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-charcoal-muted mb-2">
              <span className="text-xs font-semibold">Allocation Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-forest">
                {allocationRate}%
              </div>
              <span className="text-[10px] text-charcoal-muted">Of portion donations</span>
            </div>
          </div>
        </div>

        {/* Charts & Urgent Queue Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart: Weekly Delivered Trend */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-gray-100 shadow-subtle flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-sm text-forest">
                  Weekly Delivery Activity (Portions)
                </h3>
                <p className="text-[11px] text-charcoal-muted">
                  Portion volume verified at recipient handovers over the last 7 days.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-mint text-forest">
                Simulated Trend
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#123B2B",
                      color: "#FFFFFF",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      border: "none",
                    }}
                    formatter={(val) => [`${val} portions`, "Delivered"]}
                  />
                  <Bar dataKey="deliveredPortions" fill="#15803D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donation Status Distribution */}
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-subtle flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-forest mb-1">
                Donation Status Mix
              </h3>
              <p className="text-[11px] text-charcoal-muted mb-3">
                Lifecycle stage of all recorded donation batches.
              </p>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} batches`, String(name)]}
                    contentStyle={{
                      backgroundColor: "#123B2B",
                      color: "#FFFFFF",
                      borderRadius: "0.5rem",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] mt-2 justify-center">
              {statusDistribution.slice(0, 4).map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-charcoal-muted">
                    {s.name}: {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Row: Urgent Safety Queue & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Urgent Safety Review Queue */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-gray-100 shadow-subtle">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber" />
                <h3 className="font-heading font-bold text-sm text-forest">
                  Urgent Food Safety Review Queue
                </h3>
              </div>
              <Link
                href="/donations"
                className="text-xs text-emerald font-semibold hover:underline flex items-center gap-1"
              >
                All Donations ({donations.length}) →
              </Link>
            </div>

            {urgentQueue.length === 0 ? (
              <div className="p-8 text-center bg-cream/40 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald mx-auto mb-2" />
                <p className="text-xs font-semibold text-forest">All clear!</p>
                <p className="text-[11px] text-charcoal-muted">
                  No donations currently held by the safety gate.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-amber-light/10 border border-amber/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-forest text-xs">{item.donorName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber text-charcoal uppercase">
                          {item.safetyReviewStatus.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal mt-1 line-clamp-1">{item.foodDescription}</p>
                      <div className="flex items-center gap-4 text-[10px] text-charcoal-muted mt-1">
                        <span>Quantity: {item.quantity} {item.unit}</span>
                        <span>Expires in: {formatDateTime(item.confirmedUseBy)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        href={`/donations?highlight=${item.id}`}
                        className="px-2.5 py-1.5 text-xs font-medium text-charcoal bg-white rounded-lg border border-gray-200 hover:bg-cream transition"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleSimulateQuickApprove(item.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald hover:bg-emerald-dark rounded-lg transition shadow-subtle"
                      >
                        Simulate Review Pass
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Coordination Activity */}
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-forest" />
                  <h3 className="font-heading font-bold text-sm text-forest">
                    Recent Activity
                  </h3>
                </div>
                <Link
                  href="/dispatch"
                  className="text-xs text-emerald font-semibold hover:underline"
                >
                  Dispatch →
                </Link>
              </div>

              <div className="space-y-3.5">
                {recentActivities.slice(0, 5).map((act, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-charcoal leading-snug">{act.title}</p>
                      <span className="text-[10px] text-charcoal-muted">
                        {formatDateTime(act.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100">
              <Link
                href="/donate"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-forest bg-mint hover:bg-mint-dark rounded-xl transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add New Donation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

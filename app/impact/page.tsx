"use client";

import React, { useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import { computeAnalytics } from "@/lib/analytics/metrics";
import { FoodRelayRepository } from "@/lib/storage/repository";
import { ImpactInsightsCard } from "@/components/ai/ImpactInsightsCard";
import {
  BarChart3,
  Download,
  Upload,
  RotateCcw,
  PackageCheck,
  PackageOpen,
  Building2,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
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

export default function ImpactPage() {
  const { isHydrated, donations, recipients, allocations, refresh } = useFoodRelay();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
        </div>
      </AppShell>
    );
  }

  const {
    metrics,
    statusDistribution,
    weeklyTrend,
    donorLeaderboard,
    recipientDistribution,
  } = computeAnalytics(donations, recipients, allocations);

  // CSV Export Handler
  const handleDownloadCSV = () => {
    const headers = [
      "Allocation_ID",
      "Donation_ID",
      "Donor_Name",
      "Recipient_Name",
      "Allocated_Portions",
      "Distance_Km",
      "Score",
      "Status",
      "Completed_Date",
    ];

    const rows = allocations.map((a) => {
      const don = donations.find((d) => d.id === a.donationId);
      const rec = recipients.find((r) => r.id === a.recipientId);
      return [
        a.id,
        a.donationId,
        `"${don?.donorName || a.donationId}"`,
        `"${rec?.organizationName || a.recipientId}"`,
        a.allocatedPortions,
        a.distanceKm,
        a.score,
        a.status,
        a.handoverReceipt?.completedAt || a.updatedAt,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `foodrelay_allocations_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export Handler
  const handleExportJSON = () => {
    const jsonStr = FoodRelayRepository.exportJSON();
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", `foodrelay_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Import Handler
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = FoodRelayRepository.importJSON(content);
        if (ok) {
          alert("Backup successfully restored!");
          refresh();
        } else {
          alert("Failed to parse JSON backup. Format invalid.");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
              Impact Analytics
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Deterministic accountability metrics, portion ledger balances, and audit exports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-charcoal hover:bg-cream transition shadow-subtle"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald" />
              Download CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-charcoal hover:bg-cream transition shadow-subtle"
            >
              <FileCode className="w-3.5 h-3.5 text-forest" />
              Backup JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-charcoal hover:bg-cream transition shadow-subtle"
            >
              <Upload className="w-3.5 h-3.5 text-charcoal-muted" />
              Restore
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Demo Data Accountability Notice */}
        <div className="p-3.5 rounded-xl bg-cream border border-emerald/20 text-xs text-charcoal flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Demonstration Data Disclosure:</strong> All figures shown below represent stored
            application records in this browser instance. FoodRelay reports meal portions strictly as
            accounted portions—not invented people fed, fabricated carbon coefficients, or false partner testimonials.
          </div>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-emerald/10 shadow-subtle flex flex-col justify-between">
            <span className="text-xs font-semibold text-charcoal-muted">
              Total Donated Portions
            </span>
            <div className="text-3xl font-heading font-black text-forest mt-2">
              {metrics.totalDonatedPortions}
            </div>
            <span className="text-[10px] text-charcoal-muted mt-1">Recorded in portion batches</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald/10 shadow-subtle flex flex-col justify-between">
            <span className="text-xs font-semibold text-charcoal-muted">
              Confirmed Delivered
            </span>
            <div className="text-3xl font-heading font-black text-emerald mt-2">
              {metrics.confirmedDeliveredPortions}
            </div>
            <span className="text-[10px] text-emerald font-medium mt-1">
              Verified digital receipts
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald/10 shadow-subtle flex flex-col justify-between">
            <span className="text-xs font-semibold text-charcoal-muted">
              Reserved in Transit
            </span>
            <div className="text-3xl font-heading font-black text-amber mt-2">
              {metrics.currentlyAllocatedPortions}
            </div>
            <span className="text-[10px] text-charcoal-muted mt-1">
              Active dispatch pipeline
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald/10 shadow-subtle flex flex-col justify-between">
            <span className="text-xs font-semibold text-charcoal-muted">
              Outstanding Demand
            </span>
            <div className="text-3xl font-heading font-black text-forest mt-2">
              {metrics.outstandingRecipientDemand}
            </div>
            <span className="text-[10px] text-charcoal-muted mt-1">Unmet shelter capacity</span>
          </div>
        </div>

        {/* AI Logistical Impact Intelligence */}
        <ImpactInsightsCard
          metrics={metrics}
          statusDistribution={statusDistribution}
          donorLeaderboard={donorLeaderboard}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: 7-day Delivery Trend */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-gray-100 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-sm text-forest">
                  Daily Handover Volume (Portions)
                </h3>
                <p className="text-[11px] text-charcoal-muted">
                  Aggregated delivered portions over the last 7 days.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-mint text-forest px-2 py-0.5 rounded">
                Verified Handover
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val} portions`, "Delivered"]}
                    contentStyle={{
                      backgroundColor: "#123B2B",
                      color: "#FFFFFF",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="deliveredPortions" fill="#15803D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leaderboard: Top Donors */}
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-subtle flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-forest mb-1">
                Top Donor Entities
              </h3>
              <p className="text-[11px] text-charcoal-muted mb-4">
                By portion volume contributed.
              </p>

              <div className="space-y-3">
                {donorLeaderboard.map((donor, idx) => (
                  <div
                    key={donor.name}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-cream/50 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-5 h-5 rounded-full bg-forest text-mint flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-charcoal truncate">{donor.name}</span>
                    </div>
                    <span className="font-bold text-forest whitespace-nowrap">
                      {donor.portions} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-[11px] text-charcoal-muted">
              Cancellation rate across all batches: <strong>{metrics.cancellationRate}%</strong>
            </div>
          </div>
        </div>

        {/* Lower Row: Recipient Distribution Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-subtle space-y-4">
          <h3 className="font-heading font-bold text-sm text-forest">
            Recipient Capacity Breakdown by Organization Type
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {recipientDistribution.map((item) => (
              <div key={item.type} className="p-3.5 rounded-xl bg-cream/70 border border-gray-100 text-xs">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block">
                  {item.type}
                </span>
                <div className="text-xl font-heading font-bold text-forest mt-1">
                  {item.demand} portions
                </div>
                <span className="text-[10px] text-charcoal-muted">{item.count} organization(s)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

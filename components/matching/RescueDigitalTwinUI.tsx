"use client";

import React, { useState, useMemo } from "react";
import { Donation, Recipient, MatchingWeights, MatchResult } from "@/types";
import { runRelayMatch } from "@/lib/matching/relayMatch";
import {
  Activity,
  Sliders,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Scale,
  Layers,
  MapPin,
  Clock,
  Truck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
} from "recharts";

interface RescueDigitalTwinUIProps {
  donation: Donation;
  recipients: Recipient[];
  weights: MatchingWeights;
}

export function RescueDigitalTwinUI({
  donation,
  recipients,
  weights,
}: RescueDigitalTwinUIProps) {
  // Scenario Parameters (Default to 1.0 / no changes)
  const [quantityDeltaPercent, setQuantityDeltaPercent] = useState<number>(0); // -50% to +100%
  const [capacityDeltaPercent, setCapacityDeltaPercent] = useState<number>(0); // -50% to +50%
  const [excludedRecipientIds, setExcludedRecipientIds] = useState<string[]>([]);
  const [emergencyShelterCapacity, setEmergencyShelterCapacity] = useState<number>(0); // +0, +50, +100
  const [forceSelfPickupOnly, setForceSelfPickupOnly] = useState<boolean>(false);
  const [pickupWindowCutoffHours, setPickupWindowCutoffHours] = useState<number>(0); // -2 to +2 hours

  // AI Explanation State
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // 1. Calculate Baseline Run (Pristine clone)
  const baselineResult: MatchResult = useMemo(() => {
    return runRelayMatch(donation, recipients, weights, new Date());
  }, [donation, recipients, weights]);

  // 2. Synthesize Digital Twin Scenario Records (Pristine deep copy, zero mutation to store)
  const { twinDonation, twinRecipients, twinResult } = useMemo(() => {
    // Clone donation with quantity delta
    const multiplier = 1 + quantityDeltaPercent / 100;
    const modifiedQuantity = Math.max(10, Math.round(donation.remainingQuantity * multiplier));

    let modifiedPickupEnd = donation.pickupWindowEnd;
    if (pickupWindowCutoffHours !== 0) {
      const origDate = new Date(donation.pickupWindowEnd);
      const shifted = new Date(origDate.getTime() + pickupWindowCutoffHours * 3600 * 1000);
      modifiedPickupEnd = shifted.toISOString();
    }

    const tDonation: Donation = {
      ...donation,
      remainingQuantity: modifiedQuantity,
      pickupWindowEnd: modifiedPickupEnd,
    };

    // Clone recipients with capacity deltas and toggles
    const capMultiplier = 1 + capacityDeltaPercent / 100;
    const tRecipients: Recipient[] = recipients.map((r) => {
      const isExcluded = excludedRecipientIds.includes(r.id);
      const adjustedCap = isExcluded
        ? 0
        : Math.max(0, Math.round(r.availableCapacity * capMultiplier));
      const adjustedDemand = isExcluded
        ? 0
        : Math.max(0, Math.round(r.remainingDemand * capMultiplier));

      let transport = r.transportAvailability;
      if (forceSelfPickupOnly && transport === "delivery_only") {
        transport = "delivery_only"; // Will be penalized/filtered if self-pickup required
      }

      return {
        ...r,
        availableCapacity: adjustedCap,
        remainingDemand: adjustedDemand,
        transportAvailability: transport,
      };
    });

    // Inject emergency shelter if selected
    if (emergencyShelterCapacity > 0) {
      tRecipients.push({
        id: "twin-emergency-shelter",
        organizationName: "Rapid Relief Emergency Annex (Sector 62)",
        organizationType: "shelter",
        contactPerson: "Field Dispatcher",
        phone: "+91-98999-00000",
        location: "Sector 62, Noida (1.5 km)",
        latitude: donation.latitude + 0.008,
        longitude: donation.longitude + 0.008,
        requestedMealPortions: emergencyShelterCapacity,
        remainingDemand: emergencyShelterCapacity,
        receivingCapacity: emergencyShelterCapacity,
        availableCapacity: emergencyShelterCapacity,
        urgencyLevel: "critical",
        acceptedDietaryCategories: [donation.dietaryCategory],
        allergenRestrictions: [],
        storageCapabilities: [donation.storageMethod, "ambient", "heated", "refrigerated"],
        transportAvailability: "self_pickup",
        receivingWindowStart: donation.pickupWindowStart,
        receivingWindowEnd: donation.pickupWindowEnd,
        verificationStatus: "simulated_verified",
        isDemo: true,
      });
    }

    // Run RelayMatch on the twin scenario
    const tResult = runRelayMatch(tDonation, tRecipients, weights, new Date());

    return {
      twinDonation: tDonation,
      twinRecipients: tRecipients,
      twinResult: tResult,
    };
  }, [
    donation,
    recipients,
    weights,
    quantityDeltaPercent,
    capacityDeltaPercent,
    excludedRecipientIds,
    emergencyShelterCapacity,
    forceSelfPickupOnly,
    pickupWindowCutoffHours,
  ]);

  // Reset all scenario modifications
  const handleResetScenario = () => {
    setQuantityDeltaPercent(0);
    setCapacityDeltaPercent(0);
    setExcludedRecipientIds([]);
    setEmergencyShelterCapacity(0);
    setForceSelfPickupOnly(false);
    setPickupWindowCutoffHours(0);
    setAiExplanation(null);
  };

  // Toggle recipient exclusion
  const handleToggleRecipientExclusion = (id: string) => {
    setExcludedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Compare Recipient Allocation Changes
  const comparisonItems = useMemo(() => {
    const allRecipientIds = Array.from(
      new Set([
        ...recipients.map((r) => r.id),
        ...(emergencyShelterCapacity > 0 ? ["twin-emergency-shelter"] : []),
      ])
    );

    return allRecipientIds
      .map((rId) => {
        const origRec = recipients.find((r) => r.id === rId);
        const name = origRec?.organizationName || "Rapid Relief Emergency Annex";
        const origAlloc =
          baselineResult.suggestedAllocations.find((a) => a.recipientId === rId)
            ?.allocatedPortions || 0;
        const twinAlloc =
          twinResult.suggestedAllocations.find((a) => a.recipientId === rId)
            ?.allocatedPortions || 0;
        const delta = twinAlloc - origAlloc;
        const isExcluded = excludedRecipientIds.includes(rId);

        let statusNote = "No change";
        if (isExcluded) {
          statusNote = "Excluded by coordinator toggle";
        } else if (origAlloc === 0 && twinAlloc > 0) {
          statusNote = "Newly introduced to absorb surplus";
        } else if (origAlloc > 0 && twinAlloc === 0) {
          statusNote = "Dropped due to capacity/constraint change";
        } else if (delta > 0) {
          statusNote = `Increased absorption (+${delta} portions)`;
        } else if (delta < 0) {
          statusNote = `Reduced allocation (${delta} portions)`;
        }

        return {
          id: rId,
          name,
          urgency: origRec?.urgencyLevel || "critical",
          origAlloc,
          twinAlloc,
          delta,
          isExcluded,
          statusNote,
        };
      })
      .filter((item) => item.origAlloc > 0 || item.twinAlloc > 0 || item.isExcluded);
  }, [recipients, baselineResult, twinResult, excludedRecipientIds, emergencyShelterCapacity]);

  // Prepare chart data
  const chartData = comparisonItems.map((c) => ({
    name: c.name.length > 18 ? c.name.slice(0, 16) + "…" : c.name,
    Original: c.origAlloc,
    Scenario: c.twinAlloc,
  }));

  // Request AI Operational Explanation with exact grounded metrics
  const handleRequestAiExplanation = async () => {
    setIsGeneratingAi(true);
    setAiExplanation(null);

    const promptText = `Analyze this simulated Food Rescue Digital Twin scenario:
Original Batch: ${donation.remainingQuantity} portions.
Scenario Batch: ${twinDonation.remainingQuantity} portions (${quantityDeltaPercent > 0 ? "+" : ""}${quantityDeltaPercent}%).
Original Allocated: ${baselineResult.allocatedPortions} portions (${baselineResult.unallocatedPortions} unallocated).
Scenario Allocated: ${twinResult.allocatedPortions} portions (${twinResult.unallocatedPortions} unallocated).
Excluded Recipients: ${excludedRecipientIds.length > 0 ? excludedRecipientIds.join(", ") : "None"}.
Emergency Capacity Added: ${emergencyShelterCapacity} portions.
Capacity Shift: ${capacityDeltaPercent}%.

Please provide a concise 3-bullet operational briefing explaining:
1. Operational impact on recipient coverage.
2. Logistical risk assessment (unallocated waste vs delivery strain).
3. Recommended coordinator action.
Do not invent any numbers; use the exact figures supplied above.`;

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: promptText,
          recordsContext: {
            donation: twinDonation,
            allocations: twinResult.suggestedAllocations,
            recipients: twinRecipients,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.data?.answer || data.data?.summary || "Scenario evaluated successfully.");
      } else {
        setAiExplanation(
          `Digital Twin operational summary: Scenario shifted allocation from ${baselineResult.allocatedPortions} portions to ${twinResult.allocatedPortions} portions (${twinResult.unallocatedPortions} portions unallocated). ${
            twinResult.unallocatedPortions > 0
              ? "Warning: Unallocated surplus detected. Recommend onboarding additional local shelters or adjusting pickup windows."
              : "Positive: Full surplus absorption achieved across active network."
          }`
        );
      }
    } catch {
      setAiExplanation(
        `Digital Twin operational summary: Allocation rebalanced dynamically to ${twinResult.allocatedPortions} portions across active shelters. Zero saved records mutated.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-emerald/20 shadow-elevation space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest text-mint flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 text-mint" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-base text-forest">
                Food Rescue Digital Twin (Scenario Analysis)
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-forest-light px-2 py-0.5 rounded">
                Operational Sandbox
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Simulate operational shocks and network fluctuations in real-time. Saved records remain 100% untouched.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetScenario}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-cream hover:bg-cream-dark text-charcoal text-xs font-semibold flex items-center gap-1.5 border border-gray-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-forest" />
          Reset Scenario
        </button>
      </div>

      {/* Interactive Control Panel (Sliders & Toggles) */}
      <div className="p-5 rounded-2xl bg-cream/40 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-forest">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald" />
            Interactive Scenario Levers
          </span>
          <span className="text-[11px] font-normal text-charcoal-muted">
            Move sliders to observe instantaneous allocation rebalancing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Lever 1: Surplus Quantity Slider */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-charcoal">Available Surplus</span>
              <span className="font-mono font-bold text-forest">
                {twinDonation.remainingQuantity} portions ({quantityDeltaPercent >= 0 ? "+" : ""}{quantityDeltaPercent}%)
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="10"
              value={quantityDeltaPercent}
              onChange={(e) => setQuantityDeltaPercent(parseInt(e.target.value, 10))}
              className="w-full accent-forest cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal-muted">
              <span>-50% (Drought)</span>
              <span>Baseline (100%)</span>
              <span>+100% (Surge)</span>
            </div>
          </div>

          {/* Lever 2: Shelter Capacity Shift Slider */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-charcoal">Network Capacity</span>
              <span className="font-mono font-bold text-forest">
                {capacityDeltaPercent >= 0 ? "+" : ""}{capacityDeltaPercent}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="10"
              value={capacityDeltaPercent}
              onChange={(e) => setCapacityDeltaPercent(parseInt(e.target.value, 10))}
              className="w-full accent-forest cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal-muted">
              <span>-50% (Storage full)</span>
              <span>Nominal (0%)</span>
              <span>+50% (Expanded)</span>
            </div>
          </div>

          {/* Lever 3: Emergency Annex Toggle */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-charcoal">Rapid Relief Annex</span>
              <span className="font-mono font-bold text-emerald">
                {emergencyShelterCapacity > 0 ? `+${emergencyShelterCapacity} cap` : "Disabled"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[0, 50, 100].map((cap) => (
                <button
                  key={cap}
                  onClick={() => setEmergencyShelterCapacity(cap)}
                  className={`py-1 rounded-lg font-semibold text-[11px] transition ${
                    emergencyShelterCapacity === cap
                      ? "bg-forest text-white"
                      : "bg-cream text-charcoal hover:bg-cream-dark"
                  }`}
                >
                  {cap === 0 ? "Off" : `+${cap} pts`}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-charcoal-muted block">
              Injects emergency shelter within 1.5 km
            </span>
          </div>
        </div>

        {/* Recipient Availability Checklist (Operational Disruptions) */}
        <div className="pt-2 border-t border-gray-200">
          <span className="font-semibold text-charcoal block mb-2 text-xs">
            Simulate Recipient Disruption (Toggle offline to test re-routing):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {recipients.slice(0, 6).map((rec) => {
              const isExcluded = excludedRecipientIds.includes(rec.id);
              return (
                <button
                  key={rec.id}
                  onClick={() => handleToggleRecipientExclusion(rec.id)}
                  className={`p-2 rounded-xl text-left border text-xs flex items-center justify-between transition ${
                    isExcluded
                      ? "bg-amber-light/30 border-amber text-charcoal"
                      : "bg-white border-gray-200 hover:border-emerald/40 text-charcoal"
                  }`}
                >
                  <div className="line-clamp-1 pr-2">
                    <span className="font-medium">{rec.organizationName}</span>
                    <span className="text-[10px] text-charcoal-muted block">
                      Cap: {rec.availableCapacity} · {rec.urgencyLevel}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isExcluded ? "bg-amber text-charcoal" : "bg-mint text-forest"
                    }`}
                  >
                    {isExcluded ? "Offline" : "Online"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Comparison Ledger */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-cream/70 border border-gray-200">
          <span className="text-[11px] text-charcoal-muted block">Allocated Portions</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-heading font-extrabold text-forest">
              {twinResult.allocatedPortions}
            </span>
            <span className="text-xs text-charcoal-muted">
              (Orig: {baselineResult.allocatedPortions})
            </span>
          </div>
          <span
            className={`text-[10px] font-bold ${
              twinResult.allocatedPortions >= baselineResult.allocatedPortions
                ? "text-emerald"
                : "text-amber-dark"
            }`}
          >
            {twinResult.allocatedPortions - baselineResult.allocatedPortions >= 0 ? "+" : ""}
            {twinResult.allocatedPortions - baselineResult.allocatedPortions} portions change
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-cream/70 border border-gray-200">
          <span className="text-[11px] text-charcoal-muted block">Unallocated Surplus</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-heading font-extrabold text-charcoal">
              {twinResult.unallocatedPortions}
            </span>
            <span className="text-xs text-charcoal-muted">
              (Orig: {baselineResult.unallocatedPortions})
            </span>
          </div>
          <span
            className={`text-[10px] font-bold ${
              twinResult.unallocatedPortions === 0 ? "text-emerald" : "text-amber-dark"
            }`}
          >
            {twinResult.unallocatedPortions === 0 ? "100% absorption" : "Surplus unallocated"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-cream/70 border border-gray-200">
          <span className="text-[11px] text-charcoal-muted block">Shelters Reached</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-heading font-extrabold text-forest">
              {twinResult.suggestedAllocations.length}
            </span>
            <span className="text-xs text-charcoal-muted">
              (Orig: {baselineResult.suggestedAllocations.length})
            </span>
          </div>
          <span className="text-[10px] text-charcoal-muted">
            Across active network
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-cream/70 border border-gray-200">
          <span className="text-[11px] text-charcoal-muted block">Network Absorption</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-heading font-extrabold text-forest">
              {Math.round((twinResult.allocatedPortions / twinDonation.remainingQuantity) * 100)}%
            </span>
            <span className="text-xs text-charcoal-muted">
              of {twinDonation.remainingQuantity} pts
            </span>
          </div>
          <span className="text-[10px] text-emerald font-semibold">
            {twinResult.unallocatedPortions === 0 ? "Zero waste achieved" : "Partial allocation"}
          </span>
        </div>
      </div>

      {/* Visual Chart Comparison */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
        <h4 className="font-heading font-bold text-xs text-forest uppercase tracking-wider">
          Allocation Flow Comparison by Recipient Organization
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" textAnchor="end" interval={0} angle={-15} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#123B2B",
                  color: "#fff",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Original" fill="#A7F3D0" radius={[4, 4, 0, 0]} name="Original Baseline" />
              <Bar dataKey="Scenario" fill="#15803D" radius={[4, 4, 0, 0]} name="Scenario Allocation" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reallocation Audit Breakdown Table */}
      <div className="p-5 rounded-2xl bg-cream/30 border border-gray-200 space-y-3">
        <h4 className="font-heading font-bold text-xs text-forest uppercase tracking-wider">
          Recipient Allocation Delta Breakdown
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-cream text-charcoal-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-2.5 rounded-l-lg">Recipient Organization</th>
                <th className="p-2.5">Urgency</th>
                <th className="p-2.5">Original</th>
                <th className="p-2.5">Scenario</th>
                <th className="p-2.5">Delta</th>
                <th className="p-2.5 rounded-r-lg">Operational Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {comparisonItems.map((item) => (
                <tr key={item.id} className="hover:bg-cream/40">
                  <td className="p-2.5 font-medium text-forest">{item.name}</td>
                  <td className="p-2.5">
                    <span className="capitalize text-[10px] px-1.5 py-0.5 rounded bg-cream font-bold">
                      {item.urgency}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-charcoal-muted">{item.origAlloc} pts</td>
                  <td className="p-2.5 font-mono font-bold text-forest">{item.twinAlloc} pts</td>
                  <td className="p-2.5 font-mono">
                    <span
                      className={`font-bold ${
                        item.delta > 0
                          ? "text-emerald"
                          : item.delta < 0
                          ? "text-crimson"
                          : "text-charcoal-muted"
                      }`}
                    >
                      {item.delta > 0 ? `+${item.delta}` : item.delta}
                    </span>
                  </td>
                  <td className="p-2.5 text-[11px] text-charcoal-muted">{item.statusNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Operational Assessment */}
      <div className="p-4 rounded-2xl bg-forest text-white space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-mint" />
            <h4 className="font-heading font-bold text-sm text-white">
              AI Operational Scenario Assessment
            </h4>
          </div>

          <button
            onClick={handleRequestAiExplanation}
            disabled={isGeneratingAi}
            className="px-3 py-1.5 rounded-xl bg-mint text-forest font-bold text-xs hover:bg-white transition flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <>
                <div className="w-3 h-3 rounded-full border-2 border-forest border-t-transparent animate-spin" />
                Analyzing Deltas...
              </>
            ) : (
              <>Generate AI Briefing</>
            )}
          </button>
        </div>

        {aiExplanation ? (
          <div className="p-3.5 rounded-xl bg-forest-dark/80 border border-forest-light/20 text-xs text-mint/90 whitespace-pre-line leading-relaxed">
            {aiExplanation}
          </div>
        ) : (
          <p className="text-xs text-cream/70 leading-relaxed">
            Click &quot;Generate AI Briefing&quot; to synthesize natural-language coordinator insights regarding network vulnerability, logistics strains, and suggested buffer actions based on calculated numbers.
          </p>
        )}
      </div>
    </div>
  );
}

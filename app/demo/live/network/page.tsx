"use client";

import React, { useState } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import { NgoCard } from "@/components/demo/NgoCard";
import {
  Building,
  Plus,
  Users,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Power,
  RotateCcw,
  Sliders,
  X,
} from "lucide-react";
import { Recipient, UrgencyLevel } from "@/types";

export default function NgoNetworkPage() {
  const {
    recipients,
    updateRecipientStatus,
    updateRecipientField,
    addCustomRecipient,
    removeRecipient,
    matchResult,
    isPresentationMode,
  } = useDemoSession();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDemand, setNewDemand] = useState(80);
  const [newCapacity, setNewCapacity] = useState(80);
  const [newDistance, setNewDistance] = useState(3.0);
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>("high");

  // Summary Metrics
  const onlineRecipients = recipients.filter((r) => r.isOnline !== false && r.status === "online");
  const totalEligibleCapacity = onlineRecipients.reduce((sum, r) => sum + r.availableCapacity, 0);
  const totalDemand = onlineRecipients.reduce((sum, r) => sum + r.remainingDemand, 0);
  const totalAllocated = matchResult.suggestedAllocations.reduce((sum, a) => sum + a.allocatedPortions, 0);
  const allCandidates = [...matchResult.eligibleMatches, ...matchResult.ineligibleMatches];

  const handleAddNgoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newNgo: Recipient = {
      id: `custom-rec-${Date.now()}`,
      organizationName: newName.trim(),
      organizationType: "ngo",
      contactPerson: "Field Dispatcher",
      phone: "+91-98000-00000",
      location: `Sector ${Math.floor(Math.random() * 40 + 20)}, Noida (${newDistance} km)`,
      latitude: 28.61 + (Math.random() - 0.5) * 0.05,
      longitude: 77.37 + (Math.random() - 0.5) * 0.05,
      manualDistanceKm: newDistance,
      requestedMealPortions: newDemand,
      remainingDemand: newDemand,
      receivingCapacity: newCapacity,
      availableCapacity: newCapacity,
      urgencyLevel: newUrgency,
      acceptedDietaryCategories: ["vegetarian", "non_vegetarian", "vegan", "jain"],
      allergenRestrictions: [],
      storageCapabilities: ["heated", "ambient", "refrigerated"],
      transportAvailability: "self_pickup",
      transportAvailable: true,
      status: "online",
      isOnline: true,
      receivingWindowStart: new Date(Date.now() - 3600000).toISOString(),
      receivingWindowEnd: new Date(Date.now() + 18000000).toISOString(),
      verificationStatus: "simulated_verified",
      isDemo: true,
    };

    addCustomRecipient(newNgo);
    setNewName("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald/15">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-emerald-300 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald" />
            <span>NGO Network Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Control the 6 fictional recipient organizations. Toggle online/offline status, urgency tiers, and capacities with instant redistribution.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald text-white hover:bg-forest transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom NGO</span>
          </button>
        </div>
      </div>

      {/* NETWORK TELEMETRY SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div
          className={`p-3.5 rounded-2xl border transition-colors ${
            isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
          }`}
        >
          <span className="text-charcoal-muted dark:text-slate-400 block mb-1">Active Partners</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {onlineRecipients.length}{" "}
            <span className="text-xs font-normal text-charcoal-muted dark:text-slate-500">
              / {recipients.length} Online
            </span>
          </span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-colors ${
            isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
          }`}
        >
          <span className="text-charcoal-muted dark:text-slate-400 block mb-1">Eligible Capacity</span>
          <span className="text-lg font-black text-forest dark:text-emerald-300">
            {totalEligibleCapacity} portions
          </span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-colors ${
            isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
          }`}
        >
          <span className="text-charcoal-muted dark:text-slate-400 block mb-1">Total Demand</span>
          <span className="text-lg font-black text-forest dark:text-emerald-300">
            {totalDemand} meals
          </span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-colors ${
            isPresentationMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald/15 shadow-sm"
          }`}
        >
          <span className="text-charcoal-muted dark:text-slate-400 block mb-1">Current Allocated</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {totalAllocated} portions
          </span>
        </div>
      </div>

      {/* NON-NEGOTIABLE OFFLINE RULE CALLOUT BANNER */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-charcoal dark:text-slate-300">
          <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold">
            RULE
          </span>
          <span>
            <strong>Non-Negotiable Offline Constraint: </strong>
            Switching an NGO offline strictly guarantees <strong>0 portions</strong> allocated, and uncommitted food is automatically redistributed to remaining online partners.
          </span>
        </div>
      </div>

      {/* GRID OF NGO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recipients.map((recipient) => {
          const matchInfo = allCandidates.find((c) => c.recipient.id === recipient.id);

          return (
            <NgoCard
              key={recipient.id}
              recipient={recipient}
              matchInfo={matchInfo}
              onUpdate={(updated) => {
                // If isOnline changed, trigger updateRecipientStatus to execute automatic redistribution
                const isOnlineChanged = updated.isOnline !== recipient.isOnline;
                if (isOnlineChanged && typeof updated.isOnline === "boolean") {
                  updateRecipientStatus(recipient.id, updated.isOnline);
                } else {
                  // Other field changes (e.g. urgency, demand, capacity)
                  Object.keys(updated).forEach((key) => {
                    const k = key as keyof Recipient;
                    if (updated[k] !== recipient[k]) {
                      updateRecipientField(recipient.id, k, updated[k]);
                    }
                  });
                }
              }}
              onRemove={(id) => removeRecipient(id)}
              isPresentationMode={isPresentationMode}
            />
          );
        })}
      </div>

      {/* ADD CUSTOM NGO MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-forest dark:text-emerald-300 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald" />
                <span>Add Custom Fictional Recipient</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-charcoal-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNgoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seva Sadan Community Kitchen"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
                    Daily Demand
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newDemand}
                    onChange={(e) => setNewDemand(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
                    Receiving Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newCapacity}
                    onChange={(e) =>
                      setNewCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={0.1}
                    value={newDistance}
                    onChange={(e) =>
                      setNewDistance(Math.max(0.1, parseFloat(e.target.value) || 0.1))
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
                    Urgency Level
                  </label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as UrgencyLevel)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white font-medium"
                  >
                    <option value="critical">Critical (100)</option>
                    <option value="high">High (75)</option>
                    <option value="medium">Medium (50)</option>
                    <option value="low">Low (25)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-charcoal dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald hover:bg-forest text-white transition shadow-sm"
                >
                  Save Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

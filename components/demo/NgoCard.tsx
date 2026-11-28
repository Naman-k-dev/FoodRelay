"use client";

import React from "react";
import { Recipient, UrgencyLevel, MatchCandidate } from "@/types";
import {
  Power,
  PowerOff,
  Truck,
  MapPin,
  Users,
  Building2,
  Trash2,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface NgoCardProps {
  recipient: Recipient;
  matchInfo?: MatchCandidate;
  onUpdate: (updated: Recipient) => void;
  onRemove: (id: string) => void;
  isPresentationMode?: boolean;
}

export function NgoCard({
  recipient,
  matchInfo,
  onUpdate,
  onRemove,
  isPresentationMode = false,
}: NgoCardProps) {
  const isOffline =
    recipient.status === "offline" ||
    recipient.status === "unavailable" ||
    recipient.status === "inactive" ||
    recipient.isOnline === false;

  const isTransportUnavailable =
    recipient.transportAvailable === false ||
    recipient.transportAvailability === "unavailable" ||
    recipient.transportAvailability === "none";

  const allocated = matchInfo?.suggestedPortions || 0;

  const handleToggleOnline = () => {
    const nextStatus = isOffline ? "online" : "offline";
    onUpdate({
      ...recipient,
      status: nextStatus,
      isOnline: !isOffline,
    });
  };

  const handleToggleTransport = () => {
    onUpdate({
      ...recipient,
      transportAvailable: isTransportUnavailable,
      transportAvailability: isTransportUnavailable ? "self_pickup" : "unavailable",
    });
  };

  const handleUrgencyChange = (newUrgency: UrgencyLevel) => {
    onUpdate({
      ...recipient,
      urgencyLevel: newUrgency,
    });
  };

  const handleDemandChange = (newVal: number) => {
    const val = Math.max(0, newVal);
    onUpdate({
      ...recipient,
      remainingDemand: val,
      requestedMealPortions: val,
    });
  };

  const handleCapacityChange = (newVal: number) => {
    const val = Math.max(0, newVal);
    onUpdate({
      ...recipient,
      availableCapacity: val,
      receivingCapacity: val,
    });
  };

  const handleDistanceChange = (newVal: number) => {
    const val = Math.max(0.1, newVal);
    onUpdate({
      ...recipient,
      manualDistanceKm: val,
    });
  };

  return (
    <div
      className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
        isOffline
          ? "bg-red-50/40 border-red-200 opacity-80"
          : isTransportUnavailable
          ? "bg-amber-50/40 border-amber-200"
          : allocated > 0
          ? "bg-white border-emerald/40 shadow-elevation"
          : "bg-white border-gray-200 shadow-subtle"
      }`}
    >
      {/* Top Bar: Name, Status Toggle & Remove */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className={`font-heading font-extrabold text-forest ${isPresentationMode ? "text-base" : "text-sm"}`}>
              {recipient.organizationName}
            </h4>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-mint text-forest uppercase">
              Fictional NGO
            </span>
          </div>
          <p className="text-[11px] text-charcoal-muted flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald" />
            <span>{recipient.location}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Online/Offline Toggle */}
          <button
            onClick={handleToggleOnline}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition ${
              isOffline
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-emerald text-white hover:bg-emerald-dark"
            }`}
            title="Click to toggle recipient availability"
          >
            {isOffline ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
            <span>{isOffline ? "Offline" : "Online"}</span>
          </button>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(recipient.id)}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"
            title="Remove NGO from session"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Allocation Status Highlight Box */}
      <div
        className={`p-3 rounded-2xl text-xs flex items-center justify-between ${
          isOffline
            ? "bg-red-100/70 border border-red-300 text-red-800"
            : isTransportUnavailable
            ? "bg-amber-100/70 border border-amber-300 text-amber-900"
            : allocated > 0
            ? "bg-emerald-50 border border-emerald/30 text-emerald-900"
            : "bg-gray-100/70 border border-gray-200 text-charcoal-muted"
        }`}
      >
        <div className="flex items-center gap-2">
          {isOffline ? (
            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          ) : isTransportUnavailable ? (
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          ) : allocated > 0 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}

          <div>
            <span className="font-bold block">
              {isOffline
                ? "Offline (Excluded from Matching)"
                : isTransportUnavailable
                ? "Transport Unavailable (Excluded)"
                : allocated > 0
                ? `Allocated: ${allocated} portions`
                : "Eligible — No surplus allocated"}
            </span>
            <span className="text-[10px] text-charcoal-muted">
              {isOffline
                ? "Hard constraint: offline NGOs receive 0 portions"
                : isTransportUnavailable
                ? "Self-pickup or driver transport required"
                : matchInfo && matchInfo.eligible
                ? `RelayMatch Score: ${matchInfo.score}/100`
                : matchInfo?.ineligibleReasons[0] || "Ineligible"}
            </span>
          </div>
        </div>

        {allocated > 0 && (
          <span className="px-2 py-1 rounded-lg bg-emerald text-white text-xs font-black">
            +{allocated}
          </span>
        )}
      </div>

      {/* Editable Grid Controls */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Urgency Level Dropdown */}
        <div className="space-y-1">
          <label className="font-bold text-charcoal flex items-center gap-1 text-[11px]">
            <span>Urgency Need:</span>
            <span
              title="Urgency represents coordinator-verified hunger vulnerability, not an automated judgment."
              className="cursor-help text-gray-400"
            >
              <HelpCircle className="w-3 h-3" />
            </span>
          </label>
          <select
            value={recipient.urgencyLevel}
            onChange={(e) => handleUrgencyChange(e.target.value as UrgencyLevel)}
            className="w-full p-2 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald/40"
          >
            <option value="critical">Critical (100)</option>
            <option value="high">High (75)</option>
            <option value="medium">Medium (50)</option>
            <option value="low">Low (25)</option>
          </select>
        </div>

        {/* Distance (km) */}
        <div className="space-y-1">
          <label className="font-bold text-charcoal text-[11px]">Distance (km):</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="35"
            value={recipient.manualDistanceKm ?? 2.5}
            onChange={(e) => handleDistanceChange(parseFloat(e.target.value) || 1)}
            className="w-full p-2 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald/40"
          />
        </div>

        {/* Capacity */}
        <div className="space-y-1">
          <label className="font-bold text-charcoal text-[11px]">Capacity (portions):</label>
          <input
            type="number"
            min="0"
            step="10"
            value={recipient.availableCapacity}
            onChange={(e) => handleCapacityChange(parseInt(e.target.value, 10) || 0)}
            className="w-full p-2 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald/40"
          />
        </div>

        {/* Demand */}
        <div className="space-y-1">
          <label className="font-bold text-charcoal text-[11px]">Demand (meals):</label>
          <input
            type="number"
            min="0"
            step="10"
            value={recipient.remainingDemand}
            onChange={(e) => handleDemandChange(parseInt(e.target.value, 10) || 0)}
            className="w-full p-2 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald/40"
          />
        </div>
      </div>

      {/* Transport & Dietary Capability Toggles */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
        {/* Transport Toggle */}
        <button
          onClick={handleToggleTransport}
          className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition ${
            isTransportUnavailable
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-mint text-forest hover:bg-emerald/20"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{isTransportUnavailable ? "No Transport" : "Transport Ready"}</span>
        </button>

        {/* Dietary compatibility tags */}
        <div className="flex items-center gap-1">
          {recipient.acceptedDietaryCategories.map((cat) => (
            <span
              key={cat}
              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cream text-forest border border-emerald/20 uppercase"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

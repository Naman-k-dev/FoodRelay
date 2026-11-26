"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
import { AppShell } from "@/components/layout/AppShell";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import {
  advanceAllocationStatus,
  canTransitionAllocation,
  ALLOWED_TRANSITIONS,
} from "@/lib/dispatch/transitions";
import { formatDateTime } from "@/lib/utils/format";
import { Allocation, AllocationStatus } from "@/types";
import {
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  XCircle,
  FileText,
  QrCode,
  Printer,
  X,
  PackageCheck,
  Building,
  RotateCcw,
} from "lucide-react";

export default function DispatchPage() {
  const {
    isHydrated,
    allocations,
    donations,
    recipients,
    saveAllocation,
    saveDonation,
    saveRecipient,
  } = useFoodRelay();

  const [selectedReceiptAllocation, setSelectedReceiptAllocation] = useState<Allocation | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
        </div>
      </AppShell>
    );
  }

  // Generate QR Code when receipt is opened
  const handleOpenReceipt = async (allocation: Allocation) => {
    setSelectedReceiptAllocation(allocation);
    const qrText =
      allocation.handoverReceipt?.qrData ||
      `FOODRELAY:${allocation.id}:${allocation.allocatedPortions}PORTIONS`;
    try {
      const url = await QRCode.toDataURL(qrText, { width: 160, margin: 1 });
      setQrCodeDataUrl(url);
    } catch (err) {
      console.error("QR Code error:", err);
    }
  };

  // Advance Status Handler
  const handleAdvanceStatus = (allocation: Allocation, nextStatus: AllocationStatus) => {
    const note = prompt(`Enter optional handover note for ${nextStatus}:`, `Progressed to ${nextStatus}`);
    if (note === null) return;

    try {
      const updated = advanceAllocationStatus(
        allocation,
        nextStatus,
        "Simulated Coordinator",
        note || `Status transitioned to ${nextStatus}`
      );
      saveAllocation(updated);
    } catch (err: any) {
      alert(`Transition error: ${err.message}`);
    }
  };

  // Cancel Allocation and Release portions
  const handleCancelAllocation = (allocation: Allocation) => {
    if (allocation.status === "delivered") {
      alert("Delivered allocations cannot be cancelled.");
      return;
    }

    if (!confirm("Are you sure you want to cancel this allocation and release reserved portions?")) {
      return;
    }

    const nowIso = new Date().toISOString();

    // 1. Advance allocation status to cancelled
    const updated = advanceAllocationStatus(
      allocation,
      "cancelled",
      "Coordinator",
      "Allocation cancelled. Reserved portions released back to pool."
    );
    saveAllocation(updated);

    // 2. Return portions to donation remaining balance
    const donation = donations.find((d) => d.id === allocation.donationId);
    if (donation) {
      const newRemaining = donation.remainingQuantity + allocation.allocatedPortions;
      const updatedDonation = {
        ...donation,
        remainingQuantity: newRemaining,
        status: (newRemaining > 0 ? "available" : donation.status) as any,
        updatedAt: nowIso,
        history: [
          ...donation.history,
          {
            id: `hist-${Date.now()}`,
            timestamp: nowIso,
            action: "Reservation Cancelled",
            actor: "Coordinator",
            notes: `Released ${allocation.allocatedPortions} portions back to donation.`,
          },
        ],
      };
      saveDonation(updatedDonation);
    }

    // 3. Return capacity and demand to recipient
    const recipient = recipients.find((r) => r.id === allocation.recipientId);
    if (recipient) {
      const updatedRecipient = {
        ...recipient,
        remainingDemand: recipient.remainingDemand + allocation.allocatedPortions,
        availableCapacity: recipient.availableCapacity + allocation.allocatedPortions,
      };
      saveRecipient(updatedRecipient);
    }
  };

  // Columns for Kanban / Pipeline View
  const pipelineStatuses: AllocationStatus[] = [
    "reserved",
    "accepted",
    "ready_for_pickup",
    "collected",
    "delivered",
  ];

  const filteredAllocations = allocations.filter((a) => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
              Dispatch & Handover Tracking
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Deterministic stage progression from reservation to confirmed delivery with digital receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal-muted">Filter status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-gray-200 text-xs bg-white text-charcoal"
            >
              <option value="all">All Statuses ({allocations.length})</option>
              <option value="reserved">Reserved</option>
              <option value="accepted">Accepted</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="collected">Collected</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Pipeline Columns View */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {pipelineStatuses.map((colStatus) => {
            const inCol = allocations.filter((a) => a.status === colStatus);

            const statusLabelMap: Record<string, string> = {
              reserved: "1. Reserved",
              accepted: "2. Recipient Accepted",
              ready_for_pickup: "3. Ready for Pickup",
              collected: "4. In Transit",
              delivered: "5. Delivered",
            };

            return (
              <div
                key={colStatus}
                className="bg-white/80 rounded-2xl p-3 border border-gray-100 flex flex-col min-w-[220px] shadow-subtle"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-heading font-bold text-xs text-forest">
                    {statusLabelMap[colStatus]}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cream text-charcoal">
                    {inCol.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {inCol.map((item) => {
                    const donation = donations.find((d) => d.id === item.donationId);
                    const recipient = recipients.find((r) => r.id === item.recipientId);
                    const allowedNext = ALLOWED_TRANSITIONS[item.status] || [];

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-subtle hover:border-emerald/40 transition space-y-2.5"
                      >
                        <div className="flex items-start justify-between text-xs">
                          <span className="font-bold text-forest line-clamp-1">
                            {recipient?.organizationName || item.recipientId}
                          </span>
                          <span className="text-[10px] font-bold text-emerald">
                            {item.allocatedPortions} portions
                          </span>
                        </div>

                        <div className="text-[11px] text-charcoal-muted line-clamp-1">
                          From: {donation?.donorName || item.donationId}
                        </div>

                        <div className="text-[10px] text-charcoal-muted flex justify-between pt-1 border-t border-gray-100">
                          <span>Dist: {item.distanceKm} km</span>
                          <span>Score: {item.score}</span>
                        </div>

                        {/* Action buttons based on status */}
                        <div className="pt-2 flex flex-col gap-1.5">
                          {allowedNext
                            .filter((s) => s !== "cancelled")
                            .map((target) => (
                              <button
                                key={target}
                                onClick={() => handleAdvanceStatus(item, target)}
                                className="w-full py-1 px-2 rounded-lg bg-forest hover:bg-forest-light text-white text-[10px] font-semibold transition text-center shadow-subtle capitalize"
                              >
                                Advance to {target.replace("_", " ")} →
                              </button>
                            ))}

                          {item.status === "delivered" && (
                            <button
                              onClick={() => handleOpenReceipt(item)}
                              className="w-full py-1 px-2 rounded-lg bg-mint hover:bg-mint-dark text-forest text-[10px] font-semibold transition text-center flex items-center justify-center gap-1"
                            >
                              <FileText className="w-3 h-3 text-emerald" />
                              View Handover Receipt
                            </button>
                          )}

                          {item.status !== "delivered" && item.status !== "cancelled" && (
                            <button
                              onClick={() => handleCancelAllocation(item)}
                              className="w-full py-0.5 text-[9px] text-crimson hover:underline"
                            >
                              Cancel & Release Portions
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {inCol.length === 0 && (
                    <div className="p-4 text-center text-[11px] text-charcoal-muted border border-dashed border-gray-200 rounded-xl">
                      No active allocations
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Timeline Table View */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-subtle space-y-4">
          <h3 className="font-heading font-bold text-base text-forest">
            All Allocations & Handover Audit Trail ({filteredAllocations.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream text-charcoal-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-lg">Allocation ID</th>
                  <th className="p-3">Donor Entity</th>
                  <th className="p-3">Recipient Organization</th>
                  <th className="p-3">Portions</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Last Updated</th>
                  <th className="p-3 rounded-r-lg text-right">Receipt / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAllocations.map((alloc) => {
                  const donation = donations.find((d) => d.id === alloc.donationId);
                  const recipient = recipients.find((r) => r.id === alloc.recipientId);

                  return (
                    <tr key={alloc.id} className="hover:bg-cream/30">
                      <td className="p-3 font-mono font-medium text-forest">{alloc.id}</td>
                      <td className="p-3 font-semibold text-charcoal">
                        {donation?.donorName || alloc.donationId}
                      </td>
                      <td className="p-3 text-charcoal font-medium">
                        {recipient?.organizationName || alloc.recipientId}
                      </td>
                      <td className="p-3 font-bold text-emerald">
                        {alloc.allocatedPortions} portions
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            alloc.status === "delivered"
                              ? "bg-mint text-forest"
                              : alloc.status === "cancelled"
                              ? "bg-gray-100 text-charcoal-muted"
                              : "bg-amber text-charcoal"
                          }`}
                        >
                          {alloc.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 text-charcoal-muted">{formatDateTime(alloc.updatedAt)}</td>
                      <td className="p-3 text-right">
                        {alloc.status === "delivered" ? (
                          <button
                            onClick={() => handleOpenReceipt(alloc)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-forest bg-mint hover:bg-mint-dark rounded-lg transition inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-emerald" />
                            Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAdvanceStatus(alloc, "delivered")}
                            className="px-2.5 py-1 text-[11px] font-medium text-charcoal bg-cream hover:bg-cream-dark rounded-lg border border-gray-200 transition"
                          >
                            Fast Deliver
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Handover Digital Receipt Modal with QR */}
        {selectedReceiptAllocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-elevation border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-emerald" />
                  <h3 className="font-heading font-bold text-base text-forest">
                    Verified Handover Receipt
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReceiptAllocation(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div id="printable-receipt" className="py-4 space-y-4 text-xs text-charcoal">
                <div className="p-4 rounded-xl bg-cream border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-charcoal-muted uppercase font-bold tracking-wider">
                      Receipt Number
                    </span>
                    <p className="font-mono font-bold text-forest text-sm">
                      {selectedReceiptAllocation.handoverReceipt?.receiptNumber || "FR-REC-10099"}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-mint text-forest uppercase">
                    Delivered & Verified
                  </span>
                </div>

                {/* Details Table */}
                <div className="space-y-2 border-t border-b border-gray-100 py-3">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Allocation ID:</span>
                    <span className="font-mono font-semibold">{selectedReceiptAllocation.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Donation Reference:</span>
                    <span className="font-mono">{selectedReceiptAllocation.donationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Donor Entity:</span>
                    <strong className="text-forest">
                      {donations.find((d) => d.id === selectedReceiptAllocation.donationId)?.donorName ||
                        "Verified Commercial Caterer"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Recipient Organization:</span>
                    <strong className="text-forest">
                      {recipients.find((r) => r.id === selectedReceiptAllocation.recipientId)
                        ?.organizationName || "Verified Shelter"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Confirmed Quantity:</span>
                    <strong className="text-emerald text-sm">
                      {selectedReceiptAllocation.allocatedPortions} Meal Portions
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Completed Timestamp:</span>
                    <span>
                      {formatDateTime(
                        selectedReceiptAllocation.handoverReceipt?.completedAt ||
                          selectedReceiptAllocation.updatedAt
                      )}
                    </span>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-4">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Donation Verification QR"
                      className="w-24 h-24 rounded-lg border border-gray-200 bg-white p-1"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-[10px]">
                      Loading QR...
                    </div>
                  )}
                  <div className="text-[11px] space-y-1">
                    <strong className="text-forest block">Digital Handover Verification</strong>
                    <p className="text-charcoal-muted leading-relaxed">
                      QR contains non-sensitive reference code for audit trails. No private personal
                      data is stored in the QR payload.
                    </p>
                    <span className="font-mono text-[9px] text-gray-500 block truncate">
                      {selectedReceiptAllocation.handoverReceipt?.qrData}
                    </span>
                  </div>
                </div>

                {/* Simulated Signatures */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                  <div className="p-2.5 rounded-lg border border-gray-200 bg-cream/30">
                    <span className="text-charcoal-muted block text-[10px]">Donor Dispatch Lead</span>
                    <span className="font-semibold text-forest">
                      {selectedReceiptAllocation.handoverReceipt?.donorSignature || "Verified Rep"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-gray-200 bg-cream/30">
                    <span className="text-charcoal-muted block text-[10px]">Shelter Receiving Lead</span>
                    <span className="font-semibold text-forest">
                      {selectedReceiptAllocation.handoverReceipt?.recipientSignature ||
                        "Recipient Lead"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-charcoal-muted">
                  FoodRelay Traceability Architecture
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-cream hover:bg-cream-dark text-charcoal rounded-xl text-xs font-semibold border border-gray-200 flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-forest" />
                    Print Receipt
                  </button>
                  <button
                    onClick={() => setSelectedReceiptAllocation(null)}
                    className="px-4 py-1.5 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest-light transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

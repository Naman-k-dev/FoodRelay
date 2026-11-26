"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import { evaluateFoodSafetyGate } from "@/lib/safety/safetyGate";
import { formatDateTime } from "@/lib/utils/format";
import { Donation, SafetyReviewStatus } from "@/types";
import { CommunicationDraftModal } from "@/components/ai/CommunicationDraftModal";
import {
  PackageOpen,
  ShieldCheck,
  ShieldAlert,
  Clock,
  PlusCircle,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GitCompare,
  X,
  FileText,
  Building,
  Search,
  Edit3,
  Ban,
  Eye,
  History,
  MessageSquare,
} from "lucide-react";

const SAFETY_STATUS_LABELS: Record<SafetyReviewStatus, { label: string; color: string }> = {
  incomplete_info: { label: "Needs Information", color: "bg-amber-light text-amber-dark border border-amber/30" },
  awaiting_human_review: { label: "Awaiting Review", color: "bg-amber text-charcoal font-bold" },
  eligible_for_matching: { label: "Eligible for Matching", color: "bg-mint text-forest font-bold" },
  held: { label: "Held", color: "bg-amber-light text-amber-dark border border-amber/40" },
  expired: { label: "Expired", color: "bg-crimson-light text-crimson font-bold" },
  rejected: { label: "Rejected", color: "bg-gray-200 text-charcoal font-bold" },
};

function DonationsContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const { isHydrated, donations, saveDonation } = useFoodRelay();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [draftDonation, setDraftDonation] = useState<Donation | null>(null);
  const [modalTab, setModalTab] = useState<"safety" | "details" | "history">("safety");

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Donation>>({});

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
        </div>
      </AppShell>
    );
  }

  // Filter & Search donations
  const filteredDonations = donations.filter((d) => {
    // 1. Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        d.donorName.toLowerCase().includes(q) ||
        d.foodDescription.toLowerCase().includes(q) ||
        d.pickupLocation.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // 2. Status filter
    if (statusFilter === "all") return true;
    if (statusFilter === "incomplete_info") return d.safetyReviewStatus === "incomplete_info";
    if (statusFilter === "awaiting_human_review") return d.safetyReviewStatus === "awaiting_human_review";
    if (statusFilter === "eligible_for_matching") return d.safetyReviewStatus === "eligible_for_matching";
    if (statusFilter === "held") return d.safetyReviewStatus === "held";
    if (statusFilter === "expired") return d.status === "expired" || d.safetyReviewStatus === "expired";
    if (statusFilter === "rejected") return d.safetyReviewStatus === "rejected";
    if (statusFilter === "delivered") return d.status === "delivered";
    return d.status === statusFilter;
  });

  // Coordinator Approval
  const handleApproveDonation = (donation: Donation) => {
    const nowIso = new Date().toISOString();
    const updated: Donation = {
      ...donation,
      safetyReviewStatus: "eligible_for_matching",
      safetyReviewNotes:
        "Coordinator Inspection: Tamper-evident packaging confirmed. Temperature log compliant with FSSAI Surplus Food Regulations 2019.",
      safetyReviewer: "Coordinator (Simulated)",
      safetyReviewedAt: nowIso,
      status: "available",
      updatedAt: nowIso,
      history: [
        ...donation.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          action: "Simulated Safety Approval",
          actor: "Coordinator (Simulated)",
          notes: "Donation verified and promoted to eligible status.",
        },
      ],
    };
    saveDonation(updated);
    setSelectedDonation(updated);
  };

  // Coordinator Hold
  const handleHoldDonation = (donation: Donation) => {
    const note = prompt("Enter hold reason notes:", "Temperature verification requested from kitchen.");
    if (!note) return;

    const nowIso = new Date().toISOString();
    const updated: Donation = {
      ...donation,
      safetyReviewStatus: "held",
      safetyReviewNotes: `Held by coordinator: ${note}`,
      safetyReviewer: "Coordinator (Simulated)",
      safetyReviewedAt: nowIso,
      status: "awaiting_review",
      updatedAt: nowIso,
      history: [
        ...donation.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          action: "Donation Placed on Hold",
          actor: "Coordinator (Simulated)",
          notes: note,
        },
      ],
    };
    saveDonation(updated);
    setSelectedDonation(updated);
  };

  // Coordinator Reject
  const handleRejectDonation = (donation: Donation) => {
    const note = prompt("Enter rejection reason notes:", "Food does not meet thermal hygiene standards per FSSAI 2019.");
    if (!note) return;

    const nowIso = new Date().toISOString();
    const updated: Donation = {
      ...donation,
      safetyReviewStatus: "rejected",
      safetyReviewNotes: `Rejected by coordinator: ${note}`,
      safetyReviewer: "Coordinator (Simulated)",
      safetyReviewedAt: nowIso,
      status: "cancelled",
      updatedAt: nowIso,
      history: [
        ...donation.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          action: "Donation Rejected",
          actor: "Coordinator (Simulated)",
          notes: note,
        },
      ],
    };
    saveDonation(updated);
    setSelectedDonation(updated);
  };

  // Cancel Donation by Donor/Coordinator
  const handleCancelDonation = (donation: Donation) => {
    if (donation.status === "delivered") {
      alert("Delivered donations cannot be cancelled.");
      return;
    }
    if (!confirm("Are you sure you want to cancel this donation batch?")) return;

    const nowIso = new Date().toISOString();
    const updated: Donation = {
      ...donation,
      status: "cancelled",
      remainingQuantity: 0,
      updatedAt: nowIso,
      history: [
        ...donation.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          action: "Donation Cancelled",
          actor: "Coordinator / Donor",
          notes: "Donation batch was cancelled.",
        },
      ],
    };
    saveDonation(updated);
    if (selectedDonation?.id === donation.id) {
      setSelectedDonation(updated);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (donation: Donation) => {
    setEditingDonation(donation);
    setEditForm({
      ...donation,
      preparedAt: donation.preparedAt ? donation.preparedAt.slice(0, 16) : "",
      pickupWindowStart: donation.pickupWindowStart ? donation.pickupWindowStart.slice(0, 16) : "",
      pickupWindowEnd: donation.pickupWindowEnd ? donation.pickupWindowEnd.slice(0, 16) : "",
      confirmedUseBy: donation.confirmedUseBy ? donation.confirmedUseBy.slice(0, 16) : "",
    });
  };

  // Save Edit Form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonation) return;

    const nowIso = new Date().toISOString();
    const updated: Donation = {
      ...editingDonation,
      donorName: editForm.donorName || editingDonation.donorName,
      foodDescription: editForm.foodDescription || editingDonation.foodDescription,
      quantity: Number(editForm.quantity) || editingDonation.quantity,
      remainingQuantity: Number(editForm.remainingQuantity ?? editForm.quantity ?? editingDonation.remainingQuantity),
      unit: (editForm.unit as any) || editingDonation.unit,
      dietaryCategory: (editForm.dietaryCategory as any) || editingDonation.dietaryCategory,
      foodCategory: (editForm.foodCategory as any) || editingDonation.foodCategory,
      pickupLocation: editForm.pickupLocation || editingDonation.pickupLocation,
      storageMethod: (editForm.storageMethod as any) || editingDonation.storageMethod,
      packagingCondition: (editForm.packagingCondition as any) || editingDonation.packagingCondition,
      handlingInformation: editForm.handlingInformation || editingDonation.handlingInformation,
      preparedAt: editForm.preparedAt ? new Date(editForm.preparedAt).toISOString() : editingDonation.preparedAt,
      pickupWindowEnd: editForm.pickupWindowEnd ? new Date(editForm.pickupWindowEnd).toISOString() : editingDonation.pickupWindowEnd,
      confirmedUseBy: editForm.confirmedUseBy ? new Date(editForm.confirmedUseBy).toISOString() : editingDonation.confirmedUseBy,
      updatedAt: nowIso,
      history: [
        ...editingDonation.history,
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          action: "Donation Details Updated",
          actor: "Coordinator / Donor",
          notes: "Updated record details via management portal.",
        },
      ],
    };

    saveDonation(updated);
    setEditingDonation(null);
    if (selectedDonation?.id === updated.id) {
      setSelectedDonation(updated);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
              Donations & Food Safety Gate
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Deterministic compliance verification, coordinator inspection, and portion management.
            </p>
          </div>

          <Link
            href="/donate"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-forest hover:bg-forest-light text-white shadow-subtle transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-mint" />
            New Donation Intake
          </Link>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-cream border border-emerald/20 text-xs text-charcoal flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>FSSAI 2019 Compliance Disclaimer:</strong> FoodRelay is an AI-assisted
            coordination prototype. In accordance with the *Food Safety and Standards (Recovery and
            Distribution of Surplus Food) Regulations, 2019*, actual surplus food redistribution
            requires qualified human inspection of time-temperature logs and tamper-evident packaging.
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-charcoal-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search donations by donor name, food description, landmark, or ID..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald/40 text-charcoal shadow-subtle"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-2.5 text-xs text-charcoal-muted hover:text-charcoal"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="text-xs font-semibold text-charcoal-muted flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Safety Gate Filter:
            </span>
            {[
              { id: "all", label: "All Records", count: donations.length },
              {
                id: "incomplete_info",
                label: "Needs Information",
                count: donations.filter((d) => d.safetyReviewStatus === "incomplete_info").length,
              },
              {
                id: "awaiting_human_review",
                label: "Awaiting Review",
                count: donations.filter((d) => d.safetyReviewStatus === "awaiting_human_review").length,
              },
              {
                id: "eligible_for_matching",
                label: "Eligible for Matching",
                count: donations.filter((d) => d.safetyReviewStatus === "eligible_for_matching").length,
              },
              {
                id: "held",
                label: "Held",
                count: donations.filter((d) => d.safetyReviewStatus === "held").length,
              },
              {
                id: "expired",
                label: "Expired",
                count: donations.filter((d) => d.status === "expired" || d.safetyReviewStatus === "expired").length,
              },
              {
                id: "rejected",
                label: "Rejected",
                count: donations.filter((d) => d.safetyReviewStatus === "rejected").length,
              },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  statusFilter === f.id
                    ? "bg-forest text-white"
                    : "bg-white text-charcoal-muted hover:bg-cream border border-gray-200"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === f.id ? "bg-white/20 text-white" : "bg-gray-100 text-charcoal"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Donations Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonations.map((d) => {
            const safety = evaluateFoodSafetyGate(d);
            const isHighlighted = d.id === highlightId;
            const badgeMeta = SAFETY_STATUS_LABELS[d.safetyReviewStatus] || {
              label: d.safetyReviewStatus.replace("_", " "),
              color: "bg-gray-100 text-charcoal",
            };

            return (
              <div
                key={d.id}
                className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between shadow-subtle ${
                  isHighlighted ? "ring-2 ring-emerald border-emerald" : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-heading font-bold text-sm text-forest line-clamp-1">
                      {d.donorName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeMeta.color}`}
                    >
                      {badgeMeta.label}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal font-medium line-clamp-2 mb-3">
                    {d.foodDescription}
                  </p>

                  <div className="space-y-1.5 text-xs text-charcoal-muted bg-cream/50 p-3 rounded-xl border border-gray-100 mb-4">
                    <div className="flex justify-between">
                      <span>Portions / Qty:</span>
                      <strong className="text-charcoal">
                        {d.remainingQuantity} / {d.quantity} {d.unit}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Dietary:</span>
                      <span className="capitalize font-medium text-forest">
                        {d.dietaryCategory.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage / Pack:</span>
                      <span className="capitalize">
                        {d.storageMethod} · {d.packagingCondition.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires By:</span>
                      <span className="text-charcoal font-medium">
                        {formatDateTime(d.confirmedUseBy)}
                      </span>
                    </div>
                  </div>

                  {/* Safety Gate Alert if blocked */}
                  {!safety.isEligible && (
                    <div className="p-2.5 rounded-lg bg-amber-light/20 border border-amber/30 text-[11px] text-amber-dark flex items-start gap-1.5 mb-4">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{safety.blockers[0]}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedDonation(d);
                        setModalTab("safety");
                      }}
                      className="px-2.5 py-1.5 font-semibold rounded-lg bg-cream hover:bg-cream-dark text-charcoal border border-gray-200 transition"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleOpenEdit(d)}
                      className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-cream transition"
                      title="Edit Donation"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDraftDonation(d)}
                      className="p-1.5 rounded-lg text-emerald hover:bg-mint/40 transition"
                      title="Draft AI Communication"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    {d.status !== "delivered" && d.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancelDonation(d)}
                        className="p-1.5 rounded-lg text-crimson hover:bg-crimson-light/30 transition"
                        title="Cancel Donation"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {d.safetyReviewStatus === "eligible_for_matching" && d.remainingQuantity > 0 ? (
                    <Link
                      href={`/matches?donationId=${d.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold rounded-lg bg-emerald hover:bg-emerald-dark text-white shadow-subtle transition"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      Match
                    </Link>
                  ) : (
                    <span className="text-[10px] text-charcoal-muted font-medium">
                      {d.remainingQuantity === 0 ? "Allocated" : "Gated"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredDonations.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-2">
            <PackageOpen className="w-10 h-10 text-charcoal-muted mx-auto" />
            <h3 className="font-heading font-bold text-base text-forest">No donations found</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              No donation records match the selected status filter or search query.
            </p>
          </div>
        )}

        {/* Safety Review / Details Modal */}
        {selectedDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-elevation border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-mint rounded-xl text-forest">
                    <ShieldCheck className="w-5 h-5 text-emerald" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-forest">
                      Donation Inspection & Review
                    </h3>
                    <p className="text-xs text-charcoal-muted">
                      ID: {selectedDonation.id} · {selectedDonation.donorName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-gray-200 mt-4 text-xs font-semibold">
                <button
                  onClick={() => setModalTab("safety")}
                  className={`pb-2.5 px-3 border-b-2 transition ${
                    modalTab === "safety"
                      ? "border-forest text-forest"
                      : "border-transparent text-charcoal-muted hover:text-charcoal"
                  }`}
                >
                  Safety Gate Evaluation
                </button>
                <button
                  onClick={() => setModalTab("details")}
                  className={`pb-2.5 px-3 border-b-2 transition ${
                    modalTab === "details"
                      ? "border-forest text-forest"
                      : "border-transparent text-charcoal-muted hover:text-charcoal"
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setModalTab("history")}
                  className={`pb-2.5 px-3 border-b-2 transition ${
                    modalTab === "history"
                      ? "border-forest text-forest"
                      : "border-transparent text-charcoal-muted hover:text-charcoal"
                  }`}
                >
                  Audit History ({selectedDonation.history.length})
                </button>
              </div>

              {/* Tab 1: Safety Gate Evaluation */}
              {modalTab === "safety" && (
                <div className="py-4 space-y-4">
                  {(() => {
                    const evalResult = evaluateFoodSafetyGate(selectedDonation);
                    const badgeMeta = SAFETY_STATUS_LABELS[selectedDonation.safetyReviewStatus];

                    return (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-cream border border-gray-100">
                          <span className="text-xs font-medium text-charcoal">
                            Safety Review Status:
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${badgeMeta?.color}`}
                          >
                            {badgeMeta?.label || selectedDonation.safetyReviewStatus}
                          </span>
                        </div>

                        {evalResult.blockers.length > 0 && (
                          <div className="p-4 rounded-xl bg-crimson-light/30 border border-crimson/30 space-y-2">
                            <span className="text-xs font-bold text-crimson flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-crimson" />
                              Safety & Regulatory Blockers:
                            </span>
                            <ul className="list-disc list-inside text-xs text-charcoal space-y-1">
                              {evalResult.blockers.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {evalResult.regulationReferences.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                            <span className="font-semibold flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-700" />
                              Applicable FSSAI (2019) Regulations:
                            </span>
                            <ul className="list-disc list-inside text-[11px] text-blue-800 space-y-0.5">
                              {evalResult.regulationReferences.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-cream/70 border border-gray-100 text-xs">
                          <span className="text-charcoal-muted block text-[11px] mb-1">
                            Coordinator Review Notes:
                          </span>
                          <p className="text-charcoal">
                            {selectedDonation.safetyReviewNotes || "No notes logged yet."}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                          <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                            Simulated Coordinator Actions (Demo)
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleApproveDonation(selectedDonation)}
                              className="px-4 py-2 bg-emerald hover:bg-emerald-dark text-white rounded-xl text-xs font-semibold shadow-subtle transition flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Simulate Safety Approval (Mark Eligible)
                            </button>
                            <button
                              onClick={() => handleHoldDonation(selectedDonation)}
                              className="px-4 py-2 bg-amber-light text-amber-dark hover:bg-amber-light/80 rounded-xl text-xs font-semibold transition"
                            >
                              Hold for Inspection
                            </button>
                            <button
                              onClick={() => handleRejectDonation(selectedDonation)}
                              className="px-4 py-2 bg-crimson-light text-crimson hover:bg-crimson-light/80 rounded-xl text-xs font-semibold transition"
                            >
                              Reject (Unsafe)
                            </button>
                            {selectedDonation.safetyReviewStatus === "eligible_for_matching" && (
                              <Link
                                href={`/matches?donationId=${selectedDonation.id}`}
                                className="px-4 py-2 bg-forest text-white hover:bg-forest-light rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                              >
                                <GitCompare className="w-4 h-4 text-mint" />
                                Proceed to Match Center
                              </Link>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Tab 2: Full Specifications */}
              {modalTab === "details" && (
                <div className="py-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-cream/70 border border-gray-100">
                      <span className="text-charcoal-muted block text-[11px]">Quantity</span>
                      <strong className="text-forest">
                        {selectedDonation.remainingQuantity} remaining of {selectedDonation.quantity}{" "}
                        {selectedDonation.unit}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-cream/70 border border-gray-100">
                      <span className="text-charcoal-muted block text-[11px]">Dietary Category</span>
                      <strong className="text-forest capitalize">
                        {selectedDonation.dietaryCategory.replace("_", " ")}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-cream/70 border border-gray-100">
                      <span className="text-charcoal-muted block text-[11px]">Storage Method</span>
                      <strong className="text-forest capitalize">
                        {selectedDonation.storageMethod}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-cream/70 border border-gray-100">
                      <span className="text-charcoal-muted block text-[11px]">Packaging Condition</span>
                      <strong className="text-forest capitalize">
                        {selectedDonation.packagingCondition.replace("_", " ")}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-cream/70 border border-gray-100">
                      <span className="text-charcoal-muted block text-[11px]">Prepared Timestamp</span>
                      <strong className="text-forest">
                        {formatDateTime(selectedDonation.preparedAt)}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-cream/70 border border-gray-100">
                      <span className="text-charcoal-muted block text-[11px]">Confirmed Use-By</span>
                      <strong className="text-forest">
                        {formatDateTime(selectedDonation.confirmedUseBy)}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-cream/70 border border-gray-100">
                    <span className="text-charcoal-muted block text-[11px] mb-0.5">Pickup Address:</span>
                    <p className="text-forest font-semibold">{selectedDonation.pickupLocation}</p>
                    <span className="text-[10px] text-charcoal-muted font-mono">
                      Coordinates: {selectedDonation.latitude}, {selectedDonation.longitude}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-cream/70 border border-gray-100">
                    <span className="text-charcoal-muted block text-[11px] mb-0.5">
                      Handling & Thermal Storage Instructions:
                    </span>
                    <p className="text-charcoal">{selectedDonation.handlingInformation}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(selectedDonation)}
                      className="px-4 py-2 rounded-xl bg-cream hover:bg-cream-dark text-charcoal font-semibold border border-gray-200"
                    >
                      Edit Specifications
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Audit History */}
              {modalTab === "history" && (
                <div className="py-4 space-y-3 text-xs">
                  {selectedDonation.history.length === 0 ? (
                    <p className="text-charcoal-muted">No history entries logged.</p>
                  ) : (
                    selectedDonation.history.map((hist) => (
                      <div
                        key={hist.id}
                        className="p-3 rounded-xl bg-cream/50 border border-gray-100 space-y-1"
                      >
                        <div className="flex justify-between font-semibold text-forest">
                          <span>{hist.action}</span>
                          <span className="text-[10px] text-charcoal-muted font-normal">
                            {formatDateTime(hist.timestamp)}
                          </span>
                        </div>
                        <p className="text-charcoal-muted text-[11px]">By: {hist.actor}</p>
                        {hist.notes && <p className="text-charcoal text-[11px]">{hist.notes}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Donation Modal */}
        {editingDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-elevation border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-heading font-bold text-base text-forest">
                  Edit Donation #{editingDonation.id}
                </h3>
                <button
                  onClick={() => setEditingDonation(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="py-4 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">
                    Donor Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.donorName || ""}
                    onChange={(e) => setEditForm({ ...editForm, donorName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal block mb-1">
                    Food Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.foodDescription || ""}
                    onChange={(e) => setEditForm({ ...editForm, foodDescription: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Total Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editForm.quantity || 0}
                      onChange={(e) =>
                        setEditForm({ ...editForm, quantity: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">
                      Remaining Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editForm.remainingQuantity ?? editForm.quantity ?? 0}
                      onChange={(e) =>
                        setEditForm({ ...editForm, remainingQuantity: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Unit *</label>
                    <select
                      value={editForm.unit}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value as any })}
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="portions">Portions (Standard)</option>
                      <option value="kg">Kilograms</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Dietary *</label>
                    <select
                      value={editForm.dietaryCategory}
                      onChange={(e) =>
                        setEditForm({ ...editForm, dietaryCategory: e.target.value as any })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="vegetarian">Vegetarian</option>
                      <option value="non_vegetarian">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="jain">Jain</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-charcoal block mb-1">Pickup Location *</label>
                  <input
                    type="text"
                    required
                    value={editForm.pickupLocation || ""}
                    onChange={(e) => setEditForm({ ...editForm, pickupLocation: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Storage Method</label>
                    <select
                      value={editForm.storageMethod}
                      onChange={(e) =>
                        setEditForm({ ...editForm, storageMethod: e.target.value as any })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="heated">Heated (&gt; 60°C)</option>
                      <option value="refrigerated">Refrigerated (&lt; 5°C)</option>
                      <option value="ambient">Ambient</option>
                      <option value="frozen">Frozen</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Packaging</label>
                    <select
                      value={editForm.packagingCondition}
                      onChange={(e) =>
                        setEditForm({ ...editForm, packagingCondition: e.target.value as any })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="sealed_containers">Sealed Containers</option>
                      <option value="foil_trays">Foil Trays</option>
                      <option value="crates">Crates</option>
                      <option value="loose">Loose (Blocker)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">
                      Confirmed Use-By *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editForm.confirmedUseBy || ""}
                      onChange={(e) => setEditForm({ ...editForm, confirmedUseBy: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">
                      Pickup Window End *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editForm.pickupWindowEnd || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pickupWindowEnd: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-charcoal block mb-1">
                    Handling Instructions
                  </label>
                  <input
                    type="text"
                    value={editForm.handlingInformation || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, handlingInformation: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-200"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDonation(null)}
                    className="px-4 py-2 rounded-xl bg-cream text-charcoal font-semibold border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-semibold shadow-subtle"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Communication Drafter Modal */}
        {draftDonation && (
          <CommunicationDraftModal
            isOpen={!!draftDonation}
            onClose={() => setDraftDonation(null)}
            record={draftDonation}
            defaultPurpose="donor_clarification"
          />
        )}
      </div>
    </AppShell>
  );
}

export default function DonationsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
          </div>
        </AppShell>
      }
    >
      <DonationsContent />
    </Suspense>
  );
}

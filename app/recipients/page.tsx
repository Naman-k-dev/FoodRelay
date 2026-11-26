"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import { Recipient, DietaryCategory, StorageMethod, TransportAvailability, UrgencyLevel, RecipientType } from "@/types";
import { formatDateTime } from "@/lib/utils/format";
import {
  Building2,
  Filter,
  PlusCircle,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Truck,
  Phone,
  User,
  Search,
} from "lucide-react";

export default function RecipientsPage() {
  const { isHydrated, recipients, saveRecipient } = useFoodRelay();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Partial<Recipient>>({
    organizationName: "",
    organizationType: "shelter",
    contactPerson: "",
    phone: "",
    location: "",
    latitude: 28.535,
    longitude: 77.391,
    requestedMealPortions: 60,
    remainingDemand: 60,
    receivingCapacity: 80,
    availableCapacity: 80,
    urgencyLevel: "high",
    acceptedDietaryCategories: ["vegetarian"],
    allergenRestrictions: [],
    storageCapabilities: ["ambient", "refrigerated"],
    transportAvailability: "flexible",
    receivingWindowStart: new Date().toISOString(),
    receivingWindowEnd: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    verificationStatus: "simulated_verified",
    isDemo: true,
  });

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
        </div>
      </AppShell>
    );
  }

  // Filter
  const filteredRecipients = recipients.filter((r) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matches =
        r.organizationName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.contactPerson.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (typeFilter !== "all" && r.organizationType !== typeFilter) return false;
    if (urgencyFilter !== "all" && r.urgencyLevel !== urgencyFilter) return false;
    return true;
  });

  const handleOpenEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setFormData(recipient);
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditingRecipient(null);
    setFormData({
      id: `rec-${Date.now().toString().slice(-4)}`,
      organizationName: "",
      organizationType: "shelter",
      contactPerson: "Volunteer Lead (Simulated)",
      phone: "+91-98110-00099",
      location: "Sector 62, Noida, UP (Fictional)",
      latitude: 28.628,
      longitude: 77.367,
      requestedMealPortions: 50,
      remainingDemand: 50,
      receivingCapacity: 75,
      availableCapacity: 75,
      urgencyLevel: "moderate",
      acceptedDietaryCategories: ["vegetarian"],
      allergenRestrictions: [],
      storageCapabilities: ["ambient", "refrigerated"],
      transportAvailability: "flexible",
      receivingWindowStart: new Date().toISOString(),
      receivingWindowEnd: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      verificationStatus: "simulated_verified",
      isDemo: true,
    });
    setIsCreating(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName || !formData.contactPerson) {
      alert("Organization name and contact person are required.");
      return;
    }

    const recipientToSave: Recipient = {
      ...(formData as Recipient),
      id: editingRecipient ? editingRecipient.id : formData.id || `rec-${Date.now().toString().slice(-4)}`,
      remainingDemand: Number(formData.remainingDemand),
      requestedMealPortions: Number(formData.requestedMealPortions),
      receivingCapacity: Number(formData.receivingCapacity),
      availableCapacity: Number(formData.availableCapacity),
    };

    saveRecipient(recipientToSave);
    setEditingRecipient(null);
    setIsCreating(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
              Recipient Network
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Verified community shelters, orphanages, and kitchens in Greater Noida and Noida.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-forest hover:bg-forest-light text-white shadow-subtle transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-mint" />
            Add Fictional Recipient
          </button>
        </div>

        {/* Fictional Network Disclaimer Callout */}
        <div className="p-3.5 rounded-xl bg-cream border border-emerald/20 text-xs text-charcoal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald flex-shrink-0" />
            <span>
              <strong>Fictional Demonstration Network:</strong> All 6 recipient entities are simulated for
              hackathon testing. Real personal beneficiary data is never recorded.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-mint text-forest px-2 py-0.5 rounded uppercase">
            Noida / Greater Noida
          </span>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-charcoal-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipient shelters, community kitchens, contact person, or location..."
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
              <Filter className="w-3.5 h-3.5" />
              <span>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-gray-200 text-xs bg-white text-charcoal"
              >
                <option value="all">All Types ({recipients.length})</option>
                <option value="shelter">Shelters</option>
                <option value="community_kitchen">Community Kitchens</option>
                <option value="orphanage">Orphanages</option>
                <option value="elderly_care">Elderly Care</option>
                <option value="ngo">NGOs</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
              <span>Urgency:</span>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-gray-200 text-xs bg-white text-charcoal"
              >
                <option value="all">All Urgency Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recipients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipients.map((r) => {
            const urgencyColorMap: Record<string, string> = {
              critical: "bg-crimson text-white",
              high: "bg-amber text-charcoal",
              moderate: "bg-mint text-forest",
              low: "bg-gray-100 text-charcoal-muted",
            };

            return (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-white border border-gray-100 shadow-subtle hover:border-gray-300 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-heading font-bold text-sm text-forest line-clamp-1">
                      {r.organizationName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        urgencyColorMap[r.urgencyLevel] || "bg-gray-100"
                      }`}
                    >
                      {r.urgencyLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-charcoal-muted mb-3">
                    <MapPin className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                    <span className="line-clamp-1">{r.location}</span>
                  </div>

                  {/* Portions & Capacity Box */}
                  <div className="p-3 rounded-xl bg-cream/60 border border-gray-100 space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Portion Demand:</span>
                      <strong className="text-forest">
                        {r.remainingDemand} of {r.requestedMealPortions} needed
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Available Capacity:</span>
                      <strong className="text-forest">
                        {r.availableCapacity} / {r.receivingCapacity} portions
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Dietary Accepted:</span>
                      <span className="capitalize font-medium text-emerald">
                        {r.acceptedDietaryCategories.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Transport:</span>
                      <span className="capitalize">
                        {r.transportAvailability.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Restrictions / Allergens */}
                  {r.allergenRestrictions.length > 0 && (
                    <div className="mb-3 text-[11px] text-amber-dark bg-amber-light/20 p-2 rounded-lg border border-amber/30">
                      Restricts allergens: <strong>{r.allergenRestrictions.join(", ")}</strong>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-charcoal-muted text-[11px] flex items-center gap-1">
                    <User className="w-3 h-3 text-forest" />
                    {r.contactPerson}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="px-3 py-1 font-semibold rounded-lg bg-cream hover:bg-cream-dark text-charcoal border border-gray-200 transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create / Edit Modal */}
        {(isCreating || editingRecipient) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-elevation border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="font-heading font-bold text-lg text-forest">
                  {editingRecipient ? "Edit Recipient" : "Add Fictional Recipient"}
                </h3>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingRecipient(null);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="py-4 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName || ""}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Type *</label>
                    <select
                      value={formData.organizationType}
                      onChange={(e) =>
                        setFormData({ ...formData, organizationType: e.target.value as any })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="shelter">Shelter</option>
                      <option value="community_kitchen">Community Kitchen</option>
                      <option value="orphanage">Orphanage</option>
                      <option value="elderly_care">Elderly Care</option>
                      <option value="ngo">NGO</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Urgency Level *</label>
                    <select
                      value={formData.urgencyLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, urgencyLevel: e.target.value as any })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="moderate">Moderate</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">
                      Portions Needed *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.remainingDemand || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          remainingDemand: Number(e.target.value),
                          requestedMealPortions: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">
                      Receiving Capacity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.availableCapacity || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availableCapacity: Number(e.target.value),
                          receivingCapacity: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-charcoal block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Contact Person</label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson || ""}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Transport</label>
                    <select
                      value={formData.transportAvailability}
                      onChange={(e) =>
                        setFormData({ ...formData, transportAvailability: e.target.value as any })
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="self_pickup">Self Pickup (Shelter collects)</option>
                      <option value="delivery_only">Delivery Only</option>
                      <option value="flexible">Flexible / Volunteer</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingRecipient(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-charcoal font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-semibold shadow-subtle"
                  >
                    Save Recipient
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

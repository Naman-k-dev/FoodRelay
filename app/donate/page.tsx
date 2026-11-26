"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import { ExtractedDraft } from "@/lib/schemas/intake";
import { Donation } from "@/types";
import {
  Sparkles,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Info,
  HelpCircle,
  RotateCcw,
} from "lucide-react";

const SAMPLE_MESSAGES = [
  {
    lang: "English (College Canteen)",
    text: "We have 120 extra vegetarian meal portions from our college canteen in Sector 62, Noida. Prepared at 12 PM and packed in sealed containers. Pickup is available until 2 PM.",
  },
  {
    lang: "Hinglish (Wedding Banquet)",
    text: "Humare wedding banquet hall Sector 63 Noida mein 80 portions paneer sabzi, dal makhani aur roti bachi hai. Sab clean foil trays mein packed hai aur 3:30 PM tak pickup ho sakti hai.",
  },
  {
    lang: "Hindi (Sector 18 Restaurant)",
    text: "हमारे पास सेक्टर 18 नोएडा के रेस्टोरेंट से 50 लोगों का ताजा शाकाहारी भोजन बचा है। भोजन सील पैक डिब्बों में सुरक्षित रखा है। कृपया शाम 4 बजे से पहले उठा लें।",
  },
];

function FieldBadge({ status }: { status: { label: string; color: string } | null }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ml-2 ${status.color}`}>
      {status.label}
    </span>
  );
}

export default function DonatePage() {
  const router = useRouter();
  const { saveDonation } = useFoodRelay();

  // Mode: 'ai' or 'manual'
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");

  // AI Intake State
  const [inputText, setInputText] = useState(SAMPLE_MESSAGES[0].text);
  const [isLoading, setIsLoading] = useState(false);
  const [extractionMeta, setExtractionMeta] = useState<{
    source: string;
    executionTimeMs: number;
    warnings: string[];
  } | null>(null);
  const [extractedDraft, setExtractedDraft] = useState<ExtractedDraft | null>(null);

  // Dates for defaults
  const now = new Date();
  const defaultPrep = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultStart = now.toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultUseBy = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);

  // Track user edits after extraction
  const [editedFields, setEditedFields] = useState<Record<string, boolean>>({});

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setEditedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Helper to determine badge status
  const getFieldStatus = (fieldName: string) => {
    if (!extractedDraft) return null;
    if (editedFields[fieldName]) {
      return { label: "Manually Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    const isAmbiguous = extractedDraft.ambiguousFields?.some((a) =>
      a.toLowerCase().includes(fieldName.toLowerCase())
    );
    if (isAmbiguous) {
      return { label: "Needs Clarification", color: "bg-amber-100 text-amber-800 border-amber-200" };
    }
    const isMissing = extractedDraft.missingFields?.some((m) =>
      m.toLowerCase().includes(fieldName.toLowerCase())
    );
    if (isMissing) {
      return { label: "Missing", color: "bg-gray-100 text-gray-700 border-gray-200" };
    }
    return { label: "Extracted", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  };

  const [formData, setFormData] = useState({
    donorName: "",
    donorType: "restaurant",
    donorContact: "+91-98110-00000",
    foodDescription: "",
    foodCategory: "cooked_meals",
    dietaryCategory: "vegetarian",
    quantity: 100,
    unit: "portions",
    pickupLocation: "Sector 62, Noida, UP",
    latitude: 28.628,
    longitude: 77.367,
    preparedAt: defaultPrep,
    pickupWindowStart: defaultStart,
    pickupWindowEnd: defaultEnd,
    confirmedUseBy: defaultUseBy,
    storageMethod: "heated",
    packagingCondition: "sealed_containers",
    allergenInformation: ["dairy"],
    handlingInformation: "Keep thermal seal closed; maintain temperature above 60°C.",
    sourceVerificationStatus: "verified_license",
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [userConfirmedSafety, setUserConfirmedSafety] = useState(false);

  // Trigger AI Extraction
  const handleRunAiExtraction = async () => {
    if (!inputText.trim() || inputText.length < 5) {
      alert("Please enter a donation message with at least 5 characters.");
      return;
    }

    setIsLoading(true);
    setExtractionMeta(null);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      const draft: ExtractedDraft = data.data;
      setExtractedDraft(draft);
      setExtractionMeta(data.meta);

      // Populate editable form
      setFormData((prev) => ({
        ...prev,
        donorName: draft.donorOrganization || prev.donorName || "Surplus Caterer",
        foodDescription: draft.foodDescription || prev.foodDescription || "Prepared Meal Surplus",
        dietaryCategory: (draft.dietaryCategory as any) || prev.dietaryCategory,
        foodCategory: (draft.foodCategory as any) || prev.foodCategory,
        quantity: draft.quantity || prev.quantity,
        unit: draft.quantityUnit || prev.unit,
        pickupLocation: draft.pickupLocation || prev.pickupLocation,
        storageMethod: (draft.storageMethod as any) || prev.storageMethod,
        packagingCondition: (draft.packagingCondition as any) || prev.packagingCondition,
        allergenInformation: draft.allergens || prev.allergenInformation,
        handlingInformation: draft.handlingInformation || prev.handlingInformation,
      }));
    } catch (err: any) {
      alert(`AI Intake Error: ${err.message || "Failed to parse donation."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Donation to Repository
  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!formData.donorName) errors.push("Donor organization name is required.");
    if (!formData.foodDescription) errors.push("Food description is required.");
    if (formData.quantity <= 0) errors.push("Quantity must be greater than zero.");
    if (!formData.pickupLocation) errors.push("Pickup location is required.");
    if (!userConfirmedSafety) errors.push("You must confirm the safety declaration checkbox.");

    // Validation for unit
    if (formData.unit !== "portions") {
      errors.push(
        `Unit '${formData.unit}' is recorded as non-portion. In order to match immediately, portion conversion must be verified.`
      );
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    const donationId = `don-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    const newDonation: Donation = {
      id: donationId,
      donorName: formData.donorName,
      donorType: formData.donorType as any,
      donorContact: formData.donorContact,
      foodDescription: formData.foodDescription,
      foodCategory: formData.foodCategory as any,
      dietaryCategory: formData.dietaryCategory as any,
      quantity: Number(formData.quantity),
      unit: formData.unit as any,
      remainingQuantity: Number(formData.quantity),
      pickupLocation: formData.pickupLocation,
      latitude: formData.latitude,
      longitude: formData.longitude,
      preparedAt: new Date(formData.preparedAt).toISOString(),
      pickupWindowStart: new Date(formData.pickupWindowStart).toISOString(),
      pickupWindowEnd: new Date(formData.pickupWindowEnd).toISOString(),
      confirmedUseBy: new Date(formData.confirmedUseBy).toISOString(),
      storageMethod: formData.storageMethod as any,
      packagingCondition: formData.packagingCondition as any,
      allergenInformation: formData.allergenInformation,
      handlingInformation: formData.handlingInformation,
      sourceVerificationStatus: formData.sourceVerificationStatus as any,
      safetyReviewStatus: "awaiting_human_review", // Safety Gate holds it for coordinator review
      safetyReviewNotes: "Awaiting coordinator verification of packaging seals and temperature logs.",
      safetyReviewer: null,
      safetyReviewedAt: null,
      status: "awaiting_review",
      createdAt: nowIso,
      updatedAt: nowIso,
      isDemo: false,
      aiExtracted: activeTab === "ai",
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          action: activeTab === "ai" ? "AI Smart Intake Draft Created" : "Manual Intake Created",
          actor: formData.donorName,
          notes: "Donation submitted; routed to human safety review queue.",
        },
      ],
    };

    saveDonation(newDonation);
    router.push(`/donations?highlight=${donationId}`);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
            Donation Intake
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Accept unstructured surplus food messages via multilingual Gemini AI or structured manual form.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === "ai"
                ? "border-forest text-forest"
                : "border-transparent text-charcoal-muted hover:text-charcoal"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald" />
            AI Smart Intake (Multilingual)
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === "manual"
                ? "border-forest text-forest"
                : "border-transparent text-charcoal-muted hover:text-charcoal"
            }`}
          >
            <Edit3 className="w-4 h-4 text-forest" />
            Manual Structured Entry
          </button>
        </div>

        {/* Mode 1: AI Smart Intake Area */}
        {activeTab === "ai" && (
          <div className="p-6 rounded-2xl bg-white border border-emerald/20 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Natural Language Extraction
              </span>
              <span className="text-[11px] text-charcoal-muted">
                English · Hindi · Hinglish
              </span>
            </div>

            {/* Live Model Badge */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-forest-dark text-mint text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-light"></span>
                </span>
                <span className="font-semibold text-white">Configured Model:</span>
                <span className="font-mono text-mint font-bold">gemini-3.5-flash-lite</span>
              </div>
              <span className="text-[10px] text-cream/70 uppercase tracking-wider font-semibold">
                Official Google GenAI SDK
              </span>
            </div>

            {/* Privacy Caution Warning */}
            <div className="p-3 rounded-xl bg-amber-light/20 border border-amber/30 text-xs text-charcoal flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-dark">Privacy & Safety Guard:</span> Do not
                paste Aadhaar/ID numbers, personal phone numbers, or private addresses into the AI input.
                Messages are processed server-side as untrusted text.
              </div>
            </div>

            {/* Quick Sample Selector */}
            <div>
              <label className="text-xs font-semibold text-forest mb-1.5 block">
                Load Quick Sample Scenarios:
              </label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_MESSAGES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(s.text)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-cream hover:bg-cream-dark border border-gray-200 text-charcoal font-medium transition"
                  >
                    ✦ {s.lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste donor message here (e.g., We have 120 extra vegetarian meal portions from our canteen in Sector 62, Noida...)"
                className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-cream/30 text-charcoal"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-charcoal-muted">
                {inputText.length} / 2000 characters
              </span>
              <button
                type="button"
                onClick={handleRunAiExtraction}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs sm:text-sm font-semibold transition disabled:opacity-50 shadow-subtle"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                    Extracting via Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-mint" />
                    Extract Entities & Populate Review
                  </>
                )}
              </button>
            </div>

            {/* Extraction Metadata Pill */}
            {extractionMeta && (
              <div className="p-3 rounded-xl bg-mint/50 border border-emerald/20 text-xs text-forest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald" />
                  <span>
                    Extracted via <strong>{extractionMeta.source}</strong> in{" "}
                    {extractionMeta.executionTimeMs} ms
                  </span>
                </div>
                {extractionMeta.warnings.length > 0 && (
                  <span className="text-[10px] text-amber-dark font-medium">
                    {extractionMeta.warnings[0]}
                  </span>
                )}
              </div>
            )}

            {/* Extracted Follow-up Questions / Ambiguities */}
            {extractedDraft && (
              <div className="space-y-3 pt-2">
                {extractedDraft.followUpQuestions.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      Suggested Clarifications:
                    </div>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 text-blue-800">
                      {extractedDraft.followUpQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form Errors Box */}
        {formErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-crimson-light/40 border border-crimson/30 text-crimson text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-crimson" />
              Please correct the following before saving:
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {formErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Editable Review & Confirmation Form */}
        <form onSubmit={handleSubmitDonation} className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-subtle space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-heading font-bold text-base text-forest">
                Donation Details (Verification Review)
              </h3>
              <span className="text-xs text-charcoal-muted">
                Editable · Requires explicit human approval
              </span>
            </div>

            {/* Row 1: Donor & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Donor Organization Name *</span>
                  <FieldBadge status={getFieldStatus("donorOrganization")} />
                </label>
                <input
                  type="text"
                  required
                  value={formData.donorName}
                  onChange={(e) => handleFieldChange("donorName", e.target.value)}
                  placeholder="e.g., Grand Hyatt Banquet or College Canteen"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Donor Entity Type *</span>
                  <FieldBadge status={getFieldStatus("donorType")} />
                </label>
                <select
                  value={formData.donorType}
                  onChange={(e) => handleFieldChange("donorType", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
                >
                  <option value="restaurant">Restaurant / Bistro</option>
                  <option value="hostel">Hostel / University Mess</option>
                  <option value="wedding_venue">Wedding Banquet Venue</option>
                  <option value="corporate_cafeteria">Corporate Cafeteria</option>
                  <option value="event_organizer">Event / Conference Organizer</option>
                  <option value="community">Community / Religious Institution</option>
                </select>
              </div>
            </div>

            {/* Row 2: Food Description & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Food Description *</span>
                  <FieldBadge status={getFieldStatus("foodDescription")} />
                </label>
                <input
                  type="text"
                  required
                  value={formData.foodDescription}
                  onChange={(e) => handleFieldChange("foodDescription", e.target.value)}
                  placeholder="e.g., Dal makhani, paneer butter masala, steamed rice"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Dietary Category *</span>
                  <FieldBadge status={getFieldStatus("dietaryCategory")} />
                </label>
                <select
                  value={formData.dietaryCategory}
                  onChange={(e) => handleFieldChange("dietaryCategory", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
                >
                  <option value="vegetarian">Vegetarian (Shakahari)</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="jain">Jain (No Root Veg)</option>
                </select>
              </div>
            </div>

            {/* Row 3: Quantity & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Quantity *</span>
                  <FieldBadge status={getFieldStatus("quantity")} />
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => handleFieldChange("quantity", Number(e.target.value))}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Quantity Unit *</span>
                  <FieldBadge status={getFieldStatus("quantityUnit")} />
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleFieldChange("unit", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
                >
                  <option value="portions">Portions (Standard for Matching)</option>
                  <option value="kg">Kilograms (Requires Conversion)</option>
                  <option value="liters">Liters</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Food Category *</span>
                  <FieldBadge status={getFieldStatus("foodCategory")} />
                </label>
                <select
                  value={formData.foodCategory}
                  onChange={(e) => handleFieldChange("foodCategory", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
                >
                  <option value="cooked_meals">Cooked Meals (Hot/Prepared)</option>
                  <option value="packaged_groceries">Packaged Groceries</option>
                  <option value="bakery">Bakery & Bread</option>
                  <option value="fresh_produce">Fresh Produce</option>
                  <option value="dairy">Dairy Products</option>
                </select>
              </div>
            </div>

            {/* Row 4: Pickup Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Pickup Location / Landmark *</span>
                  <FieldBadge status={getFieldStatus("pickupLocation")} />
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickupLocation}
                  onChange={(e) => handleFieldChange("pickupLocation", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 block">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.donorContact}
                  onChange={(e) => handleFieldChange("donorContact", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>
            </div>

            {/* Row 5: Packaging & Storage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Packaging Condition *</span>
                  <FieldBadge status={getFieldStatus("packagingCondition")} />
                </label>
                <select
                  value={formData.packagingCondition}
                  onChange={(e) => handleFieldChange("packagingCondition", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
                >
                  <option value="sealed_containers">Sealed Food-Grade Containers (Approved)</option>
                  <option value="foil_trays">Covered Foil Trays</option>
                  <option value="crates">Covered Crates</option>
                  <option value="loose">Loose (Safety Gate Blocker)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Storage Temperature / Method *</span>
                  <FieldBadge status={getFieldStatus("storageMethod")} />
                </label>
                <select
                  value={formData.storageMethod}
                  onChange={(e) => handleFieldChange("storageMethod", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
                >
                  <option value="heated">Heated / Insulated (&gt; 60°C)</option>
                  <option value="refrigerated">Refrigerated / Chilled (&lt; 5°C)</option>
                  <option value="ambient">Ambient Room Temperature</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>
            </div>

            {/* Row 6: Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Prepared At *</span>
                  <FieldBadge status={getFieldStatus("preparedAt")} />
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.preparedAt}
                  onChange={(e) => handleFieldChange("preparedAt", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Pickup Window End *</span>
                  <FieldBadge status={getFieldStatus("pickupWindow")} />
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.pickupWindowEnd}
                  onChange={(e) => handleFieldChange("pickupWindowEnd", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                  <span>Confirmed Use-By Time *</span>
                  <FieldBadge status={getFieldStatus("useByTime")} />
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.confirmedUseBy}
                  onChange={(e) => handleFieldChange("confirmedUseBy", e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>
            </div>

            {/* Row 7: Handling Notes */}
            <div>
              <label className="text-xs font-semibold text-charcoal mb-1 flex items-center">
                <span>Handling & Temperature Instructions *</span>
                <FieldBadge status={getFieldStatus("handlingInformation")} />
              </label>
              <input
                type="text"
                required
                value={formData.handlingInformation}
                onChange={(e) => handleFieldChange("handlingInformation", e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
            </div>

            {/* Explicit Confirmation Gate */}
            <div className="pt-3 border-t border-gray-100">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userConfirmedSafety}
                  onChange={(e) => setUserConfirmedSafety(e.target.checked)}
                  className="mt-0.5 rounded text-emerald focus:ring-emerald/40 h-4 w-4"
                />
                <span className="text-xs text-charcoal leading-relaxed">
                  I confirm that all extracted details have been reviewed and verified. This donation
                  will be placed in the <strong>Awaiting Human Safety Review</strong> queue for
                  coordinator inspection before allocation.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/donations")}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-white border border-gray-200 text-charcoal hover:bg-cream transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-forest hover:bg-forest-light text-white shadow-subtle transition"
            >
              Save Donation to Safety Queue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

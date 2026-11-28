"use client";

import React, { useState } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  MapPin,
  Clock,
  Layers,
  FileText,
  RotateCcw,
} from "lucide-react";
import {
  DietaryCategory,
  FoodCategory,
  PackagingCondition,
  QuantityUnit,
  StorageMethod,
} from "@/types";

const SAMPLE_CHIPS = [
  "Our college canteen has 180 packed vegetarian thalis with dal, rice, and roti in Sector 62 Noida.",
  "We have 375 plates of paneer pulao left from a college event in Sector 59.",
  "Restaurant mein 150 rajma chawal aur 75 packed thali extra hain.",
  "We have 90 portions of pasta and 120 sandwiches available for immediate pickup.",
  "Hamare wedding banquet mein 250 portions vegetarian biryani extra hai.",
  "We have 100 packets of poha and 200 sealed juice bottles.",
];

const QUANTITY_PRESETS = [50, 100, 180, 250, 500, 1000];

export default function IntakePage() {
  const { donation, updateDonation, updateDonationField, isPresentationMode } = useDemoSession();

  const [inputMessage, setInputMessage] = useState(
    "Our college canteen has 180 packed vegetarian thalis with dal, rice, and roti in sealed containers in Sector 62 Noida."
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [unrelatedWarning, setUnrelatedWarning] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<Array<{ name: string; quantity: number; unit: string }>>([]);
  const [extractionMeta, setExtractionMeta] = useState<{ source: string; executionTimeMs: number } | null>(null);

  // Trigger Gemini AI or Fallback Extraction
  const handleExtract = async () => {
    if (!inputMessage.trim()) return;
    setIsExtracting(true);
    setUnrelatedWarning(null);
    setExtractionMeta(null);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Extraction failed");

      const draft = json.data;

      // Check non-food warning
      if (draft.isFoodRelated === false) {
        setUnrelatedWarning(
          draft.unrelatedExplanation ||
            "This message does not appear to describe surplus food. Please specify the meal type, portions, and location."
        );
        setIsExtracting(false);
        return;
      }

      // Check multi-items
      if (Array.isArray(draft.foodItems) && draft.foodItems.length > 0) {
        setParsedItems(draft.foodItems);
      } else {
        setParsedItems([]);
      }

      // Populate authoritative donation state
      updateDonation((prev) => ({
        ...prev,
        foodDescription: draft.foodDescription || prev.foodDescription,
        donorName: draft.donorOrganization || prev.donorName,
        quantity: typeof draft.quantity === "number" && draft.quantity > 0 ? draft.quantity : prev.quantity,
        remainingQuantity: typeof draft.quantity === "number" && draft.quantity > 0 ? draft.quantity : prev.remainingQuantity,
        unit: (draft.quantityUnit as QuantityUnit) || prev.unit,
        dietaryCategory: (draft.dietaryCategory as DietaryCategory) || prev.dietaryCategory,
        foodCategory: (draft.foodCategory as FoodCategory) || prev.foodCategory,
        storageMethod: (draft.storageMethod as StorageMethod) || prev.storageMethod,
        packagingCondition: (draft.packagingCondition as PackagingCondition) || prev.packagingCondition,
        pickupLocation: draft.pickupLocation || prev.pickupLocation,
        allergenInformation: draft.allergens || prev.allergenInformation,
      }));

      setExtractionMeta({
        source: json.meta?.source || "gemini",
        executionTimeMs: json.meta?.executionTimeMs || 120,
      });
    } catch (err: any) {
      console.warn("AI extraction fallback engaged:", err);
      // Fallback: simple regex quantity extraction
      const qtyMatch = inputMessage.match(/(\d+)\s*(portions?|plates?|meals?|thalis?|kg|boxes?)/i);
      if (qtyMatch) {
        const q = parseInt(qtyMatch[1], 10);
        updateDonation((prev) => ({
          ...prev,
          quantity: q,
          remainingQuantity: q,
          foodDescription: inputMessage,
        }));
      }
      setExtractionMeta({ source: "deterministic_fallback", executionTimeMs: 15 });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald/15">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-emerald-300 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald" />
            <span>Donation Intake & Unconstrained NLP</span>
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Accept any natural language message in English, Hindi, or Hinglish. Extract or edit portions and metadata.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
            Current: {donation.quantity} {donation.unit}
          </span>
        </div>
      </div>

      {/* SECTION 1: NATURAL LANGUAGE INPUT & GEMINI AI TRIGGER */}
      <div
        className={`p-5 rounded-2xl border transition-colors ${
          isPresentationMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-emerald/15 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-slate-400 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-emerald" />
            <span>Natural-Language Donation Message</span>
          </label>
          {extractionMeta && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Processed via {extractionMeta.source} in {extractionMeta.executionTimeMs} ms
            </span>
          )}
        </div>

        <textarea
          rows={3}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Paste or type any donation message in English, Hindi, or Hinglish..."
          className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald/40 focus:border-emerald outline-none transition"
        />

        {/* Quick Sample Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-bold text-charcoal-muted dark:text-slate-400 mr-1">
            Try Sample:
          </span>
          {SAMPLE_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputMessage(chip);
                setUnrelatedWarning(null);
              }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald hover:text-emerald bg-white dark:bg-slate-900 text-charcoal dark:text-slate-300 transition"
            >
              &quot;{chip.slice(0, 38)}...&quot;
            </button>
          ))}
        </div>

        {/* Extraction Button & Warnings */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleExtract}
            disabled={isExtracting || !inputMessage.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald text-white hover:bg-forest disabled:opacity-50 transition shadow-sm"
          >
            {isExtracting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extracting with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Details with AI</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMessage("");
              setUnrelatedWarning(null);
            }}
            className="text-xs text-charcoal-muted dark:text-slate-400 hover:text-charcoal dark:hover:text-white flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>
        </div>

        {/* Non-Food Intent Warning */}
        {unrelatedWarning && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">Non-Food Input Detected: </span>
              <span>{unrelatedWarning}</span>
            </div>
          </div>
        )}

        {/* Multi-Item Breakdown */}
        {parsedItems.length > 1 && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1 animate-in fade-in">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Multi-Item Surplus Breakdown Extracted:</span>
            </div>
            <ul className="list-disc pl-5 text-emerald-900 dark:text-emerald-200">
              {parsedItems.map((item, i) => (
                <li key={i}>
                  <span className="font-semibold">{item.name}</span>: {item.quantity} {item.unit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SECTION 2: EDITABLE STRUCTURED DONATION DETAILS */}
      <div
        className={`p-5 rounded-2xl border transition-colors ${
          isPresentationMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-emerald/15 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-forest dark:text-emerald-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald" />
            <span>Editable Structured Donation Record</span>
          </h3>
          <span className="text-xs text-charcoal-muted dark:text-slate-400">
            Changes automatically propagate to downstream matching and local storage
          </span>
        </div>

        {/* Quantity Controls & Stepper */}
        <div className="mb-6 p-4 rounded-xl bg-surface-cream dark:bg-slate-950 border border-emerald/20">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-slate-400 mb-2">
            Surplus Quantity Controls
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  updateDonationField("quantity", Math.max(10, donation.quantity - 50))
                }
                className="px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Subtract 50 portions"
              >
                -50
              </button>
              <button
                type="button"
                onClick={() =>
                  updateDonationField("quantity", Math.max(10, donation.quantity - 10))
                }
                className="px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Subtract 10 portions"
              >
                -10
              </button>
              <input
                type="number"
                min={1}
                value={donation.quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 0) {
                    updateDonationField("quantity", val);
                  }
                }}
                className="w-24 text-center font-black text-lg p-1.5 rounded-lg border border-emerald/40 bg-white dark:bg-slate-900 text-forest dark:text-emerald-300 outline-none"
              />
              <button
                type="button"
                onClick={() => updateDonationField("quantity", donation.quantity + 10)}
                className="px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Add 10 portions"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => updateDonationField("quantity", donation.quantity + 50)}
                className="px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Add 50 portions"
              >
                +50
              </button>
            </div>

            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-charcoal-muted dark:text-slate-400">
                Presets:
              </span>
              {QUANTITY_PRESETS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => updateDonationField("quantity", q)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    donation.quantity === q
                      ? "bg-emerald text-white shadow-sm"
                      : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-charcoal dark:text-slate-200 hover:border-emerald"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid of Editable Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
              Donor Organization Name
            </label>
            <input
              type="text"
              value={donation.donorName}
              onChange={(e) => updateDonationField("donorName", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
              Dietary Category
            </label>
            <select
              value={donation.dietaryCategory}
              onChange={(e) =>
                updateDonationField("dietaryCategory", e.target.value as DietaryCategory)
              }
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white font-medium"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="jain">Jain</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
              Food Category
            </label>
            <select
              value={donation.foodCategory}
              onChange={(e) =>
                updateDonationField("foodCategory", e.target.value as FoodCategory)
              }
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white font-medium"
            >
              <option value="cooked_meals">Cooked Meals</option>
              <option value="packaged_groceries">Packaged Groceries</option>
              <option value="bakery">Bakery</option>
              <option value="fresh_produce">Fresh Produce</option>
              <option value="dairy">Dairy</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
              Packaging Condition
            </label>
            <select
              value={donation.packagingCondition}
              onChange={(e) =>
                updateDonationField("packagingCondition", e.target.value as PackagingCondition)
              }
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white font-medium"
            >
              <option value="sealed_containers">Sealed Containers (FSSAI Compliant)</option>
              <option value="foil_trays">Foil Trays</option>
              <option value="crates">Crates</option>
              <option value="loose">Loose (Requires Safety Review)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
              Storage Method
            </label>
            <select
              value={donation.storageMethod}
              onChange={(e) =>
                updateDonationField("storageMethod", e.target.value as StorageMethod)
              }
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white font-medium"
            >
              <option value="heated">Heated (&gt; 65°C Hot Holding)</option>
              <option value="ambient">Ambient</option>
              <option value="refrigerated">Refrigerated (&lt; 4°C)</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
              Pickup Location
            </label>
            <input
              type="text"
              value={donation.pickupLocation}
              onChange={(e) => updateDonationField("pickupLocation", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-semibold mb-1 text-charcoal-muted dark:text-slate-400">
              Food Item Description
            </label>
            <input
              type="text"
              value={donation.foodDescription}
              onChange={(e) => updateDonationField("foodDescription", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-surface-cream dark:bg-slate-950 text-charcoal dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

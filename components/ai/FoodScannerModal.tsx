"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Image as ImageIcon,
} from "lucide-react";
import { ScannerResult } from "@/lib/schemas/scanner";

interface FoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyObservations: (result: ScannerResult) => void;
}

// Lightweight embedded sample photo (SVG data URL representing hot catering trays)
const SAMPLE_IMAGE_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#123B2B"/>
  <rect x="50" y="60" width="220" height="260" rx="16" fill="#15803D" stroke="#DCFCE7" stroke-width="4"/>
  <rect x="330" y="60" width="220" height="260" rx="16" fill="#15803D" stroke="#DCFCE7" stroke-width="4"/>
  <text x="160" y="180" font-family="sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">HOT VEG MEALS</text>
  <text x="160" y="210" font-family="sans-serif" font-size="14" fill="#DCFCE7" text-anchor="middle">Sealed Cambro Tray 1</text>
  <text x="440" y="180" font-family="sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">PANEER & RICE</text>
  <text x="440" y="210" font-family="sans-serif" font-size="14" fill="#DCFCE7" text-anchor="middle">Sealed Cambro Tray 2</text>
  <circle cx="300" cy="360" r="16" fill="#D97706"/>
  <text x="300" y="365" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">60°C</text>
</svg>`);

export function FoodScannerModal({
  isOpen,
  onClose,
  onApplyObservations,
}: FoodScannerModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [notes, setNotes] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScannerResult | null>(null);
  const [scanMeta, setScanMeta] = useState<{ source: string; executionTimeMs: number } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be under 5 MB.");
      return;
    }

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = () => {
    setImagePreview(SAMPLE_IMAGE_DATA_URL);
    setImageMime("image/svg+xml");
    setScanResult(null);
  };

  const handleRunScan = async () => {
    if (!imagePreview) return;
    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageMime,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scanner request failed");

      setScanResult(data.data);
      setScanMeta(data.meta);
    } catch (err: any) {
      alert(`Food Scanner Error: ${err.message || "Failed to analyze image."}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = () => {
    if (scanResult) {
      onApplyObservations(scanResult);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-elevation border border-gray-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-mint rounded-2xl text-forest">
              <Camera className="w-5 h-5 text-emerald" aria-hidden="true" />
            </div>
            <div>
              <h3 id="scanner-modal-title" className="font-heading font-extrabold text-lg text-forest">
                AI Food Donation Scanner
              </h3>
              <p className="text-xs text-charcoal-muted">
                Multimodal inspection of food containers, packaging, and visible labels
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Safety Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-light/20 border border-amber/30 text-xs text-charcoal flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-dark block font-heading">
              Non-Negotiable Food Safety Boundary
            </strong>
            <p className="text-[11px] leading-relaxed text-charcoal-muted">
              Visual inspection identifies packaging type and visible dishes. It{" "}
              <strong>CANNOT certify food safety, freshness, or microbial quality</strong>. Human
              coordinator inspection remains strictly mandatory per FSSAI 2019 guidelines.
            </p>
          </div>
        </div>

        {/* Upload & Preview Workspace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {/* Left: Upload Box */}
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-emerald/50 rounded-2xl p-6 text-center cursor-pointer transition bg-cream/40 flex flex-col items-center justify-center h-48"
            >
              <Upload className="w-8 h-8 text-forest mb-2" />
              <span className="text-xs font-semibold text-forest">Click or Drag Image Here</span>
              <span className="text-[10px] text-charcoal-muted mt-1">JPEG, PNG, WebP up to 5 MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load 1-Click Demo Sample Photo
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setScanResult(null);
                  }}
                  className="text-xs text-crimson hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Optional donor notes (e.g. heated trays from banquet)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
            </div>

            <button
              type="button"
              onClick={handleRunScan}
              disabled={!imagePreview || isScanning}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition disabled:opacity-50 shadow-subtle"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  Analyzing Image via Gemini...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-mint" />
                  Analyze Food Photograph
                </>
              )}
            </button>
          </div>

          {/* Right: Preview & Observations */}
          <div className="space-y-3">
            <div className="h-48 rounded-2xl bg-forest-dark/80 border border-gray-200 overflow-hidden flex items-center justify-center relative">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Food Donation Preview"
                  width={400}
                  height={192}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-cream/60">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-mint/60" />
                  <span className="text-xs">No image selected</span>
                </div>
              )}
              {scanMeta && (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-forest text-mint border border-emerald/30">
                  {scanMeta.source} · {scanMeta.executionTimeMs}ms
                </span>
              )}
            </div>

            {/* Structured Findings */}
            {scanResult && (
              <div className="p-4 rounded-2xl bg-cream border border-emerald/20 text-xs space-y-2 max-h-56 overflow-y-auto">
                <div className="font-bold text-forest flex items-center justify-between">
                  <span>Visual Observations</span>
                  <span className="text-[10px] text-emerald bg-mint px-2 py-0.5 rounded font-bold uppercase">
                    {scanResult.estimatedFoodCategory}
                  </span>
                </div>

                <div>
                  <strong className="text-charcoal block text-[11px]">Visible Items:</strong>
                  <span className="text-charcoal-muted">
                    {scanResult.visibleFoodItems.join(", ") || "General meal portions"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <strong className="text-charcoal block">Packaging:</strong>
                    <span className="text-emerald font-semibold capitalize">
                      {scanResult.visiblePackaging.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <strong className="text-charcoal block">Condition:</strong>
                    <span className="text-charcoal-muted capitalize">
                      {scanResult.containerCondition.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {scanResult.clarificationQuestions.length > 0 && (
                  <div>
                    <strong className="text-amber-dark block text-[11px] flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-amber" />
                      Suggested Clarifications:
                    </strong>
                    <ul className="list-disc list-inside text-[10px] text-charcoal-muted space-y-0.5 mt-0.5">
                      {scanResult.clarificationQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal bg-white border border-gray-200 hover:bg-cream transition"
          >
            Cancel
          </button>
          {scanResult && (
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition"
            >
              <CheckCircle2 className="w-4 h-4 text-mint" />
              Use Observations to Populate Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

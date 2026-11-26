"use client";

import React, { useState } from "react";
import { MessageSquare, Copy, Check, X, Sparkles } from "lucide-react";
import { CommunicationDraftResult } from "@/lib/schemas/drafts";

interface CommunicationDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  defaultPurpose?: string;
}

export function CommunicationDraftModal({
  isOpen,
  onClose,
  record,
  defaultPurpose = "donor_clarification",
}: CommunicationDraftModalProps) {
  const [purpose, setPurpose] = useState(defaultPurpose);
  const [language, setLanguage] = useState<"english" | "hindi">("english");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<CommunicationDraftResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setDraft(null);

    try {
      const res = await fetch("/api/draft-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose,
          language,
          record,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate draft message");

      setDraft(data.data);
    } catch (err: any) {
      alert(`Message Drafter Error: ${err.message || "Failed to draft message."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-elevation border border-gray-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-mint rounded-2xl text-forest">
              <MessageSquare className="w-5 h-5 text-emerald" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-forest">
                AI Logistics Message Drafter
              </h3>
              <p className="text-xs text-charcoal-muted">
                One-click communication templates for donors and recipient NGOs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-charcoal mb-1 block">Message Purpose:</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
            >
              <option value="donor_clarification">Donor Clarification (Packaging / Expiry)</option>
              <option value="recipient_coordination">Recipient Pickup Schedule Notification</option>
              <option value="handover_reminder">Handover Verification Reminder</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-semibold text-charcoal">Language:</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage("english")}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  language === "english"
                    ? "bg-forest text-white"
                    : "bg-cream text-charcoal hover:bg-cream-dark"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hindi")}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  language === "hindi"
                    ? "bg-forest text-white"
                    : "bg-cream text-charcoal hover:bg-cream-dark"
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white font-bold transition disabled:opacity-50 shadow-subtle"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                Drafting Message via Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-mint" />
                Draft Communication Message
              </>
            )}
          </button>
        </div>

        {/* Draft Display */}
        {draft && (
          <div className="p-4 rounded-2xl bg-cream border border-emerald/20 text-xs space-y-2">
            <div>
              <span className="text-[10px] text-charcoal-muted font-bold uppercase block">
                Subject:
              </span>
              <strong className="text-forest font-heading">{draft.subject}</strong>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-muted font-bold uppercase block">
                Body:
              </span>
              <p className="text-charcoal whitespace-pre-wrap leading-relaxed mt-0.5">
                {draft.body}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald hover:bg-emerald-dark text-white font-semibold transition"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Message
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-charcoal-muted">
          <span>Manual copy-only · No automatic SMS/Email sent</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-cream hover:bg-cream-dark text-charcoal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

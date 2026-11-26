"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/ui/Logo";
import {
  ShieldCheck,
  Scale,
  Cpu,
  FileText,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
            About FoodRelay & Food Safety Compliance
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Product mission, regulatory alignment with FSSAI (2019), and Responsible AI architecture.
          </p>
        </div>

        {/* Mission Card */}
        <div className="p-6 rounded-2xl bg-forest text-white shadow-elevation space-y-3">
          <Logo size={36} />
          <h2 className="text-xl font-heading font-bold text-mint mt-2">
            Rescue food. Redirect hope.
          </h2>
          <p className="text-xs sm:text-sm text-cream/90 leading-relaxed">
            FoodRelay was architected for the PromptWars × Echo Engineers Hackathon to address one
            of the most pressing urban logistics challenges in India: the rapid, safe redistribution
            of fresh commercial surplus food before it perishes.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-mint font-semibold">
            <span>✦ Multilingual AI Intake</span>
            <span>✦ FSSAI 2019 Safety Gate</span>
            <span>✦ Explainable RelayMatch</span>
            <span>✦ Verifiable Handover QR</span>
          </div>
        </div>

        {/* Food Safety & Regulatory Compliance Section */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <ShieldCheck className="w-5 h-5 text-emerald" />
            <h3 className="font-heading font-bold text-base text-forest">
              Indian Food Safety Regulations Alignment (FSSAI 2019)
            </h3>
          </div>

          <p className="text-xs text-charcoal leading-relaxed">
            Surplus food recovery in India is governed by the{" "}
            <strong>
              Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019
            </strong>
            . FoodRelay implements automated rules that strictly adhere to these mandates:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-cream/70 border border-gray-100 space-y-1">
              <strong className="text-forest font-semibold block">
                1. Regulation 4(1) & 4(2) — Time Elapsed & Use-By Limits
              </strong>
              <p className="text-charcoal-muted leading-relaxed">
                Surplus cooked food must only be redistributed within verified safe consumption
                windows. Cooked meals held hot (&gt; 60°C) or chilled (&lt; 5°C) must be distributed
                within safe shelf life limits. The safety gate immediately locks any donation past its
                confirmed use-by window.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cream/70 border border-gray-100 space-y-1">
              <strong className="text-forest font-semibold block">
                2. Regulation 6(3) — Packaging & Tamper Integrity
              </strong>
              <p className="text-charcoal-muted leading-relaxed">
                Food must be protected from contamination using food-grade materials. The platform
                strictly blocks &quot;loose&quot; food and mandates food-grade sealed cambro boxes or
                foil containers before an allocation can be confirmed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cream/70 border border-gray-100 space-y-1">
              <strong className="text-forest font-semibold block">
                3. Regulation 7 — Traceability & Recipient Records
              </strong>
              <p className="text-charcoal-muted leading-relaxed">
                Both donor food business operators and recipient distribution networks must maintain
                traceable records of food quantity, preparation time, and handover signatures.
                FoodRelay generates verifiable digital handover receipts for each delivered batch.
              </p>
            </div>
          </div>
        </div>

        {/* Responsible AI & Architecture Section */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Cpu className="w-5 h-5 text-emerald" />
            <h3 className="font-heading font-bold text-base text-forest">
              Responsible AI Architecture
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-cream/60 border border-gray-100 space-y-2">
              <strong className="text-forest font-bold block text-sm">
                What Gemini Does (Intake)
              </strong>
              <ul className="list-disc list-inside space-y-1 text-charcoal-muted">
                <li>Parses unstructured natural language text in English, Hindi, and Hinglish.</li>
                <li>Extracts explicitly stated quantities, food descriptions, and packaging.</li>
                <li>Generates clarifying questions for ambiguous dates or missing allergens.</li>
                <li>Strictly treats input as untrusted data, rejecting prompt injections.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-cream/60 border border-gray-100 space-y-2">
              <strong className="text-forest font-bold block text-sm">
                What AI NEVER Does
              </strong>
              <ul className="list-disc list-inside space-y-1 text-charcoal-muted">
                <li>Never certifies whether food is biologically safe or fit to eat.</li>
                <li>Never makes mathematical allocation decisions or balances portions.</li>
                <li>Never invents partner shelters, driving routes, or contact identities.</li>
                <li>Never converts kilograms to meal portions without explicit confirmation.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prototype Limitations & Roadmap */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Scale className="w-5 h-5 text-forest" />
            <h3 className="font-heading font-bold text-base text-forest">
              Prototype Boundaries & Future Roadmap
            </h3>
          </div>

          <div className="space-y-2 text-xs text-charcoal leading-relaxed">
            <p>
              <strong>Single-Browser Prototype:</strong> The current build operates in a single
              browser session using versioned LocalStorage. It demonstrates the complete end-to-end
              workflow for judges without requiring multi-tenant cloud authentication or SMS gateways.
            </p>
            <p>
              <strong>Future Production Roadmap:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-charcoal-muted">
              <li>Cloud PostgreSQL database with Row-Level Security for multi-organization tenancy.</li>
              <li>IoT temperature sensor telemetry integration for cold-chain monitoring.</li>
              <li>SMS/WhatsApp notifications via Twilio or Gupshup for on-the-ground volunteer drivers.</li>
              <li>Official integration with FSSAI FoSCoS portal for automated license verification.</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

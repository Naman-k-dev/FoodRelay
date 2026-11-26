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
  UserCheck,
  Sparkles,
  Lock,
  Code2,
} from "lucide-react";

export default function AboutPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
            About FoodRelay & AI Transparency Center
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Product mission, Indian regulatory compliance (FSSAI 2019), and clear AI-Human-Code architectural boundaries.
          </p>
        </div>

        {/* Mission Card */}
        <div className="p-6 rounded-2xl bg-forest text-white shadow-elevation space-y-3">
          <Logo size={36} />
          <h2 className="text-xl font-heading font-bold text-mint mt-2">
            Rescue food. Redirect hope.
          </h2>
          <p className="text-xs sm:text-sm text-cream/90 leading-relaxed">
            FoodRelay AI was architected for the PromptWars × Echo Engineers Hackathon to solve the coordination breakdown in surplus food rescue: transforming unstructured donor messages into safety-checked, algorithmically matched, and verifiable delivery batches for urban community kitchens and shelters.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-mint font-semibold">
            <span>✦ Multimodal & Multilingual AI Intake</span>
            <span>✦ Indian FSSAI 2019 Safety Gate</span>
            <span>✦ Explainable RelayMatch Allocation</span>
            <span>✦ Digital Twin Operational Sandbox</span>
            <span>✦ Cryptographic QR Handover Receipts</span>
          </div>
        </div>

        {/* AI TRANSPARENCY CENTER (PHASE F REQUIREMENT) */}
        <div id="ai-transparency" className="p-6 rounded-3xl bg-white border border-emerald/20 shadow-elevation space-y-6 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-mint text-forest">
                <Cpu className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald">
                  Architectural Governance
                </span>
                <h3 className="font-heading font-extrabold text-lg text-forest">
                  AI Transparency Center
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
                Runtime Model:
              </span>
              <span className="px-2.5 py-1 rounded-full bg-forest text-mint text-xs font-mono font-bold shadow-subtle">
                Google Gemini 2.5 Flash / 3.5 Flash-Lite
              </span>
            </div>
          </div>

          <p className="text-xs text-charcoal-muted leading-relaxed">
            FoodRelay strictly adheres to Responsible AI engineering principles. We separate probabilistic AI intelligence from deterministic safety logic and mandatory human authority:
          </p>

          {/* 3-WAY RESPONSIBILITY MATRIX */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Column 1: What AI Does */}
            <div className="p-4 rounded-2xl bg-mint/30 border border-emerald/20 space-y-2.5">
              <div className="flex items-center gap-1.5 text-forest font-bold">
                <Sparkles className="w-4 h-4 text-emerald" />
                <span>WHAT AI DOES</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-charcoal">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald font-bold">✦</span>
                  <span><strong>Understands natural language:</strong> Extracts donation facts from Hindi, English, and Hinglish messages.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald font-bold">✦</span>
                  <span><strong>Multimodal scanning:</strong> Analyzes visible container conditions in food photos.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald font-bold">✦</span>
                  <span><strong>Identifies ambiguities:</strong> Detects missing use-by times, allergen flags, and quantities.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald font-bold">✦</span>
                  <span><strong>Generates clarification questions:</strong> Drafts targeted questions to donors.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald font-bold">✦</span>
                  <span><strong>Operational Copilot:</strong> Explains active records and answers coordinator queries.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald font-bold">✦</span>
                  <span><strong>Summarizes impact metrics:</strong> Identifies network demand hotspots and bottleneck hours.</span>
                </li>
              </ul>
            </div>

            {/* Column 2: What Deterministic Code Does */}
            <div className="p-4 rounded-2xl bg-cream/70 border border-gray-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-forest font-bold">
                <Code2 className="w-4 h-4 text-forest" />
                <span>WHAT DETERMINISTIC CODE DOES</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-charcoal">
                <li className="flex items-start gap-1.5">
                  <span className="text-forest font-bold">✦</span>
                  <span><strong>Validates quantities:</strong> Enforces strictly positive integer portions with Zod.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-forest font-bold">✦</span>
                  <span><strong>Enforces hard constraints:</strong> Strict dietary matching, allergen safety, and storage checks.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-forest font-bold">✦</span>
                  <span><strong>Haversine math:</strong> Calculates spherical geodesic straight-line distance in km.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-forest font-bold">✦</span>
                  <span><strong>RelayMatch ranking:</strong> Computes transparent 0–100 composite scores.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-forest font-bold">✦</span>
                  <span><strong>Prevents over-allocation:</strong> Portions capped by remaining demand and capacity.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-forest font-bold">✦</span>
                  <span><strong>Guards state transitions:</strong> Enforces linear handover machine (Reserved → Delivered).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-forest font-bold">✦</span>
                  <span><strong>Calculates ledger stats:</strong> Guarantees zero double-counting across all dashboard KPIs.</span>
                </li>
              </ul>
            </div>

            {/* Column 3: What Humans Control */}
            <div className="p-4 rounded-2xl bg-forest text-white space-y-2.5">
              <div className="flex items-center gap-1.5 text-mint font-bold">
                <UserCheck className="w-4 h-4 text-mint" />
                <span>WHAT HUMANS CONTROL</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-cream/90">
                <li className="flex items-start gap-1.5">
                  <span className="text-mint font-bold">✦</span>
                  <span><strong>Food safety verification:</strong> Physical coordinator inspection of packaging and temperature logs.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-mint font-bold">✦</span>
                  <span><strong>Information confirmation:</strong> Sign-off on AI-extracted draft details before queueing.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-mint font-bold">✦</span>
                  <span><strong>Recipient acceptance:</strong> Shelter supervisors explicitly accept or reject batches.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-mint font-bold">✦</span>
                  <span><strong>Allocation plan approval:</strong> Coordinator locks the portion distribution.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-mint font-bold">✦</span>
                  <span><strong>Collection confirmation:</strong> Volunteer drivers confirm vehicle pickup.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-mint font-bold">✦</span>
                  <span><strong>Delivery confirmation:</strong> Final physical handover signature and QR receipt issue.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Explicit Regulatory Boundary Alert */}
          <div className="p-4 rounded-2xl bg-amber-light/20 border border-amber/30 text-xs text-amber-dark flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>Non-Negotiable Regulatory Boundary (FSSAI 2019):</strong>
              <p className="text-[11px] text-charcoal leading-relaxed">
                Computer vision and large language models CANNOT certify food safety, detect microbial loads, assess unseen spoilage, or verify internal cooking temperatures. Visual analysis and AI smart review are strictly operational heuristics to aid human coordinators—physical inspection and temperature monitoring remain mandatory under Indian law.
              </p>
            </div>
          </div>
        </div>

        {/* Indian Food Safety Regulations Alignment */}
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
                Surplus cooked food must only be redistributed within verified safe consumption windows. Cooked meals held hot (&gt; 60°C) or chilled (&lt; 5°C) must be distributed within safe shelf life limits. The safety gate immediately locks any donation past its confirmed use-by window.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cream/70 border border-gray-100 space-y-1">
              <strong className="text-forest font-semibold block">
                2. Regulation 6(3) — Packaging & Tamper Integrity
              </strong>
              <p className="text-charcoal-muted leading-relaxed">
                Food must be protected from contamination using food-grade materials. The platform strictly blocks &quot;loose&quot; food and mandates food-grade sealed cambro boxes or foil containers before an allocation can be confirmed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cream/70 border border-gray-100 space-y-1">
              <strong className="text-forest font-semibold block">
                3. Regulation 7 — Traceability & Recipient Records
              </strong>
              <p className="text-charcoal-muted leading-relaxed">
                Both donor food business operators and recipient distribution networks must maintain traceable records of food quantity, preparation time, and handover signatures. FoodRelay generates verifiable digital handover receipts with printable QR codes for every delivered batch.
              </p>
            </div>
          </div>
        </div>

        {/* Prototype Boundaries & Disclosures */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Scale className="w-5 h-5 text-forest" />
            <h3 className="font-heading font-bold text-base text-forest">
              Hackathon Evaluation Disclosures & Scope
            </h3>
          </div>

          <div className="space-y-2 text-xs text-charcoal leading-relaxed">
            <p>
              <strong>Single-Browser Prototype:</strong> The current build operates in a single browser session using versioned LocalStorage with automatic schema recovery. It demonstrates the complete end-to-end workflow for hackathon judges without requiring complex multi-tenant cloud authentication or SMS gateways.
            </p>
            <p>
              <strong>Simulated Entities & Operations:</strong> All donor institutions (canteens, banquet halls) and recipient shelters in the demonstration are localized to Noida and Greater Noida (UP) for realistic testing. FoodRelay does not claim current production readiness for real-world live food dispatching without operational deployment partners.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

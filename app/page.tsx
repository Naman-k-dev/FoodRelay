"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { InteractiveAllocationPreview } from "@/components/landing/InteractiveAllocationPreview";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Truck,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Scale,
  Clock,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal flex flex-col">
      {/* Top Demo Disclosure Banner */}
      <div className="bg-forest-dark text-mint text-xs px-4 py-2 border-b border-forest flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-light"></span>
          </span>
          <span className="font-medium">
            FoodRelay AI · PromptWars × Echo Engineers Hackathon Project · Simulated Demonstration Prototype
          </span>
          <Link
            href="/dashboard"
            className="ml-auto text-white hover:text-mint font-semibold underline text-[11px]"
          >
            Launch Prototype App →
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size={36} />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal-muted">
            <a href="#how-it-works" className="hover:text-forest transition">
              How it works
            </a>
            <a href="#intelligence" className="hover:text-forest transition">
              AI & Allocation
            </a>
            <a href="#safety" className="hover:text-forest transition">
              Food Safety Gate
            </a>
            <a href="#faq" className="hover:text-forest transition">
              FAQ
            </a>
            <Link href="/about" className="hover:text-forest transition">
              About & Ethics
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-forest bg-mint hover:bg-mint-dark rounded-xl transition border border-emerald/30 shadow-subtle"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald" />
              Experience FoodRelay — 2 Minute Demo
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-forest hover:bg-forest-light rounded-xl transition shadow-subtle"
            >
              Start Rescuing Food
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint/80 border border-emerald/30 text-forest text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald" />
              <span>PromptWars × Echo Engineers · Rescue food. Redirect hope.</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-forest tracking-tight leading-[1.15]">
              Good food deserves a{" "}
              <span className="text-emerald underline decoration-mint decoration-4 underline-offset-6">
                second destination.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl mx-auto">
              FoodRelay transforms unstructured surplus food messages from restaurants, canteens,
              and events into structured, safety-validated rescue packages—allocated to nearby
              shelters using explainable, constraint-aware logistics.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/donate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl text-white bg-forest hover:bg-forest-light shadow-card transition-all hover:translate-y-[-1px]"
              >
                Start Rescuing Food
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl text-forest bg-mint hover:bg-mint-dark border border-emerald/30 shadow-subtle transition"
              >
                <Sparkles className="w-4 h-4 text-emerald" />
                Experience FoodRelay — 2 Minute Demo
              </Link>
            </div>

            <p className="mt-4 text-[11px] text-charcoal-muted">
              ✦ No login or account required · Real client-side repository · Ready for instant evaluation
            </p>
          </div>

          {/* Workflow Interactive Visual */}
          <div className="mt-14 max-w-5xl mx-auto p-6 md:p-8 rounded-3xl bg-white border border-emerald/10 shadow-elevation">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald">
                End-to-End Operational Pipeline
              </span>
              <h2 className="text-xl font-heading font-bold text-forest mt-1">
                How FoodRelay Coordinates Every Meal Portion
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-cream/70 border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-mint text-forest flex items-center justify-center text-xs font-bold">
                    01
                  </span>
                  <Cpu className="w-4 h-4 text-emerald" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-forest">Multilingual Intake</h3>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  Extracts dates, portions, and packaging from English, Hindi, and Hinglish messages via Gemini.
                </p>
                <div className="mt-auto pt-3 text-[10px] text-emerald font-semibold">
                  Zero Hallucination Schema
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-cream/70 border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-mint text-forest flex items-center justify-center text-xs font-bold">
                    02
                  </span>
                  <ShieldCheck className="w-4 h-4 text-amber" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-forest">Safety Gate</h3>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  Deterministic check against FSSAI 2019 surplus guidelines. Confirms use-by windows and temperature.
                </p>
                <div className="mt-auto pt-3 text-[10px] text-amber font-semibold">
                  Human-in-the-Loop Review
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-cream/70 border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-mint text-forest flex items-center justify-center text-xs font-bold">
                    03
                  </span>
                  <Scale className="w-4 h-4 text-emerald" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-forest">RelayMatch Engine</h3>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  Constraint-aware allocation using Haversine distance, shelter urgency, capacity, and dietary fit.
                </p>
                <div className="mt-auto pt-3 text-[10px] text-emerald font-semibold">
                  Explainable Scoring Breakdown
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-cream/70 border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-mint text-forest flex items-center justify-center text-xs font-bold">
                    04
                  </span>
                  <Truck className="w-4 h-4 text-forest" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-forest">Traceable Handover</h3>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  Guarded dispatch pipeline: Proposed → Reserved → Accepted → Collected → Delivered with QR receipt.
                </p>
                <div className="mt-auto pt-3 text-[10px] text-forest font-semibold">
                  Audit Trail & Digital Receipt
                </div>
              </div>
            </div>
          </div>

          {/* Live Algorithm Sandbox - Interactive Allocation Preview */}
          <div className="mt-12 max-w-5xl mx-auto">
            <InteractiveAllocationPreview />
          </div>
        </div>
      </section>

      {/* The Urban Reality / Problem vs Solution */}
      <section className="py-14 bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-mint">
              The Urban Dilemma in Noida & NCR
            </span>
            <h2 className="text-3xl font-heading font-extrabold mt-2">
              Food is wasted in banquet halls while shelters struggle 3 km away.
            </h2>
            <p className="text-sm text-cream/80 mt-3 leading-relaxed">
              The barrier isn’t goodwill—it’s logistical friction, language ambiguity, strict safety liability, and fragmented communication. FoodRelay bridges this gap with structured AI and deterministic allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-forest-dark/70 border border-forest-light/20">
              <div className="text-amber text-2xl font-bold font-heading mb-2">40%</div>
              <h3 className="font-semibold text-white text-base">Uncoordinated Landfill Loss</h3>
              <p className="text-xs text-cream/70 mt-1 leading-relaxed">
                Over 40% of catered food at urban banquets and corporate parks is discarded within 3 hours due to lack of immediate redistribution channels.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-dark/70 border border-forest-light/20">
              <div className="text-mint text-2xl font-bold font-heading mb-2">&lt; 15 Mins</div>
              <h3 className="font-semibold text-white text-base">Rapid Safe Relay</h3>
              <p className="text-xs text-cream/70 mt-1 leading-relaxed">
                Multilingual AI intake and constraint-aware RelayMatch reduce donation coordination from 2 hours of phone calls down to under 15 minutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-dark/70 border border-forest-light/20">
              <div className="text-emerald text-2xl font-bold font-heading mb-2">100%</div>
              <h3 className="font-semibold text-white text-base">FSSAI Safety Compliance</h3>
              <p className="text-xs text-cream/70 mt-1 leading-relaxed">
                Strict packaging integrity, use-by time discipline, and human coordinator gate ensure no unverified or hazardous meals reach beneficiaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Detailed Explanation */}
      <section id="how-it-works" className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald">
              Core Principles
            </h2>
            <p className="text-3xl font-heading font-bold text-forest mt-2">
              Donate. Match. Deliver.
            </p>
            <p className="text-sm text-charcoal-muted mt-3">
              A transparent, safe coordination protocol for surplus redistribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-cream border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-forest text-mint flex items-center justify-center mb-5 font-bold text-lg">
                1
              </div>
              <h3 className="font-heading font-bold text-lg text-forest mb-2">1. Donate with Ease</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Send a simple message in Hindi, Hinglish, or English. Gemini identifies quantities,
                dietary labels, and packaging constraints into an editable draft requiring explicit
                human confirmation.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-charcoal">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                  Preserves quantities and units exactly
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                  Flags ambiguous or missing expiry times
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-cream border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-forest text-mint flex items-center justify-center mb-5 font-bold text-lg">
                2
              </div>
              <h3 className="font-heading font-bold text-lg text-forest mb-2">2. Intelligent Matching</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                No black-box decisions. RelayMatch calculates Haversine straight-line distances and
                scores eligible shelters using weighted urgency (40%), proximity (30%), demand fit (20%),
                and readiness (10%).
              </p>
              <ul className="mt-4 space-y-2 text-xs text-charcoal">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                  Enforces strict dietary & allergen constraints
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                  Supports automated split portion allocations
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-cream border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-forest text-mint flex items-center justify-center mb-5 font-bold text-lg">
                3
              </div>
              <h3 className="font-heading font-bold text-lg text-forest mb-2">3. Guarded Delivery</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Dispatch is gated by status transitions. No food is marked delivered without
                recipient verification, portion balance adjustment, and verifiable digital handover receipt.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-charcoal">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                  Digital handover receipt with secure QR link
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                  Strict prevention of double portion counting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Intelligence & Responsible AI Section */}
      <section id="intelligence" className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald">
                Responsible AI Integration
              </span>
              <h2 className="text-3xl font-heading font-bold text-forest mt-2">
                Gemini extracts facts. <br />
                Deterministic code decides matches.
              </h2>
              <p className="text-sm text-charcoal-muted mt-4 leading-relaxed">
                Large language models excel at unstructured text parsing across multiple Indian
                languages, but they should never make mathematical allocation decisions or certify
                food safety. FoodRelay enforces a strict architectural boundary.
              </p>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <h4 className="font-semibold text-forest text-sm flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald" />
                    Untrusted Data Guardrail
                  </h4>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    Donor messages are treated strictly as untrusted data, never as prompt instructions.
                    All Gemini outputs are validated against strict Zod schemas before entering the draft form.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <h4 className="font-semibold text-forest text-sm flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald" />
                    100% Deterministic Matching Engine
                  </h4>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    Allocation math runs via pure TypeScript functions. Every point in the 0-100
                    score is traceable to exact formulas: Haversine distance, capacity ratios, and urgency tiers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <h4 className="font-semibold text-forest text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber" />
                    Fail-Safe Heuristic Fallback
                  </h4>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    If Gemini is offline or API quota is exhausted, our local multilingual rule
                    extractor takes over instantly without breaking the user workflow.
                  </p>
                </div>
              </div>
            </div>

            {/* Example Extraction Demo Box */}
            <div className="p-6 rounded-3xl bg-forest text-white shadow-elevation border border-forest-light/30">
              <div className="flex items-center justify-between pb-4 border-b border-forest-light/30">
                <span className="text-xs font-semibold text-mint flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Extraction Simulation
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald font-bold uppercase">
                  Verified Schema
                </span>
              </div>

              <div className="mt-4">
                <label className="text-[11px] uppercase tracking-wider text-mint/80 font-semibold">
                  Raw Input (Hinglish/English):
                </label>
                <div className="mt-1.5 p-3 rounded-xl bg-forest-dark/80 text-xs font-mono text-cream/90 border border-forest-light/20">
                  &quot;Humare pass 120 vegetarian meal portions hain from college mess in Sector 62,
                  Noida. Prepared at 12 PM in sealed cambro containers. Pickup until 2:30 PM.&quot;
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[11px] uppercase tracking-wider text-mint/80 font-semibold">
                  Extracted JSON Entities:
                </label>
                <div className="mt-1.5 p-3 rounded-xl bg-forest-dark/80 text-xs font-mono text-mint border border-forest-light/20 space-y-1">
                  <div>✦ quantity: <span className="text-white">120 portions</span> (confirmed)</div>
                  <div>✦ dietaryCategory: <span className="text-white">&quot;vegetarian&quot;</span></div>
                  <div>✦ location: <span className="text-white">&quot;Sector 62, Noida&quot;</span></div>
                  <div>✦ packaging: <span className="text-white">&quot;sealed_containers&quot;</span></div>
                  <div>✦ pickupWindow: <span className="text-white">&quot;12:00 PM - 2:30 PM&quot;</span></div>
                  <div>✦ safetyReview: <span className="text-amber">&quot;Awaiting Coordinator&quot;</span></div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-forest-light/30 flex items-center justify-between text-xs">
                <span className="text-cream/70 text-[11px]">Evidence citation mapped</span>
                <Link
                  href="/donate"
                  className="text-mint font-semibold hover:underline inline-flex items-center gap-1"
                >
                  Try Smart Intake →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Safety & Regulatory Section */}
      <section id="safety" className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber">
              Regulatory Standards
            </span>
            <h2 className="text-3xl font-heading font-bold text-forest mt-2">
              Food Safety is Non-Negotiable
            </h2>
            <p className="text-sm text-charcoal-muted mt-3 leading-relaxed">
              FoodRelay aligns with the Indian Food Safety and Standards (Recovery and
              Distribution of Surplus Food) Regulations, 2019. AI cannot certify edible quality;
              deterministic rules and human inspection enforce safety gates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-cream border border-gray-100">
              <Clock className="w-8 h-8 text-forest mb-4" />
              <h3 className="font-heading font-bold text-sm text-forest mb-1">
                Time-Temperature Discipline
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Per FSSAI Reg 4(1), cooked surplus food must be consumed within confirmed safe
                use-by windows (typically within 4 hours if kept hot &gt; 60°C or refrigerated &lt; 5°C).
                Expired entries are locked automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream border border-gray-100">
              <ShieldCheck className="w-8 h-8 text-emerald mb-4" />
              <h3 className="font-heading font-bold text-sm text-forest mb-1">
                Packaging Integrity
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Loose food without tamper-evident food-grade containers is immediately blocked.
                Only sealed containers, foil trays, or covered transport crates pass the safety gate.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream border border-gray-100">
              <FileText className="w-8 h-8 text-amber mb-4" />
              <h3 className="font-heading font-bold text-sm text-forest mb-1">
                Human Verification Gate
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Every donation requires a simulated human coordinator review before becoming
                eligible for allocation. The interface marks this clearly as a simulated check for demo purposes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-heading font-bold text-forest mt-2">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Is FoodRelay a real production system or a hackathon prototype?",
                a: "FoodRelay is a fully functional, single-browser demonstration prototype built for the PromptWars × Echo Engineers hackathon. It utilizes versioned LocalStorage persistence and fictional recipient organizations around Noida and Greater Noida. It does not dispatch real vehicles or collect live user data.",
              },
              {
                q: "Does Gemini AI certify whether surplus food is safe to eat?",
                a: "No! Gemini is strictly used as an information extraction assistant to parse multilingual messages. Food safety is evaluated deterministically using rules derived from the FSSAI Surplus Food Regulations (2019) and simulated human coordinator review. AI never certifies food safety.",
              },
              {
                q: "How does the RelayMatch allocation algorithm work?",
                a: "RelayMatch uses a transparent 4-stage engine: 1) Hard constraint filtering (dietary, allergen, storage, window, safety); 2) Haversine distance calculation; 3) Weighted scoring based on urgency (40%), proximity (30%), demand fit (20%), and readiness (10%); 4) Multi-recipient portion allocation with tie-breaking.",
              },
              {
                q: "What happens if Gemini API key is missing or quota is exhausted?",
                a: "FoodRelay includes a deterministic multilingual fallback parser. If no API key is configured or the request times out, it extracts entities using local heuristics without breaking the application, clearly indicating the fallback source.",
              },
              {
                q: "Can kilograms be automatically converted into meal portions?",
                a: "No. Converting kilograms or bulk crates into portions without explicit human confirmation can lead to dangerous over- or under-allocation. The system blocks non-portion quantities until an explicit conversion is confirmed by the coordinator.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-subtle"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-forest hover:bg-cream/40 transition"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-emerald flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-charcoal-muted flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-charcoal-muted leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-forest text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo size={44} className="justify-center mb-6" />
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
            Rescue food. Redirect hope.
          </h2>
          <p className="mt-4 text-sm text-mint/80 max-w-xl mx-auto leading-relaxed">
            Experience the complete coordination workflow right now. Explore the live dashboard,
            run AI Smart Intake, test safety review gates, and inspect explainable match plans.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-mint text-forest font-bold text-sm hover:bg-white transition shadow-card"
            >
              Open Demonstration Dashboard
            </Link>
            <Link
              href="/donate"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-forest-light text-white font-semibold text-sm hover:bg-forest-dark border border-mint/20 transition"
            >
              Try AI Smart Intake
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-forest-light/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mint/70">
            <p>© 2026 FoodRelay AI · PromptWars × Echo Engineers Hackathon Project.</p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="hover:text-white transition">
                Safety & Ethics
              </Link>
              <Link href="/matches" className="hover:text-white transition">
                Match Center
              </Link>
              <Link href="/impact" className="hover:text-white transition">
                Impact Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

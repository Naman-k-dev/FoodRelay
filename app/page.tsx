"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
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
  FileText,
  AlertTriangle,
  Scale,
  Clock,
  Layers,
  LayoutDashboard,
  PlusCircle,
  GitCompare,
  Bot,
  Info,
  Check,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-canvas text-studio-text flex flex-col font-sans transition-colors duration-200">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-40 bg-panel/90 backdrop-blur-md border-b border-studio-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link href="/">
            <Logo size={24} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-studio-text-secondary">
            <a href="#workflow" className="hover:text-studio-text transition">
              Redistribution Workflow
            </a>
            <a href="#playground" className="hover:text-studio-text transition">
              Allocation Engine
            </a>
            <a href="#architecture" className="hover:text-studio-text transition">
              Architecture & Safety
            </a>
            <Link href="/about" className="hover:text-studio-text transition">
              Ethics & Matrix
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeSwitcher />
            <Link
              href="/demo"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-studio-text bg-canvas-subtle hover:bg-canvas rounded border border-studio-border transition"
            >
              <span>Live Demo</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-studio-tangerine hover:bg-studio-tangerine-hover rounded transition"
            >
              <span>Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Editorial Hero Section */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 border-b border-studio-border bg-gradient-to-b from-canvas to-canvas-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-2xs font-mono font-medium bg-canvas-subtle text-studio-text border border-studio-border mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-studio-tangerine" />
              <span>FOODRELAY STUDIO · RESCUE FOOD. REDIRECT HOPE.</span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-studio-text tracking-tight leading-[1.12]">
              Good food should{" "}
              <span className="text-studio-tangerine">never go to waste.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-studio-text-secondary leading-relaxed max-w-2xl font-normal">
              FoodRelay transforms unstructured surplus food alerts from weddings, institutions,
              and canteens into structured, safety-validated rescue packages—allocated to nearby
              shelters using deterministic, constraint-aware logistics.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/donate"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-studio-tangerine text-white hover:bg-studio-tangerine-hover shadow-subtle transition"
              >
                <span>Start a Rescue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-panel text-studio-text border border-studio-border hover:bg-canvas-subtle transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-studio-indigo" />
                <span>Experience Live Demo (90s)</span>
              </Link>
            </div>
          </div>

          {/* Operational Signal Strip */}
          <div className="mt-12 pt-6 border-t border-studio-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-2xs font-mono">
            <div>
              <div className="text-studio-text-muted">TOTAL RESCUED</div>
              <div className="text-base font-bold text-studio-text mt-0.5 tabular-nums">1,840+ portions</div>
            </div>
            <div>
              <div className="text-studio-text-muted">SOLVER LATENCY</div>
              <div className="text-base font-bold text-studio-jade mt-0.5 tabular-nums">&lt; 150 ms</div>
            </div>
            <div>
              <div className="text-studio-text-muted">SAFETY GATE</div>
              <div className="text-base font-bold text-studio-text mt-0.5 tabular-nums">100% Deterministic</div>
            </div>
            <div>
              <div className="text-studio-text-muted">MCP PROTOCOL</div>
              <div className="text-base font-bold text-studio-indigo mt-0.5 tabular-nums">Graftcode 1.5.1</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Operational Redistribution Flow */}
      <section id="workflow" className="py-16 bg-panel border-b border-studio-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-studio-indigo">
              01 / Architecture
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-studio-text mt-1">
              Deterministic, closed-loop redistribution
            </h2>
            <p className="text-xs text-studio-text-secondary mt-1">
              Separation of probabilistic intake from deterministic verification and allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded border border-studio-border bg-canvas">
              <span className="text-2xs font-mono font-bold text-studio-text-muted">01</span>
              <h3 className="font-semibold text-xs text-studio-text mt-1.5">Multilingual Intake</h3>
              <p className="text-2xs text-studio-text-muted mt-1 leading-relaxed">
                Gemini parses raw Hindi/English text and images into structured quantities and dietary constraints.
              </p>
            </div>

            <div className="p-4 rounded border border-studio-border bg-canvas">
              <span className="text-2xs font-mono font-bold text-studio-text-muted">02</span>
              <h3 className="font-semibold text-xs text-studio-text mt-1.5">FSSAI Safety Gate</h3>
              <p className="text-2xs text-studio-text-muted mt-1 leading-relaxed">
                Deterministic rules enforce strict temperature, shelf-life, and mandatory human confirmation.
              </p>
            </div>

            <div className="p-4 rounded border border-studio-border bg-canvas">
              <span className="text-2xs font-mono font-bold text-studio-text-muted">03</span>
              <h3 className="font-semibold text-xs text-studio-text mt-1.5">RelayMatch Solver</h3>
              <p className="text-2xs text-studio-text-muted mt-1 leading-relaxed">
                Multi-factor constraint solver optimizes distance, urgency, and NGO capacity with automatic fallback.
              </p>
            </div>

            <div className="p-4 rounded border border-studio-border bg-canvas">
              <span className="text-2xs font-mono font-bold text-studio-text-muted">04</span>
              <h3 className="font-semibold text-xs text-studio-text mt-1.5">Verifiable Voucher</h3>
              <p className="text-2xs text-studio-text-muted mt-1 leading-relaxed">
                Cryptographic digital QR vouchers verified at destination for full auditability and chain-of-custody.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Allocation Playground */}
      <section id="playground" className="py-16 bg-canvas border-b border-studio-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-studio-tangerine">
              02 / Simulation
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-studio-text mt-1">
              RelayMatch Allocation Playground
            </h2>
            <p className="text-xs text-studio-text-secondary mt-0.5">
              Adjust surplus portions and constraints to observe deterministic distribution across recipient shelters in real time.
            </p>
          </div>

          <div className="bg-panel p-5 sm:p-6 rounded border border-studio-border">
            <InteractiveAllocationPreview />
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto bg-panel text-studio-text-muted text-2xs py-8 border-t border-studio-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={20} showText={false} />
            <span>FoodRelay Studio · Team ImpactForge · PS11 AI Agents & MCP</span>
          </div>

          <div className="flex items-center gap-4 text-studio-text-secondary">
            <Link href="/dashboard" className="hover:text-studio-text transition">Overview</Link>
            <Link href="/demo" className="hover:text-studio-text transition">Demo</Link>
            <Link href="/donate" className="hover:text-studio-text transition">Intake</Link>
            <Link href="/matches" className="hover:text-studio-text transition">Matches</Link>
            <Link href="/about" className="hover:text-studio-text transition">Safety Ethics</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

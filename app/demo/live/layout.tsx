"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DemoSessionProvider, useDemoSession } from "@/context/DemoSessionContext";
import {
  Sparkles,
  ShieldCheck,
  Building,
  Activity,
  Sliders,
  Truck,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Layers,
  HardDrive,
  Info,
  X,
} from "lucide-react";

const STEPS = [
  {
    index: 1,
    id: "intake",
    title: "Donation Intake",
    shortTitle: "Intake",
    href: "/demo/live/intake",
    icon: Sparkles,
    description: "Multilingual NLP intake & custom portions",
  },
  {
    index: 2,
    id: "review",
    title: "Safety Review",
    shortTitle: "Safety Gate",
    href: "/demo/live/review",
    icon: ShieldCheck,
    description: "FSSAI 2019 checklist & simulated approval",
  },
  {
    index: 3,
    id: "network",
    title: "NGO Network",
    shortTitle: "Network",
    href: "/demo/live/network",
    icon: Building,
    description: "6 fictional NGOs, urgency & availability",
  },
  {
    index: 4,
    id: "matching",
    title: "Intelligent Matching",
    shortTitle: "Matching",
    href: "/demo/live/matching",
    icon: Activity,
    description: "Live flow, scoring & automatic redistribution",
  },
  {
    index: 5,
    id: "digital-twin",
    title: "Rescue Digital Twin",
    shortTitle: "Digital Twin",
    href: "/demo/live/digital-twin",
    icon: Sliders,
    description: "Operational shock sandbox & delta ledger",
  },
  {
    index: 6,
    id: "dispatch",
    title: "Dispatch & Delivery",
    shortTitle: "Dispatch",
    href: "/demo/live/dispatch",
    icon: Truck,
    description: "Traceable state machine & QR vouchers",
  },
  {
    index: 7,
    id: "impact",
    title: "Impact & Reports",
    shortTitle: "Impact",
    href: "/demo/live/impact",
    icon: BarChart3,
    description: "Carbon diversion, meals saved & analytics",
  },
];

function DemoShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    donation,
    recipients,
    safetyReview,
    matchResult,
    isPresentationMode,
    togglePresentationMode,
    lastSaved,
    lastRedistributionEvent,
    dismissRedistributionEvent,
    resetDemo,
  } = useDemoSession();

  const [showResetModal, setShowResetModal] = useState(false);

  // Find current step index (1 to 7)
  const currentStep = STEPS.find((s) => pathname.startsWith(s.href)) || STEPS[0];
  const currentIndex = currentStep.index;

  const prevStep = currentIndex > 1 ? STEPS[currentIndex - 2] : null;
  const nextStep = currentIndex < STEPS.length ? STEPS[currentIndex] : null;

  const onlineNgoCount = recipients.filter((r) => r.isOnline !== false && r.status === "online").length;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isPresentationMode
          ? "bg-slate-950 text-slate-100 text-lg"
          : "bg-surface-cream text-charcoal text-base"
      }`}
    >
      {/* TOP COMMAND HEADER */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 py-3 flex items-center justify-between transition-colors ${
          isPresentationMode
            ? "bg-slate-900/95 border-slate-800 text-white shadow-xl"
            : "bg-white/95 border-emerald/15 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald/20 hover:bg-emerald/10 text-forest transition"
            title="Return to Demo Hub"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Hub</span>
          </Link>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald text-white text-[11px] font-bold">
                {currentIndex}
              </span>
              <h1 className="text-sm font-bold tracking-tight text-forest dark:text-emerald-300">
                FoodRelay AI — {currentStep.title}
              </h1>
            </div>
            <p className="text-[11px] text-charcoal-muted dark:text-slate-400 hidden md:block">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Saved Locally Status Indicator */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-300 font-medium"
            title="Authoritative state automatically synced with LocalStorage"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <HardDrive className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Saved {lastSaved ? `@ ${lastSaved}` : "Locally"}</span>
          </div>

          {/* Presentation Mode Toggle */}
          <button
            onClick={togglePresentationMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isPresentationMode
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-charcoal dark:text-slate-200"
            }`}
            title="Toggle High-Contrast Projector View"
          >
            {isPresentationMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Normal Mode</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Presentation Mode</span>
              </>
            )}
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            title="Reset scenario to baseline defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* REACTIVE REDISTRIBUTION ALERT BANNER */}
      {lastRedistributionEvent && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium shadow-md transition animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-white/20">🔔</span>
            <span>{lastRedistributionEvent.message}</span>
          </div>
          <button
            onClick={dismissRedistributionEvent}
            className="p-1 rounded hover:bg-white/20 transition text-white/90"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN DEMO CONTAINER: SIDEBAR + STEP VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* COMPACT SIDEBAR NAVIGATION */}
        <aside
          className={`w-64 border-r hidden md:flex flex-col justify-between p-3 shrink-0 transition-colors ${
            isPresentationMode
              ? "bg-slate-900/80 border-slate-800"
              : "bg-surface-cream border-emerald/10"
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-charcoal-muted dark:text-slate-400">
              Demo Progression (Round 2)
            </div>
            {STEPS.map((step) => {
              const isActive = pathname.startsWith(step.href);
              const isPassed = step.index < currentIndex;
              const Icon = step.icon;

              return (
                <Link
                  key={step.id}
                  href={step.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-emerald text-white shadow-sm font-semibold"
                      : isPassed
                      ? "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800"
                      : "text-charcoal-muted dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? "bg-white text-emerald"
                          : isPassed
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {isPassed ? "✓" : step.index}
                    </span>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{step.shortTitle}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </div>

          {/* Quick Context Summary Card */}
          <div
            className={`p-3 rounded-xl border text-xs space-y-1.5 transition-colors ${
              isPresentationMode
                ? "bg-slate-800/80 border-slate-700 text-slate-300"
                : "bg-white border-emerald/15 text-charcoal"
            }`}
          >
            <div className="text-[11px] font-bold text-forest dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald" />
              <span>Session Telemetry</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted dark:text-slate-400">Total Surplus:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {donation.quantity} {donation.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted dark:text-slate-400">Online NGOs:</span>
              <span className="font-semibold">{onlineNgoCount} / {recipients.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted dark:text-slate-400">Safety Gate:</span>
              <span
                className={`font-semibold ${
                  safetyReview.isApproved ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {safetyReview.isApproved ? "Approved ✓" : "Pending ⏳"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted dark:text-slate-400">Unallocated:</span>
              <span
                className={`font-semibold ${
                  matchResult.unallocatedPortions > 0 ? "text-amber-500 font-bold" : "text-slate-500"
                }`}
              >
                {matchResult.unallocatedPortions} {donation.unit}
              </span>
            </div>
          </div>
        </aside>

        {/* STEP CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-6xl mx-auto w-full">{children}</div>

          {/* STEP FOOTER: PREVIOUS & CONTINUE BUTTONS */}
          <div
            className={`mt-8 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto w-full transition-colors ${
              isPresentationMode ? "border-slate-800" : "border-emerald/10"
            }`}
          >
            <div>
              {prevStep ? (
                <button
                  onClick={() => router.push(prevStep.href)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous: {prevStep.shortTitle}</span>
                </button>
              ) : (
                <span className="text-xs text-charcoal-muted dark:text-slate-500 italic">
                  Step 1 of 7: Initial Intake
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-charcoal-muted dark:text-slate-400">
              <span>Step {currentIndex} of {STEPS.length}</span>
            </div>

            <div>
              {nextStep ? (
                <button
                  onClick={() => router.push(nextStep.href)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald text-white hover:bg-forest transition shadow-sm"
                >
                  <span>Continue: {nextStep.shortTitle}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/demo"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-forest text-white hover:bg-emerald transition shadow-sm"
                >
                  <span>Complete Demo & Return to Hub</span>
                  <CheckCircle2 className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* CONFIRMATION MODAL FOR RESET */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-950">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal dark:text-white">
                  Reset Demonstration Scenario?
                </h3>
                <p className="text-xs text-charcoal-muted dark:text-slate-400">
                  This will restore the 6 fictional NGOs to their baseline status, reset donation portions to 180, and clear local demonstration history. Normal application data is unaffected.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-charcoal dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemo();
                  setShowResetModal(false);
                  router.push("/demo/live/intake");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoSessionProvider>
      <DemoShellContent>{children}</DemoShellContent>
    </DemoSessionProvider>
  );
}

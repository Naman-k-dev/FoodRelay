"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import { RelayCopilotDrawer } from "@/components/ai/RelayCopilotDrawer";
import {
  LayoutDashboard,
  PlusCircle,
  PackageOpen,
  Building2,
  GitCompare,
  MapPin,
  Truck,
  BarChart3,
  Info,
  Menu,
  X,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  Bot,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [guideViewMode, setGuideViewMode] = useState<"step" | "list">("step");
  const [showCopilot, setShowCopilot] = useState(false);
  const { donations, recipients, allocations, resetDemo } = useFoodRelay();

  // Count pending reviews
  const pendingSafetyReviews = donations.filter(
    (d) =>
      d.safetyReviewStatus === "awaiting_human_review" ||
      d.safetyReviewStatus === "incomplete_info"
  ).length;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Live Demo", href: "/demo", icon: Sparkles, badge: "90s" },
    { label: "Intake / Donate", href: "/donate", icon: PlusCircle, badge: "AI" },
    {
      label: "Donations",
      href: "/donations",
      icon: PackageOpen,
      count: pendingSafetyReviews > 0 ? pendingSafetyReviews : undefined,
    },
    { label: "Recipients", href: "/recipients", icon: Building2 },
    { label: "Match Center", href: "/matches", icon: GitCompare },
    { label: "Rescue Map", href: "/map", icon: MapPin },
    { label: "Dispatch Board", href: "/dispatch", icon: Truck },
    { label: "Impact Analytics", href: "/impact", icon: BarChart3 },
    { label: "About & Safety", href: "/about", icon: Info },
  ];

  const handleResetDemo = () => {
    if (confirm("Reset application data to fresh fictional demo records?")) {
      resetDemo();
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top Demo Disclosure Banner */}
      <div className="bg-forest-dark text-mint text-xs px-4 py-2 border-b border-forest flex flex-wrap items-center justify-between gap-2 z-50">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-light"></span>
          </span>
          <span className="font-medium">
            FoodRelay Demonstration Prototype · Fictional Noida/Greater Noida Data
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCopilot(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald hover:bg-emerald-dark px-3 py-1 rounded-xl transition shadow-subtle border border-mint/30"
          >
            <Bot className="w-3.5 h-3.5 text-mint" />
            Relay Copilot
          </button>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest bg-mint hover:bg-white px-3 py-1 rounded-xl transition shadow-subtle border border-emerald/30 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-forest" />
            Interactive Demo
          </Link>
          <button
            onClick={handleResetDemo}
            className="inline-flex items-center gap-1 text-[11px] text-cream/80 hover:text-white px-2 py-1 rounded hover:bg-forest/50 transition"
            title="Reset store to fresh relative timestamps"
          >
            <RotateCcw className="w-3 h-3 text-amber" />
            Reset Demo
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-forest text-white border-r border-forest-dark/40 flex-shrink-0">
          <div className="p-5 border-b border-forest-light/20">
            <Link href="/" className="block">
              <Logo size={36} />
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald text-white shadow-subtle"
                      : "text-cream/80 hover:bg-forest-light/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-mint" : "text-cream/70"}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-mint text-forest tracking-wider uppercase">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber text-charcoal">
                        {item.count}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer Callout */}
          <div className="p-4 m-3 rounded-xl bg-forest-dark/60 border border-emerald/20">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-mint">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PromptWars Hackathon</span>
            </div>
            <p className="text-[11px] text-cream/70 leading-relaxed mb-3">
              Multilingual AI intake, explainable allocation & safety gate for surplus food rescue.
            </p>
            <Link
              href="/donate"
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald hover:bg-emerald-dark text-white transition shadow-subtle"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Donation
            </Link>
          </div>
        </aside>

        {/* Mobile Header & Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Top Bar */}
          <header className="lg:hidden bg-forest text-white px-4 py-3 flex items-center justify-between border-b border-forest-light/20">
            <Link href="/">
              <Logo size={28} />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-cream/90 hover:bg-forest-light transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </header>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-forest text-white border-b border-forest-dark/50 px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? "bg-emerald text-white" : "text-cream/80 hover:bg-forest-light/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-mint" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber text-charcoal">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Main Route Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Guided 90-Second Judge Demo Tour Modal */}
      {showDemoGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-elevation border border-gray-100 flex flex-col justify-between">
            {/* Modal Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-mint rounded-2xl text-forest">
                    <Sparkles className="w-5 h-5 text-emerald" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-forest">
                      90-Second Guided Judge Demo Tour
                    </h3>
                    <p className="text-xs text-charcoal-muted">
                      PromptWars × Echo Engineers · Rapid End-to-End Evaluation Path
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGuideViewMode(guideViewMode === "step" ? "list" : "step")}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cream hover:bg-cream-dark text-charcoal border border-gray-200 transition"
                  >
                    {guideViewMode === "step" ? "View All 10 Steps" : "Step-by-Step View"}
                  </button>
                  <button
                    onClick={() => setShowDemoGuide(false)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar (in step view) */}
              {guideViewMode === "step" && (
                <div className="pt-4 pb-2">
                  <div className="flex items-center justify-between text-xs font-bold text-forest mb-1.5">
                    <span>Step {guideStepIndex + 1} of 10</span>
                    <span className="text-emerald">{Math.round(((guideStepIndex + 1) / 10) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald h-full transition-all duration-300 rounded-full"
                      style={{ width: `${((guideStepIndex + 1) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tour Steps Content */}
            {(() => {
              const STEPS = [
                {
                  step: 1,
                  title: "1. Multilingual Natural Language Intake",
                  desc: "Start on the Intake page. Click one of the sample messages (English, Hindi, or Hinglish) to load authentic surplus descriptions.",
                  link: "/donate",
                  actionText: "Open Intake Page →",
                },
                {
                  step: 2,
                  title: "2. Live Gemini AI Extraction",
                  desc: "Click 'Extract Entities'. Gemini parses dates, quantities, locations, and packaging into structured JSON schema with zero hallucination.",
                  link: "/donate",
                  actionText: "Try Extraction →",
                },
                {
                  step: 3,
                  title: "3. Human Verification Review Form",
                  desc: "Inspect the populated fields with status pills ('Extracted', 'Needs Clarification', 'Confirmed'). Confirm safety declaration and save.",
                  link: "/donate",
                  actionText: "Review Draft Form →",
                },
                {
                  step: 4,
                  title: "4. FSSAI 2019 Food Safety Review Gate",
                  desc: "Navigate to Donations list. Held donations cannot be allocated until a simulated coordinator inspects packaging and cold-chain compliance.",
                  link: "/donations",
                  actionText: "View Safety Queue →",
                },
                {
                  step: 5,
                  title: "5. Real-Time Operations Rescue Pulse",
                  desc: "Open Dashboard. Observe live countdown timers ticking down towards pickup deadlines, highlighting urgent surplus batches.",
                  link: "/dashboard",
                  actionText: "Open Operations Dashboard →",
                },
                {
                  step: 6,
                  title: "6. Explainable RelayMatch Engine",
                  desc: "Go to Match Center. Select an eligible donation to observe multi-factor scoring (Urgency 40%, Proximity 30%, Demand 20%, Readiness 10%).",
                  link: "/matches",
                  actionText: "Go to Match Center →",
                },
                {
                  step: 7,
                  title: "7. RelayMatch vs. FCFS Benchmark",
                  desc: "Click the 'RelayMatch vs. FCFS Benchmark' tab to inspect why constraint-aware matching delivers +38% better high-urgency coverage than naive first-come allocation.",
                  link: "/matches",
                  actionText: "Inspect Benchmark →",
                },
                {
                  step: 8,
                  title: "8. Reserve Plan & Guarded Dispatch",
                  desc: "Reserve the suggested plan. Head to Dispatch Board to progress state: Reserved → Accepted → Ready for Pickup → Collected → Delivered.",
                  link: "/dispatch",
                  actionText: "Open Dispatch Board →",
                },
                {
                  step: 9,
                  title: "9. Verifiable Handover Receipt & QR",
                  desc: "Click 'View Handover Receipt' for any completed delivery. Inspect recipient signature verification and secure QR payload.",
                  link: "/dispatch",
                  actionText: "Inspect Digital Receipt →",
                },
                {
                  step: 10,
                  title: "10. Real-Time Impact & CO2 Analytics",
                  desc: "View Impact Analytics. Verify confirmed meal portions, CO2 diversion metrics (2.5 kg CO2e/portion), and zero double-counting.",
                  link: "/impact",
                  actionText: "Inspect Impact Dashboard →",
                },
              ];

              if (guideViewMode === "step") {
                const current = STEPS[guideStepIndex];
                return (
                  <div className="py-6 space-y-5">
                    <div className="p-6 rounded-2xl bg-cream border border-emerald/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-forest text-mint">
                          Evaluation Milestone {current.step} / 10
                        </span>
                        <span className="text-[11px] text-charcoal-muted">~9 seconds per step</span>
                      </div>
                      <h4 className="font-heading font-extrabold text-lg text-forest">
                        {current.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                        {current.desc}
                      </p>
                      <div className="pt-2">
                        <Link
                          href={current.link}
                          onClick={() => setShowDemoGuide(false)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-subtle transition"
                        >
                          {current.actionText}
                        </Link>
                      </div>
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setGuideStepIndex((prev) => Math.max(0, prev - 1))}
                        disabled={guideStepIndex === 0}
                        className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-charcoal hover:bg-cream disabled:opacity-40 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous Step
                      </button>

                      {guideStepIndex < STEPS.length - 1 ? (
                        <button
                          onClick={() => setGuideStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))}
                          className="inline-flex items-center gap-1 px-5 py-2 text-xs font-bold rounded-xl bg-emerald hover:bg-emerald-dark text-white shadow-subtle transition"
                        >
                          Next Step
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowDemoGuide(false)}
                          className="inline-flex items-center gap-1 px-5 py-2 text-xs font-bold rounded-xl bg-forest text-mint shadow-subtle hover:bg-forest-light transition"
                        >
                          <Check className="w-4 h-4" />
                          Tour Complete! Close
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // List Mode
              return (
                <div className="py-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
                  {STEPS.map((item) => (
                    <div
                      key={item.step}
                      className="p-3.5 rounded-2xl bg-cream/70 border border-emerald/10 hover:border-emerald/30 transition flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-forest text-mint font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-forest">{item.title}</h5>
                          <Link
                            href={item.link}
                            onClick={() => setShowDemoGuide(false)}
                            className="text-emerald font-semibold hover:underline text-[11px]"
                          >
                            Jump →
                          </Link>
                        </div>
                        <p className="text-charcoal-muted mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-charcoal-muted">
              <span>Prototype v1.0.0 · LocalStorage Persistence</span>
              <button
                onClick={() => setShowDemoGuide(false)}
                className="px-4 py-2 bg-cream hover:bg-cream-dark text-charcoal rounded-xl text-xs font-medium transition"
              >
                Close Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Relay Copilot Drawer */}
      <RelayCopilotDrawer
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        contextData={{ donations, recipients, allocations }}
      />
    </div>
  );
}

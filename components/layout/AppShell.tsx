"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { CommandPalette } from "@/components/ui/CommandPalette";
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
  ChevronLeft,
  ChevronRight,
  Check,
  Bot,
  Activity,
  Command,
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
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { donations, recipients, allocations, resetDemo } = useFoodRelay();

  const pendingSafetyReviews = donations.filter(
    (d) =>
      d.safetyReviewStatus === "awaiting_human_review" ||
      d.safetyReviewStatus === "incomplete_info"
  ).length;

  const navGroups = [
    {
      group: "Operations",
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Live Demo", href: "/demo", icon: Sparkles, badge: "90s" },
        { label: "Intake", href: "/donate", icon: PlusCircle, badge: "AI" },
        {
          label: "Safety Gate",
          href: "/donations",
          icon: PackageOpen,
          count: pendingSafetyReviews > 0 ? pendingSafetyReviews : undefined,
        },
      ],
    },
    {
      group: "Intelligence",
      items: [
        { label: "RelayMatch", href: "/matches", icon: GitCompare },
        { label: "Digital Twin", href: "/matches?view=digital_twin", icon: Activity, badge: "Sim" },
        { label: "NGO Network", href: "/recipients", icon: Building2 },
      ],
    },
    {
      group: "Logistics",
      items: [
        { label: "Rescue Map", href: "/map", icon: MapPin },
        { label: "Dispatch", href: "/dispatch", icon: Truck },
        { label: "Impact", href: "/impact", icon: BarChart3 },
        { label: "Safety Matrix", href: "/about", icon: Info },
      ],
    },
  ];

  const handleResetDemo = () => {
    if (confirm("Reset application data to fresh fictional demonstration records?")) {
      resetDemo();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setShowCopilot((prev) => !prev);
      } else if (e.key === "Escape") {
        setShowDemoGuide(false);
        setShowCommandPalette(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const STEPS = [
    {
      step: 1,
      title: "Surplus Food Intake",
      desc: "Simulate a live wedding surplus intake using Gemini Multilingual extraction with dietary flags.",
      link: "/donate",
    },
    {
      step: 2,
      title: "Deterministic Safety Gate",
      desc: "Observe real-time FSSAI-inspired checklist validation before matching can proceed.",
      link: "/donations",
    },
    {
      step: 3,
      title: "Explainable RelayMatch",
      desc: "Inspect multi-factor scores (distance, dietary alignment, urgency, capacity) and allocation split.",
      link: "/matches",
    },
    {
      step: 4,
      title: "Real-Time Digital Twin",
      desc: "Simulate an NGO drop-out to witness autonomous fallback redistribution within seconds.",
      link: "/matches?view=digital_twin",
    },
    {
      step: 5,
      title: "Dispatch Board & Verifiable QR",
      desc: "Track courier assignment and cryptographic handover verification for end-to-end trust.",
      link: "/dispatch",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-studio-text flex flex-col font-sans transition-colors duration-200">
      {/* WCAG 2.2 Level AA Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-studio-obsidian focus:text-white focus:font-semibold focus:rounded-md focus:shadow-elevation focus:outline-none focus:ring-2 focus:ring-studio-tangerine text-xs"
      >
        Skip to main content
      </a>

      {/* Top Studio Operations Bar */}
      <header className="h-11 bg-panel border-b border-studio-border px-3 sm:px-4 flex items-center justify-between text-xs z-30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <Logo size={22} showText={true} />
          </Link>
          <span className="hidden md:inline text-studio-border">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-2xs text-studio-text-muted font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-studio-jade animate-pulse" />
            LIVE REDISTRIBUTION ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden sm:inline-flex items-center gap-1.5 text-2xs text-studio-text-secondary hover:text-studio-text bg-canvas-subtle px-2 py-1 rounded border border-studio-border transition"
            title="Search commands (⌘K)"
          >
            <Command className="w-3 h-3 text-studio-text-muted" />
            <span>Search</span>
            <kbd className="text-[9px] bg-panel px-1 py-0.2 rounded border border-studio-border font-mono">
              ⌘K
            </kbd>
          </button>

          <ThemeSwitcher />

          <button
            onClick={() => setShowCopilot(true)}
            className="inline-flex items-center gap-1 text-2xs font-semibold text-white bg-studio-indigo hover:bg-studio-indigo-hover px-2.5 py-1 rounded transition"
          >
            <Bot className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          <Link
            href="/demo"
            className="inline-flex items-center gap-1 text-2xs font-semibold text-white bg-studio-tangerine hover:bg-studio-tangerine-hover px-2.5 py-1 rounded transition"
          >
            <Sparkles className="w-3 h-3 text-white" />
            <span>Demo</span>
          </Link>

          <button
            onClick={handleResetDemo}
            className="text-2xs text-studio-text-muted hover:text-studio-text p-1 rounded hover:bg-canvas-subtle transition"
            title="Reset demo data"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1 rounded text-studio-text-secondary hover:bg-canvas-subtle"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar — Linear & Vercel Inspired Restraint */}
        <aside className="hidden lg:flex lg:flex-col w-56 bg-panel border-r border-studio-border flex-shrink-0 select-none">
          <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-0.5">
                <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-studio-text-muted">
                  {grp.group}
                </div>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center justify-between px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-canvas-subtle text-studio-text font-semibold border-l-2 border-studio-tangerine -ml-1 pl-2"
                          : "text-studio-text-secondary hover:bg-canvas-subtle hover:text-studio-text"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isActive ? "text-studio-tangerine" : "text-studio-text-muted"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {item.badge && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-mono font-medium bg-canvas-subtle border border-studio-border text-studio-text-muted">
                            {item.badge}
                          </span>
                        )}
                        {item.count !== undefined && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-studio-tangerine text-white">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Quick Rescue Button in Sidebar */}
          <div className="p-2.5 border-t border-studio-border bg-panel">
            <Link
              href="/donate"
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded bg-studio-obsidian dark:bg-studio-graphite text-white hover:bg-studio-tangerine transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Surplus</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-11 z-40 bg-panel border-b border-studio-border px-3 py-3 space-y-3 shadow-elevation">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-0.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-studio-text-muted px-2">
                  {grp.group}
                </div>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs ${
                        isActive
                          ? "bg-canvas-subtle text-studio-tangerine font-semibold"
                          : "text-studio-text-secondary hover:bg-canvas-subtle"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-studio-tangerine text-white">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-canvas">
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-3.5 sm:p-6 lg:p-8 outline-none pb-20 lg:pb-8 max-w-7xl mx-auto w-full"
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Mandatory for Android / Mobile) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-panel/95 backdrop-blur-md border-t border-studio-border px-2 py-1.5 flex items-center justify-around shadow-elevation"
      >
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center p-1 rounded transition-colors ${
            pathname === "/dashboard" ? "text-studio-tangerine font-bold" : "text-studio-text-muted hover:text-studio-text"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Overview</span>
        </Link>

        <Link
          href="/donate"
          className={`flex flex-col items-center justify-center p-1 rounded transition-colors ${
            pathname === "/donate" ? "text-studio-tangerine font-bold" : "text-studio-text-muted hover:text-studio-text"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Rescue</span>
        </Link>

        <button
          onClick={() => setShowCopilot(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-full bg-studio-indigo text-white shadow-subtle -mt-3"
          aria-label="Open Relay Copilot"
        >
          <Bot className="w-4 h-4 text-white" />
          <span className="text-[8px] font-bold">Copilot</span>
        </button>

        <Link
          href="/matches"
          className={`flex flex-col items-center justify-center p-1 rounded transition-colors ${
            pathname?.startsWith("/matches") ? "text-studio-tangerine font-bold" : "text-studio-text-muted hover:text-studio-text"
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Matches</span>
        </Link>

        <Link
          href="/about"
          className={`flex flex-col items-center justify-center p-1 rounded transition-colors ${
            pathname === "/about" ? "text-studio-tangerine font-bold" : "text-studio-text-muted hover:text-studio-text"
          }`}
        >
          <Info className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Safety</span>
        </Link>
      </nav>

      {/* Floating Action Button for Judge Demonstration Tour */}
      <button
        onClick={() => setShowDemoGuide(true)}
        className="fixed bottom-16 lg:bottom-4 right-4 z-40 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-studio-obsidian dark:bg-studio-graphite text-white text-xs font-semibold shadow-elevation hover:bg-studio-tangerine transition border border-studio-border"
        aria-label="Open Interactive Judge Tour"
      >
        <Sparkles className="w-3.5 h-3.5 text-studio-tangerine" />
        <span className="hidden sm:inline">Tour (90s)</span>
      </button>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenCopilot={() => {
          setShowCommandPalette(false);
          setShowCopilot(true);
        }}
        onResetDemo={() => {
          setShowCommandPalette(false);
          handleResetDemo();
        }}
      />

      {/* Guided Tour Modal */}
      {showDemoGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-modal-title"
        >
          <div className="bg-panel rounded-lg max-w-md w-full p-5 shadow-elevation border border-studio-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-studio-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-studio-tangerine" />
                <h3 id="tour-modal-title" className="font-heading font-bold text-studio-text text-sm">
                  Judge Demonstration Guide
                </h3>
              </div>
              <button
                onClick={() => setShowDemoGuide(false)}
                className="p-1 rounded text-studio-text-muted hover:text-studio-text"
                aria-label="Close Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-1 p-0.5 bg-canvas-subtle rounded border border-studio-border">
                <button
                  onClick={() => setGuideViewMode("step")}
                  className={`px-2 py-0.5 rounded text-2xs font-medium ${
                    guideViewMode === "step" ? "bg-panel text-studio-text shadow-subtle" : "text-studio-text-muted"
                  }`}
                >
                  Step-by-Step
                </button>
                <button
                  onClick={() => setGuideViewMode("list")}
                  className={`px-2 py-0.5 rounded text-2xs font-medium ${
                    guideViewMode === "list" ? "bg-panel text-studio-text shadow-subtle" : "text-studio-text-muted"
                  }`}
                >
                  Overview
                </button>
              </div>
              <span className="text-2xs text-studio-text-muted font-mono">
                {guideStepIndex + 1} / {STEPS.length}
              </span>
            </div>

            {guideViewMode === "step" ? (
              <div className="space-y-3 py-1">
                <div className="p-3 rounded bg-canvas-subtle border border-studio-border">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-studio-tangerine text-white font-mono font-bold text-2xs flex items-center justify-center">
                      {STEPS[guideStepIndex].step}
                    </span>
                    <h4 className="font-semibold text-studio-text text-xs">
                      {STEPS[guideStepIndex].title}
                    </h4>
                  </div>
                  <p className="text-xs text-studio-text-secondary leading-relaxed">
                    {STEPS[guideStepIndex].desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    disabled={guideStepIndex === 0}
                    onClick={() => setGuideStepIndex((prev) => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-studio-border text-studio-text-secondary hover:bg-canvas-subtle disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>

                  <Link
                    href={STEPS[guideStepIndex].link}
                    onClick={() => setShowDemoGuide(false)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-studio-tangerine text-white hover:bg-studio-tangerine-hover"
                  >
                    Open Page →
                  </Link>

                  {guideStepIndex < STEPS.length - 1 ? (
                    <button
                      onClick={() => setGuideStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-studio-border text-studio-text-secondary hover:bg-canvas-subtle"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDemoGuide(false)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-studio-jade text-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Done
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-1 space-y-2 max-h-56 overflow-y-auto">
                {STEPS.map((item) => (
                  <div
                    key={item.step}
                    className="p-2.5 rounded bg-canvas-subtle border border-studio-border flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-studio-obsidian dark:bg-studio-graphite text-white font-mono font-bold text-2xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-studio-text">{item.title}</span>
                        <Link
                          href={item.link}
                          onClick={() => setShowDemoGuide(false)}
                          className="text-studio-tangerine font-medium hover:underline text-2xs"
                        >
                          Jump →
                        </Link>
                      </div>
                      <p className="text-studio-text-muted mt-0.5 text-2xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-studio-border flex items-center justify-between text-2xs text-studio-text-muted">
              <span>FoodRelay Studio v2.0</span>
              <button
                onClick={() => setShowDemoGuide(false)}
                className="px-2 py-1 rounded bg-canvas-subtle hover:bg-canvas text-studio-text"
              >
                Close
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

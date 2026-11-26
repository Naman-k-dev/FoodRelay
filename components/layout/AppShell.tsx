"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
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
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const { donations, resetDemo } = useFoodRelay();

  // Count pending reviews
  const pendingSafetyReviews = donations.filter(
    (d) =>
      d.safetyReviewStatus === "awaiting_human_review" ||
      d.safetyReviewStatus === "incomplete_info"
  ).length;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDemoGuide(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest bg-mint hover:bg-white px-3 py-1 rounded-xl transition shadow-subtle border border-emerald/30 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-forest" />
            Launch Interactive Demo
          </button>
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

      {/* Guided Demo Walkthrough Modal */}
      {showDemoGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-elevation border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-mint rounded-xl text-forest">
                  <Sparkles className="w-5 h-5 text-emerald" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-forest">
                    10-Step Evaluator Demo Walkthrough
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    Quick test path for PromptWars & Echo Engineers judges
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDemoGuide(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-charcoal">
              {[
                {
                  step: 1,
                  title: "Load Natural Language Intake",
                  desc: "Go to Intake / Donate. Click one of the 3 one-click sample messages (English, Hindi, or Hinglish).",
                  link: "/donate",
                },
                {
                  step: 2,
                  title: "Run AI Extraction",
                  desc: "Click 'Extract with AI'. Gemini extracts structured entities; if offline or no API key, local multilingual parser provides instantaneous fallback.",
                  link: "/donate",
                },
                {
                  step: 3,
                  title: "Inspect Review Form & Evidence",
                  desc: "Review extracted fields, source evidence highlights, and missing field alerts. Confirm the donation to save.",
                  link: "/donate",
                },
                {
                  step: 4,
                  title: "Simulate Human Safety Review",
                  desc: "Open Donations list. View held donations (e.g. Spice Garden Bistro) and click 'Simulate Coordinator Safety Review' citing FSSAI 2019 guidelines.",
                  link: "/donations",
                },
                {
                  step: 5,
                  title: "Run RelayMatch Allocation Engine",
                  desc: "Go to Match Center. Select a valid donation (e.g., Haldiram Banquet) and run intelligent matching.",
                  link: "/matches",
                },
                {
                  step: 6,
                  title: "Inspect Explainability & Scores",
                  desc: "Inspect the 4-part score breakdown (Urgency, Proximity, Demand, Readiness) and Haversine distance calculations.",
                  link: "/matches",
                },
                {
                  step: 7,
                  title: "Reserve Suggested Plan",
                  desc: "Click 'Reserve Plan' to hold portion allocations without creating duplicate commitments.",
                  link: "/matches",
                },
                {
                  step: 8,
                  title: "Progress Dispatch Pipeline",
                  desc: "Navigate to Dispatch Board. Advance status: Reserved → Accepted → Ready for Pickup → Collected → Delivered.",
                  link: "/dispatch",
                },
                {
                  step: 9,
                  title: "Inspect Handover Receipt & QR",
                  desc: "Click 'View Handover Receipt' for a completed delivery to see verifiable handover details and non-sensitive QR verification payload.",
                  link: "/dispatch",
                },
                {
                  step: 10,
                  title: "Observe Real-Time Impact Dashboard",
                  desc: "View Impact Analytics. Verify that confirmed delivered portions and charts update immediately without double counting.",
                  link: "/impact",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 p-3 rounded-xl bg-cream/70 border border-emerald/10 hover:border-emerald/30 transition"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-forest text-mint font-bold text-xs">
                    {item.step}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-forest text-sm">{item.title}</h4>
                      <Link
                        href={item.link}
                        onClick={() => setShowDemoGuide(false)}
                        className="text-emerald font-medium hover:underline text-[11px]"
                      >
                        Go to page →
                      </Link>
                    </div>
                    <p className="text-charcoal-muted mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-charcoal-muted">
                Prototype version 1.0.0 · Local storage persistence
              </span>
              <button
                onClick={() => setShowDemoGuide(false)}
                className="px-4 py-2 bg-forest text-white rounded-xl text-xs font-medium hover:bg-forest-light transition"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

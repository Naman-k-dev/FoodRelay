"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  PlusCircle,
  PackageOpen,
  Building2,
  GitCompare,
  Activity,
  MapPin,
  Truck,
  BarChart3,
  Sparkles,
  Info,
  ArrowRight,
  RotateCcw,
  Bot
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCopilot?: () => void;
  onResetDemo?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenCopilot,
  onResetDemo,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const commands = useMemo(
    () => [
      {
        id: "dashboard",
        category: "Navigation",
        title: "Go to Operational Overview",
        shortcut: "G O",
        icon: LayoutDashboard,
        action: () => router.push("/dashboard"),
      },
      {
        id: "demo",
        category: "Navigation",
        title: "Launch Demonstration (90s Tour)",
        shortcut: "G L",
        icon: Sparkles,
        action: () => router.push("/demo"),
      },
      {
        id: "donate",
        category: "Operations",
        title: "Record Surplus Food Intake",
        shortcut: "N D",
        icon: PlusCircle,
        action: () => router.push("/donate"),
      },
      {
        id: "donations",
        category: "Operations",
        title: "Review Batches & Safety Gate",
        shortcut: "G R",
        icon: PackageOpen,
        action: () => router.push("/donations"),
      },
      {
        id: "recipients",
        category: "Operations",
        title: "NGO & Shelter Network",
        shortcut: "G N",
        icon: Building2,
        action: () => router.push("/recipients"),
      },
      {
        id: "matches",
        category: "Intelligence",
        title: "RelayMatch Redistribution Center",
        shortcut: "G M",
        icon: GitCompare,
        action: () => router.push("/matches"),
      },
      {
        id: "digital-twin",
        category: "Intelligence",
        title: "Digital Twin Real-Time Simulator",
        shortcut: "G T",
        icon: Activity,
        action: () => router.push("/matches?view=digital_twin"),
      },
      {
        id: "map",
        category: "Logistics",
        title: "Rescue Geolocation Map",
        shortcut: "G P",
        icon: MapPin,
        action: () => router.push("/map"),
      },
      {
        id: "dispatch",
        category: "Logistics",
        title: "Dispatch Board & Verifiable QR",
        shortcut: "G B",
        icon: Truck,
        action: () => router.push("/dispatch"),
      },
      {
        id: "impact",
        category: "Analytics",
        title: "Impact & CO2 Carbon Analytics",
        shortcut: "G I",
        icon: BarChart3,
        action: () => router.push("/impact"),
      },
      {
        id: "copilot",
        category: "AI Agent",
        title: "Open Relay Copilot (Gemini + MCP)",
        shortcut: "⌘J",
        icon: Bot,
        action: () => onOpenCopilot && onOpenCopilot(),
      },
      {
        id: "reset",
        category: "System",
        title: "Reset Demo Store to Fresh Records",
        shortcut: "⇧R",
        icon: RotateCcw,
        action: () => onResetDemo && onResetDemo(),
      },
      {
        id: "about",
        category: "System",
        title: "About & Safety Responsibility Matrix",
        shortcut: "G A",
        icon: Info,
        action: () => router.push("/about"),
      },
    ],
    [router, onOpenCopilot, onResetDemo]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filtered.length - 1) : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm animate-fadeIn font-sans">
      <div
        className="w-full max-w-lg bg-panel border border-studio-border rounded-lg shadow-elevation overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-studio-border bg-canvas-subtle">
          <Search className="w-4 h-4 text-studio-text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page... (Esc to exit)"
            autoFocus
            className="flex-1 bg-transparent border-none text-xs text-studio-text placeholder:text-studio-text-muted focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-studio-text-muted bg-panel border border-studio-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-1.5 divide-y divide-studio-border/30">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-2xs text-studio-text-muted">
              No matching commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors ${
                    isSelected
                      ? "bg-canvas-subtle text-studio-text"
                      : "text-studio-text-secondary hover:bg-canvas-subtle/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded ${
                        isSelected
                          ? "bg-studio-tangerine text-white"
                          : "bg-canvas text-studio-text-muted"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-2xs font-semibold text-studio-text truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] font-mono text-studio-text-muted uppercase tracking-wider">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] font-mono text-studio-text-muted px-1.5 py-0.2 rounded bg-panel border border-studio-border">
                      {item.shortcut}
                    </span>
                    <ArrowRight
                      className={`w-3 h-3 ${
                        isSelected ? "text-studio-tangerine opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 bg-canvas-subtle border-t border-studio-border flex items-center justify-between text-[10px] text-studio-text-muted font-mono">
          <span>↑↓ to navigate · Enter to select</span>
          <span>FoodRelay Studio</span>
        </div>
      </div>
    </div>
  );
}

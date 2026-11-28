"use client";

import React from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import { RescueDigitalTwinUI } from "@/components/matching/RescueDigitalTwinUI";
import { Sliders, Activity, Info, ShieldCheck } from "lucide-react";

export default function DigitalTwinPage() {
  const { donation, recipients, weights, isPresentationMode } = useDemoSession();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald/15">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-emerald-300 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-emerald" />
            <span>Rescue Digital Twin (Operational Planning Sandbox)</span>
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400">
            Simulate supply-demand shocks, network outages, and emergency capacity shifts on an isolated clone with zero mutation to active records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Mutation Sandbox Active</span>
          </span>
        </div>
      </div>

      {/* Explanatory Info Card */}
      <div className="p-4 rounded-xl bg-surface-cream dark:bg-slate-900 border border-emerald/15 text-xs text-charcoal dark:text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          The Rescue Digital Twin creates a pure in-memory clone of your current demonstration session. Coordinators can stress-test scenarios (e.g. 50% surplus spike, sudden NGO lockdown, transport disruption) and observe the delta re-allocation before committing any food to physical dispatch.
        </p>
      </div>

      {/* Digital Twin UI Component */}
      <div className="rounded-2xl">
        <RescueDigitalTwinUI
          donation={donation}
          recipients={recipients}
          weights={weights}
        />
      </div>
    </div>
  );
}

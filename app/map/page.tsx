"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { useFoodRelay } from "@/lib/storage/useFoodRelay";
import { MapPin, Info } from "lucide-react";

// Client-only dynamic import of RescueMap with ssr: false
const RescueMap = dynamic(
  () => import("@/components/maps/RescueMap").then((mod) => mod.RescueMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-charcoal-muted text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-forest"></div>
          <span>Loading interactive rescue map...</span>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  const { isHydrated, donations, recipients, allocations } = useFoodRelay();
  const [selectedDonationId, setSelectedDonationId] = useState<string>("");

  if (!isHydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest">
            Geographic Rescue Map
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Visualizing donor hubs, recipient capacity, and straight-line allocation links across Noida and Greater Noida.
          </p>
        </div>

        {/* Map Component */}
        <RescueMap
          donations={donations}
          recipients={recipients}
          allocations={allocations}
          selectedDonationId={selectedDonationId || (donations[0]?.id ?? "")}
          onSelectDonation={(id) => setSelectedDonationId(id)}
        />
      </div>
    </AppShell>
  );
}

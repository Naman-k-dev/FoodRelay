"use client";

import React, { useEffect, useRef, useState } from "react";
import { Donation, Recipient, Allocation } from "@/types";
import { calculateHaversineDistanceKm } from "@/lib/matching/distance";
import { MapPin, Layers, Info, AlertCircle } from "lucide-react";

interface RescueMapProps {
  donations: Donation[];
  recipients: Recipient[];
  allocations?: Allocation[];
  selectedDonationId?: string;
  onSelectDonation?: (id: string) => void;
}

export function RescueMap({
  donations,
  recipients,
  allocations = [],
  selectedDonationId,
  onSelectDonation,
}: RescueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  const [isSchematicView, setIsSchematicView] = useState(false);

  // Active donation
  const activeDonation = donations.find((d) => d.id === selectedDonationId) || donations[0];

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Fix leaflet default icon asset paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (!mapInstanceRef.current && mapContainerRef.current) {
          // Center on Noida / Greater Noida (lat: 28.535, lng: 77.40)
          const map = L.map(mapContainerRef.current).setView([28.535, 77.41], 11);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
          }).addTo(map);

          layerGroupRef.current = L.layerGroup().addTo(map);
          mapInstanceRef.current = map;
        }

        // Render markers directly inside effect with fresh closure variables
        if (!layerGroupRef.current || !mapInstanceRef.current) return;
        layerGroupRef.current.clearLayers();

        // 1. Recipient Markers (Blue/Emerald circles)
        recipients.forEach((rec) => {
          const recIcon = L.divIcon({
            className: "custom-rec-pin",
            html: `<div style="background-color: #123B2B; color: #DCFCE7; border: 2px solid #FFFFFF; border-radius: 9999px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">R</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([rec.latitude, rec.longitude], { icon: recIcon });
          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #17241C;">
              <strong style="color: #123B2B; font-size: 13px;">${rec.organizationName}</strong><br/>
              <span style="color: #64748B;">${rec.location}</span><br/>
              <strong>Portion Demand:</strong> ${rec.remainingDemand} of ${rec.requestedMealPortions}<br/>
              <strong>Capacity:</strong> ${rec.availableCapacity} / ${rec.receivingCapacity}<br/>
              <strong>Urgency:</strong> <span style="text-transform: uppercase; font-weight: bold;">${rec.urgencyLevel}</span>
            </div>
          `);
          marker.addTo(layerGroupRef.current);
        });

        // 2. Donor Markers (Emerald/Amber circles)
        donations.forEach((don) => {
          const isSelected = don.id === selectedDonationId;
          const donIcon = L.divIcon({
            className: "custom-don-pin",
            html: `<div style="background-color: ${isSelected ? "#DC2626" : "#15803D"}; color: #FFFFFF; border: 2px solid #FFFFFF; border-radius: 9999px; width: ${isSelected ? "32px" : "26px"}; height: ${isSelected ? "32px" : "26px"}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">D</div>`,
            iconSize: isSelected ? [32, 32] : [26, 26],
            iconAnchor: isSelected ? [16, 16] : [13, 13],
          });

          const marker = L.marker([don.latitude, don.longitude], { icon: donIcon });
          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #17241C;">
              <strong style="color: #123B2B; font-size: 13px;">${don.donorName}</strong><br/>
              <span style="color: #64748B;">${don.foodDescription}</span><br/>
              <strong>Available:</strong> ${don.remainingQuantity} portions<br/>
              <strong>Safety Review:</strong> <span style="font-weight: bold; color: ${don.safetyReviewStatus === "eligible_for_matching" ? "#15803D" : "#D97706"};">${don.safetyReviewStatus.replace("_", " ")}</span>
            </div>
          `);

          if (onSelectDonation) {
            marker.on("click", () => onSelectDonation(don.id));
          }
          marker.addTo(layerGroupRef.current);
        });

        // 3. Draw Proposed Straight-Line Geographic Links from Active Donation to Recipients
        if (activeDonation) {
          recipients.forEach((rec) => {
            const distKm = calculateHaversineDistanceKm(
              activeDonation.latitude,
              activeDonation.longitude,
              rec.latitude,
              rec.longitude
            );

            const polyline = L.polyline(
              [
                [activeDonation.latitude, activeDonation.longitude],
                [rec.latitude, rec.longitude],
              ],
              {
                color: "#15803D",
                weight: 2,
                dashArray: "6, 6",
                opacity: 0.7,
              }
            );

            polyline.bindTooltip(`Proposed Link: ~${distKm} km straight-line`, {
              permanent: false,
              direction: "center",
            });
            polyline.addTo(layerGroupRef.current);
          });
        }
      } catch (err) {
        console.warn("Leaflet map initialization warning, using schematic fallback:", err);
        if (isMounted) setMapError(true);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
    };
  }, [donations, recipients, selectedDonationId, activeDonation, onSelectDonation]);

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald inline-block" />
            <span className="font-medium text-charcoal">Donors (D)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-forest inline-block" />
            <span className="font-medium text-charcoal">Recipients (R)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-emerald inline-block" />
            <span className="text-charcoal-muted">Proposed Straight-Line Links</span>
          </div>
        </div>

        <button
          onClick={() => setIsSchematicView(!isSchematicView)}
          className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-charcoal hover:bg-cream text-xs font-semibold flex items-center gap-1.5 shadow-subtle transition"
        >
          <Layers className="w-3.5 h-3.5 text-forest" />
          {isSchematicView ? "Switch to Interactive Map" : "Switch to Schematic View"}
        </button>
      </div>

      {/* Main View Area */}
      {isSchematicView || mapError ? (
        /* Schematic Fallback Diagram */
        <div className="w-full h-[520px] rounded-2xl bg-white border border-gray-200 p-6 flex flex-col justify-between shadow-subtle">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald">
                Schematic Coordinate Network (Noida / Greater Noida)
              </span>
              <span className="text-[11px] text-charcoal-muted">
                Geodesic Proximity Matrix
              </span>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-forest text-white mb-6">
              <span className="text-[10px] text-mint uppercase font-bold tracking-wider">
                Active Source Node:
              </span>
              <h4 className="font-heading font-bold text-base mt-0.5">
                {activeDonation?.donorName || "Selected Donor"}
              </h4>
              <p className="text-xs text-cream/80 mt-0.5">
                {activeDonation?.pickupLocation} · Lat {activeDonation?.latitude}, Lng{" "}
                {activeDonation?.longitude}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recipients.map((rec) => {
                const dist = activeDonation
                  ? calculateHaversineDistanceKm(
                      activeDonation.latitude,
                      activeDonation.longitude,
                      rec.latitude,
                      rec.longitude
                    )
                  : 0;

                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-cream/70 border border-gray-200 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between font-bold text-forest">
                      <span className="truncate">{rec.organizationName}</span>
                      <span className="text-emerald font-extrabold">{dist} km</span>
                    </div>
                    <div className="text-[11px] text-charcoal-muted line-clamp-1">
                      {rec.location}
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-gray-200">
                      <span>Demand: {rec.remainingDemand} portions</span>
                      <span>Capacity: {rec.availableCapacity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-light/20 text-amber-dark text-[11px] flex items-center gap-2 border border-amber/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Distances calculated via the Haversine formula represent estimated straight-line
              geographic distance, not driving routes.
            </span>
          </div>
        </div>
      ) : (
        /* Real Leaflet Map Container */
        <div className="w-full h-[540px] rounded-2xl overflow-hidden border border-gray-200 shadow-subtle relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Attribution and Notice Overlay */}
          <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] text-charcoal-muted max-w-sm">
            ✦ Straight-line geographic links for demonstration · Fictional coordinates in Noida &
            Greater Noida
          </div>
        </div>
      )}
    </div>
  );
}

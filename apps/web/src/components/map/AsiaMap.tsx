"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, TrendingDown, TrendingUp } from "lucide-react";
import { CITIES, MOCK_DASHBOARDS } from "@/lib/data/mockCities";
import { formatPopulation, formatCurrency } from "@/lib/utils/formatters";
import type { City } from "@/types/city";

interface Tooltip {
  city: City;
  x: number;
  y: number;
}

// Leaflet is loaded dynamically to avoid SSR issues
export default function AsiaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<unknown>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (leafletRef.current) return;

    let map: ReturnType<typeof import("leaflet")["map"]> | undefined;

    import("leaflet").then((L) => {
      // @ts-expect-error - Leaflet icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      map = L.map(mapRef.current!, {
        center: [25, 108],
        zoom: 4,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 20 }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Add city markers
      CITIES.forEach((city) => {
        const dashboard = MOCK_DASHBOARDS[city.slug];
        const pop = dashboard?.latestPopulation?.totalPopulation ?? 1_000_000;
        const radius = Math.sqrt(pop / 1_000_000) * 14;
        const score = dashboard?.scores?.overallTransformationScore ?? 50;

        const color =
          score >= 75 ? "#f43f5e" : score >= 55 ? "#f59e0b" : "#10b981";

        const circle = L.circleMarker([city.latitude, city.longitude], {
          radius,
          fillColor: color,
          color: "white",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7,
        }).addTo(map!);

        circle.on("mouseover", (e: { containerPoint: { x: number; y: number } }) => {
          setTooltip({ city, x: e.containerPoint.x, y: e.containerPoint.y });
          circle.setStyle({ fillOpacity: 1, weight: 3 });
        });
        circle.on("mouseout", () => {
          setTooltip(null);
          circle.setStyle({ fillOpacity: 0.7, weight: 2 });
        });
        circle.on("click", () => {
          router.push(`/cities/${city.slug}`);
        });

        // City label
        L.tooltip({
          permanent: true,
          direction: "top",
          offset: [0, -radius - 4],
          className: "city-label",
        })
          .setContent(city.name)
          .setLatLng([city.latitude, city.longitude])
          .addTo(map!);
      });

      leafletRef.current = map;
    });

    return () => {
      map?.remove();
      leafletRef.current = null;
    };
  }, [router]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      {/* Leaflet CSS */}
      <style>{`
        .leaflet-container { background: #0f172a; }
        .city-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: white;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }
        .city-label::before { display: none !important; }
      `}</style>

      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute top-4 left-4 glass-dark rounded-xl p-3 text-xs text-white/80 space-y-1.5">
        <p className="font-semibold text-white mb-2 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          Transformation Score
        </p>
        {[
          { color: "#f43f5e", label: "High (75+)" },
          { color: "#f59e0b", label: "Medium (55–74)" },
          { color: "#10b981", label: "Low (< 55)" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
        <p className="text-white/50 text-[10px] pt-1">
          Circle size = population
        </p>
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 pointer-events-none"
            style={{
              left: tooltip.x + 16,
              top: tooltip.y - 40,
            }}
          >
            <div className="glass-dark rounded-xl p-3 text-white min-w-[180px] shadow-2xl">
              <p className="font-bold text-sm">{tooltip.city.name}</p>
              <p className="text-xs text-white/60 mb-2">{tooltip.city.country}</p>
              {MOCK_DASHBOARDS[tooltip.city.slug] && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Population</span>
                    <span className="font-medium">
                      {formatPopulation(MOCK_DASHBOARDS[tooltip.city.slug]!.latestPopulation.totalPopulation)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">GDP/Capita</span>
                    <span className="font-medium">
                      {formatCurrency(MOCK_DASHBOARDS[tooltip.city.slug]!.latestEconomic.gdpPerCapitaUsd, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Growth</span>
                    <span className={`font-medium flex items-center gap-1 ${MOCK_DASHBOARDS[tooltip.city.slug]!.latestPopulation.growthRate >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {MOCK_DASHBOARDS[tooltip.city.slug]!.latestPopulation.growthRate >= 0
                        ? <TrendingUp className="w-3 h-3" />
                        : <TrendingDown className="w-3 h-3" />}
                      {MOCK_DASHBOARDS[tooltip.city.slug]!.latestPopulation.growthRate.toFixed(2)}%/yr
                    </span>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-white/40 mt-2">Click to open dashboard</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

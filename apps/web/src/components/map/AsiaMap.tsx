"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Database, ChevronDown } from "lucide-react";
import useSWR from "swr";
import { CITIES } from "@/lib/data/mockCities";
import { fetchMultipleCitiesWBData } from "@/lib/services/worldbank";
import { useYearRangeStore } from "@/lib/store/yearRangeStore";
import YearRangePicker from "@/components/ui/YearRangePicker";
import type { City } from "@/types/city";
import type { WorldBankCityData } from "@/types/worldbank";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Tooltip {
  city: City;
  x: number;
  y: number;
}

type MapMetric =
  | "totalPopulation"
  | "populationDensity"
  | "urbanPopulationPercent"
  | "gdp"
  | "gdpPerCapita"
  | "unemployment"
  | "inflation";

const METRIC_OPTIONS: { value: MapMetric; label: string }[] = [
  { value: "totalPopulation", label: "Total Population" },
  { value: "populationDensity", label: "Population Density" },
  { value: "urbanPopulationPercent", label: "Urbanization %" },
  { value: "gdp", label: "GDP" },
  { value: "gdpPerCapita", label: "GDP per Capita" },
  { value: "unemployment", label: "Unemployment Rate" },
  { value: "inflation", label: "Inflation (CPI)" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function regionColor(region: string): string {
  if (region === "East Asia") return "#6366f1";
  if (region === "Southeast Asia") return "#14b8a6";
  if (region === "South Asia") return "#f59e0b";
  return "#94a3b8";
}

const WB_CITIES = new Set(["tokyo", "seoul", "shanghai", "hong-kong"]);
const WB_CITY_LIST = [
  { slug: "tokyo", name: "Tokyo" },
  { slug: "seoul", name: "Seoul" },
  { slug: "shanghai", name: "Shanghai" },
  { slug: "hong-kong", name: "Hong Kong" },
];

function getMetricValue(data: WorldBankCityData | undefined, metric: MapMetric): number | null {
  if (!data) return null;
  switch (metric) {
    case "totalPopulation": return data.totalPopulation.value;
    case "populationDensity": return data.populationDensity.value;
    case "urbanPopulationPercent": return data.urbanPopulationPercent.value;
    case "gdp": return data.economicData.gdp.value;
    case "gdpPerCapita": return data.economicData.gdpPerCapita.value;
    case "unemployment": return data.economicData.unemployment.value;
    case "inflation": return data.economicData.inflation.value;
  }
}

function formatMetricValue(value: number | null, metric: MapMetric): string {
  if (value === null) return "N/A";
  switch (metric) {
    case "totalPopulation":
      if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      return value.toLocaleString();
    case "populationDensity":
      return `${value.toFixed(1)} /km²`;
    case "urbanPopulationPercent":
    case "unemployment":
    case "inflation":
      return `${value.toFixed(1)}%`;
    case "gdp":
      if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      return `$${value.toLocaleString()}`;
    case "gdpPerCapita":
      return `$${Math.round(value).toLocaleString()}`;
  }
}

function scaleRadius(value: number, min: number, max: number, baseRadius: number): number {
  if (max === min) return baseRadius;
  const normalized = (value - min) / (max - min);
  return 8 + normalized * 20; // 8–28 range
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AsiaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<unknown>(null);
  const circleRefs = useRef<Map<string, ReturnType<typeof import("leaflet")["circleMarker"]>>>(new Map());
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MapMetric>("totalPopulation");
  const [metricOpen, setMetricOpen] = useState(false);
  const router = useRouter();

  const { startYear, endYear } = useYearRangeStore();
  const dateRange = startYear !== null && endYear !== null ? { start: startYear, end: endYear } : undefined;
  const swrKey = `map-wb-${startYear ?? "latest"}-${endYear ?? "latest"}`;

  const { data: wbBySlug, isLoading: wbLoading } = useSWR(
    swrKey,
    async () => {
      const data = await fetchMultipleCitiesWBData(WB_CITY_LIST, dateRange);
      return Object.fromEntries(data.map((d) => [d.citySlug, d]));
    },
    { revalidateOnFocus: false }
  );

  // ── Map init (runs once) ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (leafletRef.current) return;

    // Prevent the async .then() from running after React StrictMode's cleanup cycle
    let didCleanup = false;
    let map: ReturnType<typeof import("leaflet")["map"]> | undefined;

    import("leaflet").then((L) => {
      if (didCleanup || !mapRef.current) return;

      // @ts-expect-error - Leaflet icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
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

      CITIES.forEach((city) => {
        const radius = city.isMegacity ? 16 : city.cityTier === 1 ? 12 : 9;
        const color = regionColor(city.region);
        const hasLive = WB_CITIES.has(city.slug);

        const circle = L.circleMarker([city.latitude, city.longitude], {
          radius,
          fillColor: color,
          color: hasLive ? "white" : "rgba(255,255,255,0.4)",
          weight: hasLive ? 2.5 : 1.5,
          opacity: 1,
          fillOpacity: hasLive ? 0.8 : 0.45,
        }).addTo(map!);

        circleRefs.current.set(city.slug, circle);

        circle.on(
          "mouseover",
          (e: { containerPoint: { x: number; y: number } }) => {
            setTooltip({ city, x: e.containerPoint.x, y: e.containerPoint.y });
            circle.setStyle({ fillOpacity: 1, weight: 3 });
          }
        );
        circle.on("mouseout", () => {
          setTooltip(null);
          circle.setStyle({
            fillOpacity: hasLive ? 0.8 : 0.45,
            weight: hasLive ? 2.5 : 1.5,
          });
        });
        circle.on("click", () => {
          router.push(`/cities/${city.slug}`);
        });

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
      didCleanup = true;
      map?.remove();
      leafletRef.current = null;
      circleRefs.current.clear();
    };
  }, [router]);

  // ── Circle update when data or metric changes ─────────────────────────────────
  useEffect(() => {
    if (!wbBySlug || circleRefs.current.size === 0) return;

    // Compute min/max for normalization
    const values = WB_CITY_LIST
      .map((c) => getMetricValue(wbBySlug[c.slug], selectedMetric))
      .filter((v): v is number => v !== null);

    if (values.length === 0) return;
    const min = Math.min(...values);
    const max = Math.max(...values);

    CITIES.forEach((city) => {
      const circle = circleRefs.current.get(city.slug);
      if (!circle) return;
      if (!WB_CITIES.has(city.slug)) return;

      const value = getMetricValue(wbBySlug[city.slug], selectedMetric);
      if (value === null) return;

      const baseRadius = city.isMegacity ? 16 : 12;
      const radius = scaleRadius(value, min, max, baseRadius);
      circle.setRadius(radius);
      circle.setStyle({ fillOpacity: 0.85 });
    });
  }, [wbBySlug, selectedMetric]);

  const metricLabel = METRIC_OPTIONS.find((m) => m.value === selectedMetric)?.label ?? "";

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
      <div className="absolute top-4 left-4 z-[1000] glass-dark rounded-xl p-3 text-xs text-white/80 space-y-1.5">
        <p className="font-semibold text-white mb-2 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          City Region
        </p>
        {[
          { color: "#6366f1", label: "East Asia" },
          { color: "#14b8a6", label: "Southeast Asia" },
          { color: "#f59e0b", label: "South Asia" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
        <div className="pt-1.5 border-t border-white/20 space-y-1">
          <p className="text-white/60">Brighter + larger = higher metric</p>
          <p className="text-white/50 text-[10px]">WB cities only · others fixed size</p>
        </div>
      </div>

      {/* Controls panel */}
      <div className="absolute top-4 right-4 z-[1000] glass-dark rounded-xl p-3 space-y-3 min-w-[220px]">
        {/* Metric selector */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Metric</p>
          <div className="relative">
            <button
              onClick={() => setMetricOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 text-xs text-white bg-white/10 hover:bg-white/15 rounded-lg px-3 py-2 transition-colors"
            >
              <span>{metricLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${metricOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {metricOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1 left-0 right-0 glass-dark rounded-lg overflow-hidden z-50 shadow-2xl"
                >
                  {METRIC_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSelectedMetric(opt.value); setMetricOpen(false); }}
                      className={`w-full text-left text-xs px-3 py-2 transition-colors hover:bg-white/10 ${selectedMetric === opt.value ? "text-white font-semibold bg-white/10" : "text-white/70"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Year range */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Year Range</p>
          <div className="[&_select]:bg-white/10 [&_select]:text-white [&_select]:border-white/20 [&_span]:text-white/60 [&_button]:text-white/60 [&_button]:border-white/20">
            <YearRangePicker />
          </div>
          {wbLoading && (
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Fetching WB data…
            </p>
          )}
        </div>
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
            style={{ left: tooltip.x + 16, top: tooltip.y - 40 }}
          >
            <div className="glass-dark rounded-xl p-3 text-white min-w-[200px] shadow-2xl">
              <p className="font-bold text-sm">{tooltip.city.name}</p>
              <p className="text-xs text-white/60 mb-2">
                {tooltip.city.country} · {tooltip.city.region}
              </p>
              <p className="text-xs text-white/70 line-clamp-2 mb-2">
                {tooltip.city.description}
              </p>
              {WB_CITIES.has(tooltip.city.slug) ? (
                <>
                  <div className="border-t border-white/10 pt-2 space-y-1">
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">{metricLabel}</p>
                    <p className="text-sm font-semibold text-emerald-400">
                      {formatMetricValue(
                        getMetricValue(wbBySlug?.[tooltip.city.slug], selectedMetric),
                        selectedMetric
                      )}
                    </p>
                    {(startYear && endYear) && (
                      <p className="text-[10px] text-white/40">{startYear}–{endYear}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live World Bank data
                  </p>
                </>
              ) : (
                <p className="text-[10px] text-white/40 mt-2 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Data coming soon
                </p>
              )}
              <p className="text-[10px] text-white/40 mt-1">Click to open dashboard →</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

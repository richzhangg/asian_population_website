"use client";
import { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  MapPin,
  Building2,
  TrendingUp,
  ExternalLink,
  Info,
  BookOpen,
  X,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
} from "lucide-react";
import DownloadPDFButton from "@/components/ui/DownloadPDFButton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { City } from "@/types/city";
import type { WorldBankCityData, WorldBankEconomicData, WorldBankIndicatorValue } from "@/types/worldbank";

async function fetchCityDataFromAPI(slug: string, start: number, end: number): Promise<WorldBankCityData> {
  const res = await fetch(`/api/city-data?slug=${slug}&start=${start}&end=${end}`);
  if (!res.ok) throw new Error(`Failed to fetch city data: ${res.status}`);
  return res.json() as Promise<WorldBankCityData>;
}
import { useYearRangeStore } from "@/lib/store/yearRangeStore";
import YearRangePicker from "@/components/ui/YearRangePicker";

interface Props {
  city: City;
  wbData: WorldBankCityData;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtLarge(n: number | null): string {
  if (n === null) return "N/A";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(1);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IndicatorCard({
  icon: Icon,
  label,
  indicator,
  valueDisplay,
  unit,
  colorBg,
  colorText,
}: {
  icon: React.ElementType;
  label: string;
  indicator: WorldBankIndicatorValue;
  valueDisplay: string;
  unit?: string;
  colorBg: string;
  colorText: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorBg}`}
        >
          <Icon className={`w-5 h-5 ${colorText}`} />
        </div>
        {indicator.year && (
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 tabular-nums">
            {indicator.year}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-3xl font-bold mt-1 tabular-nums leading-none">
          {valueDisplay}
          {unit && indicator.value !== null && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {unit}
            </span>
          )}
        </p>
        <p className="text-[11px] text-muted-foreground/70 mt-1.5 line-clamp-1">
          {indicator.indicatorId}
        </p>
      </div>
    </div>
  );
}

function PopChart({
  history,
  countryName,
}: {
  history: Array<{ year: number; value: number }>;
  countryName: string;
}) {
  if (!history.length) return null;

  const startYear = history[0].year;
  const endYear = history[history.length - 1].year;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
        {countryName} · Total Population {startYear}–{endYear}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={history}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="wbPopGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => fmtLarge(v)}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0]?.value;
              return (
                <div className="glass-card rounded-xl px-3 py-2 text-sm shadow-xl">
                  <p className="font-semibold mb-1">{label}</p>
                  <p className="text-muted-foreground">
                    Population:{" "}
                    <span className="text-foreground font-medium">
                      {v != null ? fmtLarge(v as number) : "—"}
                    </span>
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#wbPopGradient)"
            dot={{ fill: "#6366f1", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-3 text-right">
        Source: World Bank · SP.POP.TOTL
      </p>
    </div>
  );
}

// ── Economic sub-components ───────────────────────────────────────────────────

function GdpChart({
  history,
  countryName,
}: {
  history: Array<{ year: number; value: number }>;
  countryName: string;
}) {
  if (!history.length) return null;
  const startYear = history[0].year;
  const endYear = history[history.length - 1].year;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
        {countryName} · GDP (Current USD) {startYear}–{endYear}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={history}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="wbGdpGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `$${fmtLarge(v)}`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0]?.value;
              return (
                <div className="glass-card rounded-xl px-3 py-2 text-sm shadow-xl">
                  <p className="font-semibold mb-1">{label}</p>
                  <p className="text-muted-foreground">
                    GDP:{" "}
                    <span className="text-foreground font-medium">
                      {v != null ? `$${fmtLarge(v as number)}` : "—"}
                    </span>
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#wbGdpGradient)"
            dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "#10b981" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-3 text-right">
        Source: World Bank · NY.GDP.MKTP.CD
      </p>
    </div>
  );
}

function EconomicSection({ eco, countryName }: { eco: WorldBankEconomicData; countryName: string }) {
  function fmtGdp(v: number | null): string {
    if (v === null) return "N/A";
    if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    return `$${fmtLarge(v)}`;
  }

  const cards = [
    {
      icon: DollarSign,
      label: "GDP",
      indicator: eco.gdp,
      valueDisplay: fmtGdp(eco.gdp.value),
      colorBg: "bg-emerald-500/10",
      colorText: "text-emerald-500",
    },
    {
      icon: BarChart3,
      label: "GDP per Capita",
      indicator: eco.gdpPerCapita,
      valueDisplay: eco.gdpPerCapita.value !== null ? `$${Math.round(eco.gdpPerCapita.value).toLocaleString()}` : "N/A",
      colorBg: "bg-teal-500/10",
      colorText: "text-teal-500",
    },
    {
      icon: eco.gdpGrowth.value !== null && eco.gdpGrowth.value >= 0 ? ArrowUpRight : ArrowDownRight,
      label: "GDP Growth",
      indicator: eco.gdpGrowth,
      valueDisplay: eco.gdpGrowth.value !== null ? `${eco.gdpGrowth.value.toFixed(2)}%` : "N/A",
      colorBg: eco.gdpGrowth.value !== null && eco.gdpGrowth.value >= 0 ? "bg-green-500/10" : "bg-red-500/10",
      colorText: eco.gdpGrowth.value !== null && eco.gdpGrowth.value >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      icon: Briefcase,
      label: "Unemployment",
      indicator: eco.unemployment,
      valueDisplay: eco.unemployment.value !== null ? `${eco.unemployment.value.toFixed(1)}%` : "N/A",
      colorBg: "bg-orange-500/10",
      colorText: "text-orange-500",
    },
    {
      icon: TrendingUp,
      label: "Inflation (CPI)",
      indicator: eco.inflation,
      valueDisplay: eco.inflation.value !== null ? `${eco.inflation.value.toFixed(2)}%` : "N/A",
      colorBg: "bg-rose-500/10",
      colorText: "text-rose-500",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        Economic Indicators
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <IndicatorCard key={card.label} {...card} />
        ))}
      </div>

      {eco.gdpHistory.length > 0 && (
        <GdpChart history={eco.gdpHistory} countryName={countryName} />
      )}

      {/* Economic reference table */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Economic Data Reference</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2 pr-4 font-medium">Indicator</th>
                <th className="pb-2 pr-4 font-medium">Code</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Value</th>
                <th className="pb-2 font-medium tabular-nums">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: "GDP (current USD)", indicator: eco.gdp, display: fmtGdp(eco.gdp.value) },
                { name: "GDP per capita (current USD)", indicator: eco.gdpPerCapita, display: eco.gdpPerCapita.value !== null ? `$${Math.round(eco.gdpPerCapita.value).toLocaleString()}` : "N/A" },
                { name: "GDP growth (annual %)", indicator: eco.gdpGrowth, display: eco.gdpGrowth.value !== null ? `${eco.gdpGrowth.value.toFixed(2)}%` : "N/A" },
                { name: "Unemployment (% of labor force)", indicator: eco.unemployment, display: eco.unemployment.value !== null ? `${eco.unemployment.value.toFixed(1)}%` : "N/A" },
                { name: "Inflation, consumer prices (annual %)", indicator: eco.inflation, display: eco.inflation.value !== null ? `${eco.inflation.value.toFixed(2)}%` : "N/A" },
              ].map((row) => (
                <tr key={row.indicator.indicatorId}>
                  <td className="py-2.5 pr-4 text-foreground">{row.name}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{row.indicator.indicatorId}</td>
                  <td className="py-2.5 pr-4 font-semibold tabular-nums">{row.display}</td>
                  <td className="py-2.5 text-muted-foreground tabular-nums">{row.indicator.year ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Summary modal ─────────────────────────────────────────────────────────────

function SummaryModal({
  city,
  onClose,
}: {
  city: Props["city"];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="glass-card rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{city.name}</h2>
              <p className="text-sm text-muted-foreground">{city.country} · {city.region}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {city.summary}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WorldBankDashboard({ city, wbData: initialData }: Props) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const { startYear, endYear } = useYearRangeStore();
  const hasCustomRange = startYear !== null && endYear !== null;

  const { data: freshData, isLoading: isRefreshing } = useSWR(
    hasCustomRange ? `wb-city-${city.slug}-${startYear}-${endYear}` : null,
    () => fetchCityDataFromAPI(city.slug, startYear!, endYear!),
    { revalidateOnFocus: false }
  );

  const wbData = freshData ?? initialData;

  const {
    countryName,
    countryCode,
    totalPopulation,
    populationDensity,
    urbanPopulation,
    urbanPopulationPercent,
    populationHistory,
    economicData,
    fetchedAt,
  } = wbData;

  const indicators = [
    {
      icon: Users,
      label: "Total Population",
      indicator: totalPopulation,
      valueDisplay: fmtLarge(totalPopulation.value),
      colorBg: "bg-blue-500/10",
      colorText: "text-blue-500",
    },
    {
      icon: MapPin,
      label: "Population Density",
      indicator: populationDensity,
      valueDisplay:
        populationDensity.value !== null
          ? populationDensity.value.toFixed(1)
          : "N/A",
      unit: "per km²",
      colorBg: "bg-indigo-500/10",
      colorText: "text-indigo-500",
    },
    {
      icon: Building2,
      label: "Urban Population",
      indicator: urbanPopulation,
      valueDisplay: fmtLarge(urbanPopulation.value),
      colorBg: "bg-teal-500/10",
      colorText: "text-teal-500",
    },
    {
      icon: TrendingUp,
      label: "Urbanization Rate",
      indicator: urbanPopulationPercent,
      valueDisplay:
        urbanPopulationPercent.value !== null
          ? `${urbanPopulationPercent.value.toFixed(1)}%`
          : "N/A",
      colorBg: "bg-amber-500/10",
      colorText: "text-amber-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {summaryOpen && city.summary && (
        <SummaryModal city={city} onClose={() => setSummaryOpen(false)} />
      )}

      {/* City header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden h-56 sm:h-72"
      >
        {city.thumbnailUrl ? (
          <Image
            src={city.thumbnailUrl}
            alt={city.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <h1 className="text-white text-3xl sm:text-5xl font-bold">
              {city.name}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {countryName} · {city.region}
            </p>
            <p className="text-white/60 text-sm mt-2 max-w-lg hidden sm:block">
              {city.description}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {city.isMegacity && (
              <Badge className="bg-blue-500 text-white border-0">Megacity</Badge>
            )}
            <Badge
              variant="outline"
              className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs"
            >
              Urban Agglomeration
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Live data badge + year range picker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="space-y-3"
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-3 py-1 font-medium text-xs">
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isRefreshing ? "animate-ping" : "animate-pulse"}`} />
            {isRefreshing ? "Fetching…" : "UN WUP 2022 · World Bank"}
          </span>
          <span className="text-muted-foreground text-xs">
            City-level data for {city.name} · fetched{" "}
            {new Date(fetchedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <a
            href="https://population.un.org/wup/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            UN World Urbanization Prospects
            <ExternalLink className="w-3 h-3" />
          </a>
          {city.summary && (
            <button
              onClick={() => setSummaryOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/60 rounded-full px-3 py-1 transition-colors hover:border-border"
            >
              <BookOpen className="w-3 h-3" />
              About {city.name}
            </button>
          )}
        </div>

        {/* Year range picker */}
        <div className="glass-card rounded-xl px-4 py-3">
          <YearRangePicker />
        </div>
      </motion.div>

      {/* Indicator cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {indicators.map((ind) => (
          <IndicatorCard key={ind.label} {...ind} />
        ))}
      </motion.div>

      {/* Population history chart */}
      {populationHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <PopChart history={populationHistory} countryName={countryName} />
        </motion.div>
      )}

      {/* Economic indicators */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <EconomicSection eco={economicData} countryName={countryName} />
      </motion.div>

      {/* Indicator reference table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Data Reference</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2 pr-4 font-medium">Indicator</th>
                <th className="pb-2 pr-4 font-medium">Code</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Value</th>
                <th className="pb-2 font-medium tabular-nums">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: "Population, total", indicator: totalPopulation, display: fmtLarge(totalPopulation.value) },
                { name: "Population density (people per km²)", indicator: populationDensity, display: populationDensity.value !== null ? `${populationDensity.value.toFixed(1)} / km²` : "N/A" },
                { name: "Urban population", indicator: urbanPopulation, display: fmtLarge(urbanPopulation.value) },
                { name: "Urban population (% of total)", indicator: urbanPopulationPercent, display: urbanPopulationPercent.value !== null ? `${urbanPopulationPercent.value.toFixed(1)}%` : "N/A" },
              ].map((row) => (
                <tr key={row.indicator.indicatorId}>
                  <td className="py-2.5 pr-4 text-foreground">{row.name}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">
                    {row.indicator.indicatorId}
                  </td>
                  <td className="py-2.5 pr-4 font-semibold tabular-nums">
                    {row.display}
                  </td>
                  <td className="py-2.5 text-muted-foreground tabular-nums">
                    {row.indicator.year ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 border-t border-border grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Population source:</span>{" "}
            UN World Urbanization Prospects 2022
          </p>
          <p>
            <span className="font-medium text-foreground">Economics source:</span>{" "}
            World Bank Open Data ({countryCode})
          </p>
          <p>
            <span className="font-medium text-foreground">Note:</span>{" "}
            Population figures are city/agglomeration level from UN World
            Urbanization Prospects 2022. Economic indicators (GDP, unemployment,
            inflation) are country-level from the World Bank.
          </p>
          <p>
            <span className="font-medium text-foreground">Update cycle:</span>{" "}
            Cached 24 hours · underlying WB data updated annually
          </p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link href="/compare" className="flex-1">
          <Button variant="gradient" className="w-full gap-2">
            <TrendingUp className="w-4 h-4" />
            Compare Cities
          </Button>
        </Link>
        <a
          href="https://population.un.org/wup/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="outline" className="w-full gap-2">
            <ExternalLink className="w-4 h-4" />
            View UN World Urbanization Prospects
          </Button>
        </a>
        <DownloadPDFButton mode="city" city={city} wbData={wbData} />
      </motion.div>
    </div>
  );
}

"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CITIES, MOCK_DASHBOARDS } from "@/lib/data/mockCities";
import { formatPopulation, formatCurrency } from "@/lib/utils/formatters";

const PREVIEW_CITIES = CITIES.slice(0, 5);

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
  if (value < 0) return <TrendingDown className="w-3 h-3 text-rose-500" />;
  return <Minus className="w-3 h-3 text-slate-400" />;
}

export default function CityPreview() {
  const [active, setActive] = useState(PREVIEW_CITIES[0]);
  const dashboard = MOCK_DASHBOARDS[active.slug];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Featured Cities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Live City Snapshots
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Click any city to preview key urban transformation metrics.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* City selector pills */}
          <div className="lg:col-span-2 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {PREVIEW_CITIES.map((city) => (
              <button
                key={city.slug}
                onClick={() => setActive(city)}
                className={`flex-shrink-0 lg:flex-shrink text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                  active.slug === city.slug
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40 hover:bg-accent"
                }`}
              >
                <p className="font-semibold text-sm">{city.name}</p>
                <p className="text-xs text-muted-foreground">{city.country}</p>
              </button>
            ))}
          </div>

          {/* Dashboard preview */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {dashboard && (
                <motion.div
                  key={active.slug}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  {/* City image header */}
                  <div className="relative h-40 sm:h-52">
                    {active.thumbnailUrl ? (
                      <Image
                        src={active.thumbnailUrl}
                        alt={active.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h3 className="text-white text-2xl font-bold">
                          {active.name}
                        </h3>
                        <p className="text-white/70 text-sm">{active.country} · {active.region}</p>
                      </div>
                      <Badge variant="info" className="bg-white/20 text-white border-white/30">
                        {active.isMegacity ? "Megacity" : "Major City"}
                      </Badge>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Population",
                        value: formatPopulation(dashboard.latestPopulation.totalPopulation),
                        change: dashboard.latestPopulation.growthRate,
                        unit: "%/yr",
                      },
                      {
                        label: "Median Age",
                        value: `${dashboard.latestDemographics.medianAge}`,
                        change: 0,
                        unit: "years",
                      },
                      {
                        label: "Avg Price/m²",
                        value: formatCurrency(dashboard.latestHousing.avgPricePerSqm, 0),
                        change: 5.2,
                        unit: "YoY",
                      },
                      {
                        label: "GDP per Capita",
                        value: formatCurrency(dashboard.latestEconomic.gdpPerCapitaUsd, 0),
                        change: dashboard.latestEconomic.gdpGrowthRate,
                        unit: "%/yr",
                      },
                      {
                        label: "Unemployment",
                        value: `${dashboard.latestEconomic.unemploymentRate}%`,
                        change: -0.3,
                        unit: "YoY",
                      },
                      {
                        label: "Fertility Rate",
                        value: `${dashboard.latestDemographics.fertilityRate}`,
                        change: -0.08,
                        unit: "births/woman",
                      },
                    ].map((m) => (
                      <div key={m.label} className="space-y-1">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-lg font-bold">{m.value}</p>
                        <div className="flex items-center gap-1">
                          <TrendIcon value={m.change} />
                          <span
                            className={`text-xs ${
                              m.change > 0
                                ? "text-emerald-500"
                                : m.change < 0
                                ? "text-rose-500"
                                : "text-slate-400"
                            }`}
                          >
                            {m.change > 0 ? "+" : ""}{m.change.toFixed(2)} {m.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="px-5 pb-5">
                    <Link href={`/cities/${active.slug}`} className="block">
                      <Button variant="gradient" className="w-full gap-2">
                        Full Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

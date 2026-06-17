"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CITIES } from "@/lib/data/mockCities";
import type { WorldBankCityData } from "@/types/worldbank";

interface Props {
  wbBySlug?: Record<string, WorldBankCityData>;
}

// Show the 4 WB target cities in the preview
const PREVIEW_SLUGS = ["tokyo", "seoul", "shanghai", "hong-kong"];
const PREVIEW_CITIES = CITIES.filter((c) => PREVIEW_SLUGS.includes(c.slug));

function fmtLarge(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(1);
}

export default function CityPreview({ wbBySlug = {} }: Props) {
  const [active, setActive] = useState(PREVIEW_CITIES[0]);
  const wb = wbBySlug[active.slug];

  const metrics = wb
    ? [
        {
          label: "Total Population",
          value: fmtLarge(wb.totalPopulation.value),
          sub: `${wb.totalPopulation.year ?? "latest"} · SP.POP.TOTL`,
        },
        {
          label: "Pop. Density",
          value:
            wb.populationDensity.value != null
              ? `${wb.populationDensity.value.toFixed(1)}/km²`
              : "—",
          sub: `${wb.populationDensity.year ?? "latest"} · EN.POP.DNST`,
        },
        {
          label: "Urban Population",
          value: fmtLarge(wb.urbanPopulation.value),
          sub: `${wb.urbanPopulation.year ?? "latest"} · SP.URB.TOTL`,
        },
        {
          label: "Urbanization Rate",
          value:
            wb.urbanPopulationPercent.value != null
              ? `${wb.urbanPopulationPercent.value.toFixed(1)}%`
              : "—",
          sub: `${wb.urbanPopulationPercent.year ?? "latest"} · SP.URB.TOTL.IN.ZS`,
        },
        {
          label: "Country",
          value: wb.countryName,
          sub: wb.countryCode,
        },
        {
          label: "Source",
          value: "World Bank",
          sub: "data.worldbank.org",
        },
      ]
    : null;

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
            Real population and urbanization data from the World Bank for
            Asia&apos;s four most tracked economies.
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
                      <p className="text-white/70 text-sm">
                        {active.country} · {active.region}
                      </p>
                    </div>
                    <Badge
                      variant="info"
                      className="bg-white/20 text-white border-white/30"
                    >
                      {active.isMegacity ? "Megacity" : "Major City"}
                    </Badge>
                  </div>
                </div>

                {/* Metrics */}
                {metrics ? (
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {metrics.map((m) => (
                      <div key={m.label} className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          {m.label}
                        </p>
                        <p className="text-lg font-bold tabular-nums">
                          {m.value}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 font-mono">
                          {m.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 flex items-center gap-2 text-muted-foreground text-sm">
                    <Database className="w-4 h-4" />
                    <span>Loading World Bank data…</span>
                  </div>
                )}

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
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
